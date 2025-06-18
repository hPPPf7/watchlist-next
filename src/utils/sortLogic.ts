// src/utils/sortLogic.ts

import type { Film } from '@/types/Film';

type 清單資料 = Record<string, Film>;

export interface WatchItem {
  id: string;
  item: Film;
  最後觀看時間: number;
  新集?: boolean;
}

export function 分類排序觀看進度(清單: 清單資料) {
  const 有新集數未看: WatchItem[] = [];
  const 有紀錄中: WatchItem[] = [];
  const 已看完: WatchItem[] = [];
  const 尚未看過: { id: string; item: Film }[] = [];

  for (const [id, item] of Object.entries(清單)) {
    const 已看集 = Object.entries(item.已看紀錄?.episodes ?? {})
      .filter(([, v]) => !!v)
      .map(([k]) => k);
    const 最後觀看時間 = item.最後觀看時間 ? new Date(item.最後觀看時間).getTime() : 0;

    if (已看集.length === 0) {
      尚未看過.push({ id, item });
      continue;
    }

    const 總集數 = item.詳細?.number_of_episodes ?? item.集數 ?? 0;
    const 有新集 =
      item.詳細?.number_of_episodes && item.集數 && item.詳細.number_of_episodes > item.集數;

    if (總集數 > 0 && 已看集.length >= 總集數 && !有新集) {
      已看完.push({ id, item, 最後觀看時間 });
    } else if (有新集) {
      有新集數未看.push({ id, item, 最後觀看時間, 新集: true });
    } else if (已看集.length > 0) {
      有紀錄中.push({ id, item, 最後觀看時間 });
    }
  }

  有新集數未看.sort((a, b) => b.最後觀看時間 - a.最後觀看時間);
  有紀錄中.sort((a, b) => b.最後觀看時間 - a.最後觀看時間);
  已看完.sort((a, b) => a.最後觀看時間 - b.最後觀看時間);

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
