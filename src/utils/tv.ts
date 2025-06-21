export interface NextEpisode {
  season: number;
  episode: number;
  name?: string;
  airDate?: string;
}

import type { Film } from '@/types/Film';
import { tmdbFetch } from '@/lib/api';

const seasonCache = new Map<string, any[]>();

export async function getNextEpisodeInfo(item: Film): Promise<NextEpisode | null> {
  const seasons = (item.詳細?.seasons || [])
    .filter((s: any) => s.season_number > 0)
    .sort((a: any, b: any) => a.season_number - b.season_number);

  const watched = new Set(
    Object.entries(item.已看紀錄?.episodes || {})
      .filter(([, v]) => !!v)
      .map(([k]) => k),
  );

  for (const season of seasons) {
    const seasonNum = season.season_number;
    const count = season.episode_count || 0;
    for (let ep = 1; ep <= count; ep++) {
      const key = `${seasonNum}-${ep}`;
      if (!watched.has(key)) {
        let name: string | undefined;
        let airDate: string | undefined;
        const next = item.詳細?.next_episode_to_air;
        const last = item.詳細?.last_episode_to_air;
        if (next && next.season_number === seasonNum && next.episode_number === ep) {
          name = next.name;
          airDate = next.air_date;
        } else if (last && last.season_number === seasonNum && last.episode_number === ep) {
          name = last.name;
          airDate = last.air_date;
        }
        if (!name) {
          const cacheKey = `${item.tmdbId}-${seasonNum}`;
          let episodes = seasonCache.get(cacheKey);
          if (!episodes) {
            try {
              const data = await tmdbFetch<{ episodes: any[] }>(
                `/tv/${item.tmdbId}/season/${seasonNum}`,
              );
              episodes = data.episodes || [];
            } catch (err) {
              console.warn('⚠️ 載入集數資料失敗', err);
              episodes = [];
            }
            seasonCache.set(cacheKey, episodes);
          }
          const epInfo = episodes.find((e: any) => e.episode_number === ep);
          name = epInfo?.name;
          airDate = epInfo?.air_date;
        }
        return { season: seasonNum, episode: ep, name, airDate };
      }
    }
  }

  if (item.詳細?.next_episode_to_air) {
    const n = item.詳細.next_episode_to_air;
    return {
      season: n.season_number,
      episode: n.episode_number,
      name: n.name,
      airDate: n.air_date,
    };
  }

  return null;
}

export function invalidateSeasonCache(tvId?: number) {
  if (tvId == null) {
    seasonCache.clear();
    return;
  }
  for (const key of Array.from(seasonCache.keys())) {
    if (key.startsWith(`${tvId}-`)) {
      seasonCache.delete(key);
    }
  }
}

export interface EpisodeInfo {
  season: number;
  episode: number;
  name?: string;
  air_date?: string;
}

export async function getUpcomingEpisodes(item: Film): Promise<EpisodeInfo[]> {
  const seasons = (item.詳細?.seasons || [])
    .filter((s: any) => s.season_number > 0)
    .sort((a: any, b: any) => a.season_number - b.season_number);

  const watched = new Set(
    Object.entries(item.已看紀錄?.episodes || {})
      .filter(([, v]) => !!v)
      .map(([k]) => k),
  );

  const results: EpisodeInfo[] = [];
  const today = new Date();

  for (const season of seasons) {
    const seasonNum = season.season_number;
    const cacheKey = `${item.tmdbId}-${seasonNum}`;
    let episodes = seasonCache.get(cacheKey);
    if (!episodes) {
      try {
        const data = await tmdbFetch<{ episodes: any[] }>(`/tv/${item.tmdbId}/season/${seasonNum}`);
        episodes = data.episodes || [];
      } catch (err) {
        console.warn('⚠️ 載入集數資料失敗', err);
        episodes = [];
      }
      seasonCache.set(cacheKey, episodes);
    }

    for (const ep of episodes) {
      if (!ep.air_date) continue;
      const d = new Date(ep.air_date);
      if (isNaN(d.getTime()) || d <= today) continue;
      const key = `${seasonNum}-${ep.episode_number}`;
      if (watched.has(key)) continue;
      results.push({
        season: seasonNum,
        episode: ep.episode_number,
        name: ep.name,
        air_date: ep.air_date,
      });
    }
  }

  results.sort((a, b) => new Date(a.air_date || 0).getTime() - new Date(b.air_date || 0).getTime());
  return results;
}

export async function getUnwatchedSpecialEpisodes(item: Film): Promise<EpisodeInfo[]> {
  const specialSeason = (item.詳細?.seasons || []).find((s: any) => s.season_number === 0);
  if (!specialSeason) return [];

  const watched = new Set(
    Object.entries(item.已看紀錄?.episodes || {})
      .filter(([, v]) => !!v)
      .map(([k]) => k),
  );

  const cacheKey = `${item.tmdbId}-0`;
  let episodes = seasonCache.get(cacheKey);
  if (!episodes) {
    try {
      const data = await tmdbFetch<{ episodes: any[] }>(`/tv/${item.tmdbId}/season/0`);
      episodes = data.episodes || [];
    } catch (err) {
      console.warn('⚠️ 載入特別篇集數失敗', err);
      episodes = [];
    }
    seasonCache.set(cacheKey, episodes);
  }

  return episodes
    .filter((ep: any) => {
      const key = `0-${ep.episode_number}`;
      return !watched.has(key);
    })
    .map((ep: any) => ({
      season: 0,
      episode: ep.episode_number,
      name: ep.name,
      air_date: ep.air_date,
    }));
}
