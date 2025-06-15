// src/utils/sortLogic.ts

import type { Film } from '@/types/Film';

type 清單資料 = Record<string, Film>;

export function 分類排序觀看進度(清單: 清單資料) {
  const 有新集數未看: { id: string; item: Film; 最後觀看時間: number }[] = [];
  const 有紀錄中: { id: string; item: Film; 最後觀看時間: number }[] = [];
  const 尚未看過: { id: string; item: Film }[] = [];

  for (const [id, item] of Object.entries(清單)) {
    const 已看集 = Object.keys(item.已看紀錄?.episodes ?? {});
    const 最後觀看時間 = item.最後觀看時間 ? new Date(item.最後觀看時間).getTime() : 0;

    if (已看集.length > 0 && item.集數 && item.季數) {
      有新集數未看.push({ id, item, 最後觀看時間 });
    } else if (已看集.length > 0) {
      有紀錄中.push({ id, item, 最後觀看時間 });
    } else {
      尚未看過.push({ id, item });
    }
  }

  有新集數未看.sort((a, b) => b.最後觀看時間 - a.最後觀看時間);
  有紀錄中.sort((a, b) => b.最後觀看時間 - a.最後觀看時間);

  return { 有新集數未看, 有紀錄中, 尚未看過 };
}

export function 排序依上映日(清單: 清單資料) {
  return Object.entries(清單)
    .filter(([_, item]) => item.上映日)
    .sort((a, b) => new Date(a[1].上映日 ?? 0).getTime() - new Date(b[1].上映日 ?? 0).getTime());
}

export function 排序依加入時間(清單: 清單資料) {
  return Object.entries(清單).sort(
    (a, b) => new Date(b[1].加入時間 ?? 0).getTime() - new Date(a[1].加入時間 ?? 0).getTime(),
  );
}
