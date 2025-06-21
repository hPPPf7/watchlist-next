// src/utils/sortLogic.ts

import type { Film } from '@/types/Film';

type 清單資料 = Record<string, Film>;

export interface WatchItem {
  id: string;
  item: Film;
  最後觀看時間: number;
  新集?: boolean;
}

function getAiredEpisodes(detail: any): number {
  if (!detail) return 0;
  let last = detail.last_episode_to_air;
  const next = detail.next_episode_to_air;

  if (!last) {
    return detail.number_of_episodes ?? 0;
  }
  // Sometimes TMDB 更新 last_episode_to_air 較慢，
  // 若下一集的播出日已過，視為已播出
  if (next && next.air_date) {
    const airDate = new Date(next.air_date);
    if (!isNaN(airDate.getTime()) && airDate <= new Date()) {
      last = next;
    }
  }
  const seasons = detail.seasons || [];
  let count = 0;
  for (const s of seasons) {
    if (s.season_number <= 0) continue;
    if (s.season_number < last.season_number) {
      count += s.episode_count || 0;
    } else if (s.season_number === last.season_number) {
      count += last.episode_number;
    }
  }
  return count;
}

export function 分類排序觀看進度(清單: 清單資料) {
  const 有新集數未看: WatchItem[] = [];
  const 有紀錄中: WatchItem[] = [];
  const 已看完: WatchItem[] = [];
  const 尚未看過: { id: string; item: Film }[] = [];

  function extractTime(raw: any): number {
    const value = raw && typeof raw === 'object' && 'watchDate' in raw ? raw.watchDate : raw;
    if (value && typeof value.toDate === 'function') {
      return value.toDate().getTime();
    }
    return value ? new Date(value).getTime() : 0;
  }

  for (const [id, item] of Object.entries(清單)) {
    const 已看集 = Object.entries(item.已看紀錄?.episodes ?? {})
      .filter(([, v]) => !!v)
      .map(([k]) => k);
    const episodeTimes = Object.values(item.已看紀錄?.episodes ?? {})
      .filter(Boolean)
      .map((v) => extractTime(v));

    let 最後觀看時間 = item.最後觀看時間 ? new Date(item.最後觀看時間).getTime() : 0;
    if (episodeTimes.length > 0) {
      最後觀看時間 = Math.max(最後觀看時間, ...episodeTimes);
    }

    if (已看集.length === 0) {
      尚未看過.push({ id, item });
      continue;
    }

    const 已播集數 = getAiredEpisodes(item.詳細);

    if (已看集.length >= 已播集數) {
      已看完.push({ id, item, 最後觀看時間 });
    } else {
      const 曾經看完 = item.集數 != null && 已看集.length >= item.集數;
      const 新集 = 曾經看完 && 已播集數 > item.集數!;
      if (新集) {
        有新集數未看.push({ id, item, 最後觀看時間, 新集: true });
      } else {
        有紀錄中.push({ id, item, 最後觀看時間 });
      }
    }
  }

  有新集數未看.sort((a, b) => b.最後觀看時間 - a.最後觀看時間);
  有紀錄中.sort((a, b) => b.最後觀看時間 - a.最後觀看時間);
  已看完.sort((a, b) => a.最後觀看時間 - b.最後觀看時間);
  尚未看過.sort(
    (a, b) => new Date(b.item.加入時間 ?? 0).getTime() - new Date(a.item.加入時間 ?? 0).getTime(),
  );

  return { 有新集數未看, 有紀錄中, 尚未看過, 已看完 };
}

export function 排序依上映日(清單: 清單資料) {
  return Object.entries(清單)
    .filter(([, item]) => item.上映日)
    .sort((a, b) => new Date(a[1].上映日 ?? 0).getTime() - new Date(b[1].上映日 ?? 0).getTime());
}

export function 排序依加入時間(清單: 清單資料) {
  return Object.entries(清單).sort(
    (a, b) => new Date(b[1].加入時間 ?? 0).getTime() - new Date(a[1].加入時間 ?? 0).getTime(),
  );
}
