import type { Film } from '@/types/Film';

// --- 共用設定 ---
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL || '';

// --- 共用 fetch function ---
export async function tmdbFetch<T = any>(path: string): Promise<T> {
  const url = new URL(BASE_URL + path);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'zh-TW');
  url.searchParams.set('region', 'TW');

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch (err) {
    console.warn('⚠️ 無法取得 TMDb 資料', err);
    throw err;
  }

  if (response.status === 404) {
    return { results: [] } as T;
  }

  if (!response.ok) {
    throw new Error(`找不到資料 (${response.status})`);
  }

  return response.json();
}

// --- API 方法 ---

export async function searchTMDb(文字: string) {
  const data = await tmdbFetch<{ results: any[] }>(
    `/search/multi?query=${encodeURIComponent(文字)}&include_adult=false`,
  );
  return data.results || [];
}

export async function getTMDbDetail(類型: 'movie' | 'tv', id: number) {
  return tmdbFetch<Record<string, any>>(`/${類型}/${id}`);
}

// ✅ ✅ 共用推薦清單邏輯
export async function fetch推薦清單(類型: 'movie' | 'tv'): Promise<{
  popular: Film[];
  nowPlaying: Film[];
  topRated: Film[];
  animation: Film[];
}> {
  const safeFetch = async (path: string) => {
    try {
      return await tmdbFetch<{ results: any[] }>(path);
    } catch (error) {
      console.warn(`⚠️ 警告：抓取 ${path} 失敗`, error);
      return { results: [] };
    }
  };

  const prefix = 類型;
  const genrePath =
    類型 === 'movie'
      ? '/discover/movie?with_genres=16&page=1'
      : '/discover/tv?with_genres=16&page=1';

  const [popular, nowPlaying, topRated, animation] = await Promise.all([
    safeFetch(`/${prefix}/popular?page=1`),
    safeFetch(`/${prefix}/${類型 === 'movie' ? 'now_playing' : 'on_the_air'}?page=1`),
    safeFetch(`/${prefix}/top_rated?page=1`),
    safeFetch(genrePath),
  ]);

  const toFilmList = (items: any[]): Film[] =>
    items.slice(0, 20).map((item) => ({
      tmdbId: item.id,
      類型,
      title: item.title || item.name,
      year:
        類型 === 'movie'
          ? (item.release_date || '').slice(0, 4)
          : (item.first_air_date || '').slice(0, 4),
      封面圖: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : '/no-image.png',
      背景圖: item.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
        : '/no-backdrop.png',
      詳細: undefined,
    }));

  return {
    popular: toFilmList(popular.results),
    nowPlaying: toFilmList(nowPlaying.results),
    topRated: toFilmList(topRated.results),
    animation: toFilmList(animation.results),
  };
}
