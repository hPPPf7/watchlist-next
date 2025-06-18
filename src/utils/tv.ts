export interface NextEpisode {
  season: number;
  episode: number;
  name?: string;
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
        const next = item.詳細?.next_episode_to_air;
        const last = item.詳細?.last_episode_to_air;
        if (next && next.season_number === seasonNum && next.episode_number === ep) {
          name = next.name;
        } else if (last && last.season_number === seasonNum && last.episode_number === ep) {
          name = last.name;
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
        }
        return { season: seasonNum, episode: ep, name };
      }
    }
  }

  if (item.詳細?.next_episode_to_air) {
    const n = item.詳細.next_episode_to_air;
    return { season: n.season_number, episode: n.episode_number, name: n.name };
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
