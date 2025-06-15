// src/utils/coverImageUtils.ts

import { tmdbFetch } from '@/lib/api';

const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const 預設圖片 = '/no-image.png'; // ✅ 改為本地 fallback，與 UI 統一

type 封面圖參數 = {
  tmdbId: number | string;
  類型?: 'movie' | 'tv';
};

/**
 * 從 TMDb 取得封面圖片 URL
 */
export async function 取得封面圖({ tmdbId, 類型 = 'tv' }: 封面圖參數): Promise<string> {
  if (!tmdbId) return 預設圖片;

  try {
    const 資料 = await tmdbFetch<Record<string, any>>(`/${類型}/${tmdbId}`);
    return 資料.poster_path ? `${TMDB_IMAGE_URL}${資料.poster_path}` : 預設圖片;
  } catch (錯誤) {
    console.error('取得圖片失敗：', 錯誤);
    return 預設圖片;
  }
}
