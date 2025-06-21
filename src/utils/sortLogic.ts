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
  const 尚未看過: { id: string; item: Film; 加入時間: number }[] = [];

  function extractTime(raw: any): number {
    const value = raw && typeof raw === 'object' && 'watchDate' in raw ? raw.watchDate : raw;
    if (value && typeof value.toDate === 'function') {
      return value.toDate().getTime();
    }
    return value ? new Date(value).getTime() : 0;
  }

  for (const [id, item] of Object.entries(清單)) {
    const episodesWatched = Object.entries(item.已看紀錄?.episodes ?? {}).filter(([, v]) => !!v);
    const watchTimes = episodesWatched.map(([, v]) => extractTime(v));
    const 最近觀看時間 = watchTimes.length > 0 ? Math.max(...watchTimes) : 0;

    const 加入時間 = item.加入時間 ? new Date(item.加入時間).getTime() : 0;

    const watchedCount = episodesWatched.length;
    const airedCount = getAiredEpisodes(item.詳細);
    const totalCount = item.集數 ?? airedCount;

    if (watchedCount === 0) {
      尚未看過.push({ id, item, 加入時間 });
    } else if (watchedCount >= totalCount && watchedCount >= airedCount) {
      // 看完全部
      已看完.push({ id, item, 最後觀看時間: 最近觀看時間 });
    } else {
      const hasNew = watchedCount >= totalCount && airedCount > totalCount;
      if (hasNew) {
        有新集數未看.push({ id, item, 最後觀看時間: 最近觀看時間, 新集: true });
      } else {
        有紀錄中.push({ id, item, 最後觀看時間: 最近觀看時間 });
      }
    }
  }

  有新集數未看.sort((a, b) => {
    if (b.最後觀看時間 !== a.最後觀看時間) {
      return b.最後觀看時間 - a.最後觀看時間;
    }
    return new Date(b.item.加入時間 ?? 0).getTime() - new Date(a.item.加入時間 ?? 0).getTime();
  });

  有紀錄中.sort((a, b) => {
    if (b.最後觀看時間 !== a.最後觀看時間) {
      return b.最後觀看時間 - a.最後觀看時間;
    }
    // 同天的話，後加的應該排上面
    const 加入時間A = new Date(a.item.加入時間 ?? 0).getTime();
    const 加入時間B = new Date(b.item.加入時間 ?? 0).getTime();
    return 加入時間B - 加入時間A;
  });

  已看完.sort((a, b) => {
    if (a.最後觀看時間 !== b.最後觀看時間) {
      return a.最後觀看時間 - b.最後觀看時間;
    }
    // 同天完成的話，早加入的在上
    const 加入時間A = new Date(a.item.加入時間 ?? 0).getTime();
    const 加入時間B = new Date(b.item.加入時間 ?? 0).getTime();
    return 加入時間A - 加入時間B;
  });

  尚未看過.sort((a, b) => b.加入時間 - a.加入時間); // 最新加入的在上

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
