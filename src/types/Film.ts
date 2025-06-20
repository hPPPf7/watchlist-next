// src/types/Film.ts
import { Timestamp } from 'firebase/firestore';

export interface WatchRecord {
  watchDate: string | Timestamp | null;
  togetherWith?: string[];
}

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

  // ✅ 修正這段，支援 Firebase Timestamp 並加入一起觀看資訊
  已看紀錄?: {
    movie?: WatchRecord | string | Timestamp | null;
    episodes?: Record<string, WatchRecord | string | Timestamp | null>;
  };

  季數?: number;
  集數?: number;
}
