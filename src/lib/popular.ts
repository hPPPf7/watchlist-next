// src/lib/popular.ts

import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';

/** 🔹 工具函式：取得今天字串 key（如 2025-06-16） */
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function logClick(tmdbId: number, type: 'movie' | 'tv') {
  try {
    const ref = doc(db, 'popularClickLogs', String(tmdbId));
    const today = getTodayKey();
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        countsByDay: { [today]: 1 },
        type,
      });
    } else {
      const data = snap.data();
      const current = data.countsByDay?.[today] || 0;
      await updateDoc(ref, {
        [`countsByDay.${today}`]: current + 1,
        type,
      });
    }
  } catch (err) {
    console.warn('⚠️ logClick 失敗', err);
  }
}

export async function logAddToWatchlist(tmdbId: number, type: 'movie' | 'tv') {
  try {
    const ref = doc(db, 'popularWatchLogs', String(tmdbId));
    const today = getTodayKey();
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        countsByDay: { [today]: 1 },
        type,
      });
    } else {
      const data = snap.data();
      const current = data.countsByDay?.[today] || 0;
      await updateDoc(ref, {
        [`countsByDay.${today}`]: current + 1,
        type,
      });
    }
  } catch (err) {
    console.warn('⚠️ logAddToWatchlist 失敗', err);
  }
}

export async function logWatchedRecord(tmdbId: number, type: 'movie' | 'tv') {
  try {
    const ref = doc(db, 'popularWatchedLogs', String(tmdbId));
    const today = getTodayKey();
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        countsByDay: { [today]: 1 },
        type,
      });
    } else {
      const data = snap.data();
      const current = data.countsByDay?.[today] || 0;
      await updateDoc(ref, {
        [`countsByDay.${today}`]: current + 1,
        type,
      });
    }
  } catch (err) {
    console.warn('⚠️ logWatchedRecord 失敗', err);
  }
}

export async function getPopularWatchedThisWeek(type: 'movie' | 'tv', limit = 10) {
  try {
    const cutoffStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const snapshot = await getDocs(collection(db, 'popularWatchedLogs'));

    const result: { tmdbId: string; count: number }[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.type !== type) return;

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
  } catch (err) {
    console.warn('⚠️ getPopularWatchedThisWeek 失敗', err);
    return [];
  }
}

// 加上參數 type: 'movie' | 'tv'
export async function getPopularThisWeek(type: 'movie' | 'tv', limit = 10) {
  try {
    const cutoffStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const snapshot = await getDocs(collection(db, 'popularClickLogs'));

    const result: { tmdbId: string; count: number }[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.type !== type) return;

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
  } catch (err) {
    console.warn('⚠️ getPopularThisWeek 失敗', err);
    return [];
  }
}

export async function getPopularWatchlistThisWeek(type: 'movie' | 'tv', limit = 10) {
  try {
    const cutoffStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const snapshot = await getDocs(collection(db, 'popularWatchLogs'));

    const result: { tmdbId: string; count: number }[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.type !== type) return;

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
  } catch (err) {
    console.warn('⚠️ getPopularWatchlistThisWeek 失敗', err);
    return [];
  }
}
