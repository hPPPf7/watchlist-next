// src/lib/watching.ts

import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';

/** 🔹 取得今天字串 key（例：2025-06-16） */
function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** ✅ 取得近 7 天 "大家都在看"（點擊記錄） */
export async function getPopularThisWeek(limit = 10): Promise<{ tmdbId: string; count: number }[]> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const snapshot = await getDocs(collection(db, 'popularClickLogs'));
  const result: { tmdbId: string; count: number }[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const countsByDay = data.countsByDay || {};
    let count = 0;

    for (const [day, value] of Object.entries(countsByDay)) {
      if (day >= cutoffStr) {
        count += value as number;
      }
    }

    if (count > 0) {
      result.push({ tmdbId: docSnap.id, count });
    }
  });

  return result.sort((a, b) => b.count - a.count).slice(0, limit);
}

/** ✅ 取得近 7 天 "大家感興趣"（加入清單記錄） */
export async function getPopularWatchlistThisWeek(
  limit = 10,
): Promise<{ tmdbId: string; count: number }[]> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const snapshot = await getDocs(collection(db, 'popularWatchLogs'));
  const result: { tmdbId: string; count: number }[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const countsByDay = data.countsByDay || {};
    let count = 0;

    for (const [day, value] of Object.entries(countsByDay)) {
      if (day >= cutoffStr) {
        count += value as number;
      }
    }

    if (count > 0) {
      result.push({ tmdbId: docSnap.id, count });
    }
  });

  return result.sort((a, b) => b.count - a.count).slice(0, limit);
}
