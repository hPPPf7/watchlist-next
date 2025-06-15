// src/types/Film.ts

export interface 已看紀錄 {
  集數: string;
  日期: string;
}

export interface Film {
  tmdbId: number;
  類型: 'movie' | 'tv';
  title: string;
  year?: string;
  封面圖: string;
  背景圖?: string | null;
  上映日?: string;
  詳細?: Record<string, any>;

  加入時間?: string;
  最後觀看時間?: string;

  // ✅ 正確定義儲存格式
  已看紀錄?: {
    movie?: string | null;
    episodes?: Record<string, string | null>;
  };

  季數?: number;
  集數?: number;
}
