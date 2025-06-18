import { db, getDocSafe } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { Film } from '@/types/Film';
import { getTMDbDetail } from './api';
import { logAddToWatchlist } from './popular';
import { Timestamp } from 'firebase/firestore';
import { invalidateSeasonCache } from '@/utils/tv';

function getCurrentUser() {
  const auth = getAuth();
  return auth.currentUser;
}

export async function getWatchlist(): Promise<Record<string, any>> {
  const 使用者 = getCurrentUser();
  if (!使用者) throw new Error('未登入');

  const ref = doc(db, 'users', 使用者.uid);
  let snap;
  try {
    snap = await getDoc(ref);
  } catch (err) {
    console.warn('⚠️ 讀取清單失敗', err);
    throw err;
  }
  if (!snap.exists()) return {};

  const 原始清單 = snap.data()?.追蹤清單 || {};
  const 更新清單: Record<string, any> = { ...原始清單 };
  let 有更新 = false;

  for (const [id, rawItem] of Object.entries(原始清單)) {
    const item = rawItem as Partial<Film>; // ✅ 加這行

    if (!item?.詳細?.release_date && !item?.詳細?.first_air_date) {
      try {
        const 詳細 = await getTMDbDetail(item.類型!, item.tmdbId!); // 加上非 null 斷言
        更新清單[id] = {
          ...item,
          上映日: 詳細.release_date || 詳細.first_air_date || '',
          詳細,
        };
        有更新 = true;
      } catch (err) {
        console.warn(`⚠️ 無法補上 ${item.title} 詳細資料`, err);
      }
    }
  }

  if (有更新) {
    try {
      await setDoc(ref, { 追蹤清單: 更新清單 }, { merge: true });
    } catch (err) {
      console.warn('⚠️ 更新清單資料失敗', err);
      throw err;
    }
  }

  return 更新清單;
}

export async function addToWatchlist(film: Film): Promise<void> {
  const 使用者 = getCurrentUser();
  if (!使用者) throw new Error('未登入');

  const ref = doc(db, 'users', 使用者.uid);
  const snap = await getDocSafe(ref);
  const data = snap && snap.exists() ? snap.data() : {};
  const watchlist = data?.追蹤清單 || {};

  const 詳細 =
    film.詳細 && (film.詳細.release_date || film.詳細.first_air_date)
      ? film.詳細
      : await getTMDbDetail(film.類型, film.tmdbId);

  watchlist[film.tmdbId] = {
    tmdbId: film.tmdbId,
    類型: film.類型,
    title: film.title,
    year: film.year || '',
    封面圖: film.封面圖,
    背景圖: film.背景圖 || '',
    加入時間: new Date().toISOString(),
    上映日: 詳細.release_date || 詳細.first_air_date || '',
    詳細,
  };

  try {
    await setDoc(ref, { 追蹤清單: watchlist });
    await logAddToWatchlist(film.tmdbId, film.類型);
  } catch (err) {
    console.warn('⚠️ 新增追蹤失敗', err);
    throw err;
  }
}

export async function removeFromWatchlist(tmdbId: number): Promise<void> {
  const 使用者 = getCurrentUser();
  if (!使用者) throw new Error('未登入');

  const ref = doc(db, 'users', 使用者.uid);
  try {
    await updateDoc(ref, {
      [`追蹤清單.${tmdbId}`]: deleteField(),
    });
    invalidateSeasonCache(tmdbId);
  } catch (err) {
    console.warn('⚠️ 移除追蹤失敗', err);
    throw err;
  }
}

export async function updateWatchlist(newWatchlist: Record<string, any>): Promise<void> {
  const 使用者 = getCurrentUser();
  if (!使用者) throw new Error('未登入');

  const ref = doc(db, 'users', 使用者.uid);
  try {
    await setDoc(ref, { 追蹤清單: newWatchlist }, { merge: true });
  } catch (err) {
    console.warn('⚠️ 更新追蹤清單失敗', err);
    throw err;
  }
}

export async function updateMovieWatchDate(tmdbId: number, date: string | 'forgot' | null) {
  const 使用者 = getCurrentUser();
  if (!使用者) throw new Error('未登入');

  const ref = doc(db, 'users', 使用者.uid);
  try {
    await updateDoc(ref, {
      [`追蹤清單.${tmdbId}.已看紀錄.movie`]:
        date && date !== 'forgot' ? Timestamp.fromDate(new Date(date)) : date,
    });
  } catch (err) {
    console.warn('⚠️ 更新電影觀看日期失敗', err);
    throw err;
  }
}

export async function updateEpisodeWatchDate(
  tmdbId: number,
  episodeKey: string,
  date: string | null,
) {
  const 使用者 = getCurrentUser();
  if (!使用者) throw new Error('未登入');

  const ref = doc(db, 'users', 使用者.uid);
  try {
    await updateDoc(ref, {
      [`追蹤清單.${tmdbId}.已看紀錄.episodes.${episodeKey}`]: date
        ? Timestamp.fromDate(new Date(date))
        : null,
    });
    invalidateSeasonCache(tmdbId);
  } catch (err) {
    console.warn('⚠️ 更新影集觀看日期失敗', err);
    throw err;
  }
}
