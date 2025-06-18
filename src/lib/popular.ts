// src/lib/popular.ts

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/** 🔹 工具函式：取得今天字串 key（如 2025-06-16） */
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function logClick(tmdbId: number, type: 'movie' | 'tv') {
  try {
    const user = getAuth().currentUser;
    const today = getTodayKey();
    const ref = doc(db, 'popularClickLogs', String(tmdbId));
    const recordRef = doc(ref, 'records', `${user?.uid || 'anon'}_${today}`);

    const recordSnap = await getDoc(recordRef);
    const snap = await getDoc(ref);

    if (!recordSnap.exists()) {
      await setDoc(recordRef, { ts: Date.now() });

      const current = snap.exists() ? snap.data().countsByDay?.[today] || 0 : 0;
      await setDoc(ref, { countsByDay: { [today]: current + 1 }, type }, { merge: true });
    }
  } catch (err) {
    console.warn('⚠️ logClick 失敗', err);
  }
}

export async function logAddToWatchlist(tmdbId: number, type: 'movie' | 'tv') {
  try {
    const user = getAuth().currentUser;
    if (!user) return;

    const ref = doc(db, 'popularWatchLogs', String(tmdbId));
    const userRef = doc(ref, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, { ts: Date.now() });

      const today = getTodayKey();
      const snap = await getDoc(ref);
      const current = snap.exists() ? snap.data().countsByDay?.[today] || 0 : 0;

      await setDoc(ref, { countsByDay: { [today]: current + 1 }, type }, { merge: true });
    }
  } catch (err) {
    console.warn('⚠️ logAddToWatchlist 失敗', err);
  }
}

export async function logWatchedRecord(
  tmdbId: number,
  type: 'movie' | 'tv',
  action: 'add' | 'remove' = 'add',
) {
  try {
    const user = getAuth().currentUser;
    const today = getTodayKey();
    const ref = doc(db, 'popularWatchedLogs', String(tmdbId));
    const recordRef = doc(ref, 'records', `${user?.uid || 'anon'}_${today}`);

    const recordSnap = await getDoc(recordRef);
    const snap = await getDoc(ref);
    const current = snap.exists() ? snap.data().countsByDay?.[today] || 0 : 0;

    if (action === 'add') {
      if (recordSnap.exists()) return;
      await setDoc(recordRef, { ts: Date.now() });
      await setDoc(ref, { countsByDay: { [today]: current + 1 }, type }, { merge: true });
    } else {
      if (!recordSnap.exists()) return;
      await deleteDoc(recordRef);
      await setDoc(
        ref,
        { countsByDay: { [today]: Math.max(current - 1, 0) }, type },
        { merge: true },
      );
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
