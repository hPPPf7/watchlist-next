// src/lib/api.ts

import { fetchWithErrorHandling } from './utils';
import type { Film } from '@/types/Film';

// --- 共用設定 ---
const API_KEY = '1f39a180d3e8601ac41af92d19060659';
const BASE_URL = 'https://api.themoviedb.org/3';

// --- 共用 fetch function ---
export async function tmdbFetch<T = any>(path: string): Promise<T> {
  const url = new URL(BASE_URL + path);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'zh-TW');

  const response = await fetch(url.toString());

  if (response.status === 404) {
    // ⭐️ 遇到 404 → 回傳空結果，不拋錯
    return { results: [] } as T;
  }

  if (!response.ok) {
    throw new Error(`找不到資料 (${response.status})`);
  }

  return response.json();
}

// --- API 方法 ---

// 🔍 搜尋影片
export async function searchTMDb(文字: string) {
  const data = await tmdbFetch<{ results: any[] }>(
    `/search/multi?query=${encodeURIComponent(文字)}&include_adult=false`,
  );
  return data.results || [];
}

// 📖 取得單一影片詳細資料
export async function getTMDbDetail(類型: 'movie' | 'tv', id: number) {
  return tmdbFetch<Record<string, any>>(`/${類型}/${id}`);
}

// 🎬 取得電影推薦清單
export async function fetch電影推薦清單(): Promise<{
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

  const [popular, nowPlaying, topRated, animation] = await Promise.all([
    safeFetch('/movie/popular?page=1'),
    safeFetch('/movie/now_playing?page=1'),
    safeFetch('/movie/top_rated?page=1'),
    safeFetch('/discover/movie?with_genres=16&page=1'),
  ]);

  const toFilmList = (items: any[]): Film[] =>
    items.slice(0, 20).map((item) => ({
      tmdbId: item.id,
      類型: 'movie',
      title: item.title || item.name,
      year: (item.release_date || '').slice(0, 4),
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

// 📺 取得影集推薦清單
export async function fetch影集推薦清單(): Promise<{
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

  const [popular, nowPlaying, topRated, animation] = await Promise.all([
    safeFetch('/tv/popular?page=1'),
    safeFetch('/tv/on_the_air?page=1'),
    safeFetch('/tv/top_rated?page=1'),
    safeFetch('/discover/tv?with_genres=16&page=1'),
  ]);

  const toFilmList = (items: any[]): Film[] =>
    items.slice(0, 20).map((item) => ({
      tmdbId: item.id,
      類型: 'tv',
      title: item.name || item.title,
      year: (item.first_air_date || '').slice(0, 4),
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
