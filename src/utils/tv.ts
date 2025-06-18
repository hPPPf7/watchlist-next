export interface NextEpisode {
  season: number;
  episode: number;
  name?: string;
}

import type { Film } from '@/types/Film';

export function getNextEpisodeInfo(item: Film): NextEpisode | null {
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
