'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { LastUpdatedHint } from '@/components/LastUpdatedHint';
import { fetch推薦清單, searchTMDb, getTMDbDetail } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Film } from '@/types/Film';
import { SearchInputSection } from './components/SearchInputSection';
import { SearchResultList } from './components/SearchResultList';
import { RecommendList } from './components/RecommendList';
import { EmptyState } from '@/components/EmptyState';
import { useOpenDetail } from '@/hooks/useOpenDetail';
import {
  logClick,
  logAddToWatchlist,
  getPopularWatchedThisWeek,
  getPopularWatchlistThisWeek,
} from '@/lib/popular';

export default function SearchPage() {
  const { 使用者 } = useUser();
  const 建議容器 = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [關鍵字, 設定關鍵字] = useState('');
  const [結果列表, 設定結果列表] = useState<Film[]>([]);
  const [追蹤狀態, 設定追蹤狀態] = useState<Record<number, boolean | 'loading'>>({});
  const [watchlistMap, setWatchlistMap] = useState<Record<string, Film>>({});
  const [篩選類型, 設定篩選類型] = useState<'all' | 'movie' | 'tv'>('all');
  const [搜尋中, 設定搜尋中] = useState(false);
  const [錯誤訊息, 設定錯誤訊息] = useState('');
  const [顯示錯誤, 設定顯示錯誤] = useState(false);
  const [正在組字, 設定正在組字] = useState(false);
  const [熱門電影_popular, 設定熱門電影_popular] = useState<Film[]>([]);
  const [熱門電影_nowPlaying, 設定熱門電影_nowPlaying] = useState<Film[]>([]);
  const [熱門電影_topRated, 設定熱門電影_topRated] = useState<Film[]>([]);
  const [熱門電影_animation, 設定熱門電影_animation] = useState<Film[]>([]);
  const [熱門影集_popular, 設定熱門影集_popular] = useState<Film[]>([]);
  const [熱門影集_nowPlaying, 設定熱門影集_nowPlaying] = useState<Film[]>([]);
  const [熱門影集_topRated, 設定熱門影集_topRated] = useState<Film[]>([]);
  const [熱門影集_animation, 設定熱門影集_animation] = useState<Film[]>([]);
  const [當前Tab, 設定當前Tab] = useState<'movie' | 'tv'>('movie');
  const [錯誤動畫中, 設定錯誤動畫中] = useState(false);
  const [錯誤佇列, 設定錯誤佇列] = useState<string[]>([]);
  const [大家都在看_movie, 設定大家都在看_movie] = useState<Film[]>([]);
  const [大家都在看_tv, 設定大家都在看_tv] = useState<Film[]>([]);
  const [大家感興趣_movie, 設定大家感興趣_movie] = useState<Film[]>([]);
  const [大家感興趣_tv, 設定大家感興趣_tv] = useState<Film[]>([]);

  async function 搜尋影片(文字 = 關鍵字, 類型 = 篩選類型) {
    if (!文字.trim()) {
      設定結果列表([]);
      return;
    }

    設定搜尋中(true);
    設定錯誤訊息('');

    try {
      const 結果 = await searchTMDb(文字);

      const 篩選後 = 結果.filter((r: any) => {
        if (類型 === 'all') return r.media_type === 'movie' || r.media_type === 'tv';
        return r.media_type === 類型;
      });

      const 整理 = await Promise.all(
        篩選後.map(async (項: any) => {
          const 詳細 = await getTMDbDetail(項.media_type, 項.id);
          return {
            tmdbId: 項.id,
            類型: 項.media_type as 'movie' | 'tv',
            title: 項.title || 項.name,
            year: (項.release_date || 項.first_air_date || '').slice(0, 4),
            封面圖: 詳細.poster_path
              ? `https://image.tmdb.org/t/p/w500${詳細.poster_path}`
              : '/no-image.png',
            背景圖: 詳細.backdrop_path
              ? `https://image.tmdb.org/t/p/w780${詳細.backdrop_path}`
              : '/no-backdrop.png',
            詳細,
          };
        }),
      );

      設定結果列表(整理);
    } catch (error: any) {
      console.error(error);
      顯示錯誤訊息(error.message || '⚠️ 搜尋失敗，請稍後再試');
      設定結果列表([]);
    } finally {
      設定搜尋中(false);
      inputRef.current?.focus();
    }
  }

  const fetchWatchlist = useCallback(async () => {
    try {
      const list = await getWatchlist();
      設定追蹤狀態(Object.fromEntries(Object.keys(list).map((id) => [Number(id), true])));
      setWatchlistMap(list);
    } catch (error) {
      console.warn('讀取清單失敗', error);
    }
  }, []);

  async function handleToggleWatchlist(film: Film) {
    if (!film) return;

    try {
      console.log('開始切換追蹤狀態', film);

      const is追蹤中 = !!追蹤狀態[film.tmdbId];

      設定追蹤狀態((prev) => ({
        ...prev,
        [film.tmdbId]: 'loading',
      }));

      if (is追蹤中) {
        console.log('嘗試移除：', film.tmdbId);
        await removeFromWatchlist(film.tmdbId);
        console.log('✅ 成功取消追蹤', film.tmdbId);
      } else {
        await addToWatchlist(film);
        await logAddToWatchlist(film.tmdbId, film.類型);
        console.log('✅ 成功加入追蹤', film.tmdbId);
      }

      // 🎯 這裡改：直接更新本地追蹤狀態，不用每次重抓
      設定追蹤狀態((prev) => ({
        ...prev,
        [film.tmdbId]: !is追蹤中,
      }));
    } catch (error) {
      console.error('❌ 切換追蹤失敗', error);
    }
  }

  useEffect(() => {
    // 每次關鍵字改變時，自動捲到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [關鍵字]);

  useEffect(() => {
    if (關鍵字.trim()) {
      搜尋影片(關鍵字, 篩選類型);
    }
  }, [關鍵字, 篩選類型]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const 錯誤Timer = useRef<NodeJS.Timeout | null>(null);

  function 顯示錯誤訊息(訊息: string) {
    設定錯誤佇列((prev) => [...prev, 訊息]);
  }

  useEffect(() => {
    if (錯誤佇列.length === 0 || 錯誤訊息) return; // 有正在顯示中的錯誤就等它結束

    const 要顯示的錯誤 = 錯誤佇列[0];
    設定錯誤訊息(要顯示的錯誤);
    設定顯示錯誤(true);
    設定錯誤動畫中(true);

    錯誤Timer.current = setTimeout(() => {
      設定顯示錯誤(false);

      setTimeout(() => {
        設定錯誤動畫中(false);
        設定錯誤訊息('');
        設定錯誤佇列((prev) => prev.slice(1)); // 顯示完後，移除當前錯誤，輪到下一個
      }, 500); // 動畫時間
    }, 4000); // 顯示時間
  }, [錯誤佇列, 錯誤訊息]);

  useEffect(() => {
    return () => {
      if (錯誤Timer.current) {
        clearTimeout(錯誤Timer.current);
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [movieList, tvList, 點擊_movie, 點擊_tv, 加入_movie, 加入_tv] = await Promise.all([
          fetch推薦清單('movie'),
          fetch推薦清單('tv'),
          getPopularWatchedThisWeek('movie'), // ✅ 新增 API：根據觀看紀錄
          getPopularWatchedThisWeek('tv'),
          getPopularWatchlistThisWeek('movie'),
          getPopularWatchlistThisWeek('tv'),
        ]);

        const 處理詳細 = async (
          清單: { tmdbId: string | number }[],
          類型: 'movie' | 'tv',
        ): Promise<Film[]> =>
          await Promise.all(
            清單.slice(0, 10).map(async (item) => {
              const 詳細 = await getTMDbDetail(類型, Number(item.tmdbId)); // 保險起見這邊轉成 Number
              return {
                tmdbId: Number(item.tmdbId),
                類型,
                title: 詳細.title || 詳細.name,
                year: (詳細.release_date || 詳細.first_air_date || '').slice(0, 4),
                封面圖: 詳細.poster_path
                  ? `https://image.tmdb.org/t/p/w500${詳細.poster_path}`
                  : '/no-image.png',
                背景圖: 詳細.backdrop_path
                  ? `https://image.tmdb.org/t/p/w780${詳細.backdrop_path}`
                  : '/no-backdrop.png',
                詳細,
              };
            }),
          );

        設定大家都在看_movie(await 處理詳細(點擊_movie, 'movie'));
        設定大家都在看_tv(await 處理詳細(點擊_tv, 'tv'));
        設定大家感興趣_movie(await 處理詳細(加入_movie, 'movie'));
        設定大家感興趣_tv(await 處理詳細(加入_tv, 'tv'));

        設定熱門電影_popular(movieList.popular);
        設定熱門電影_nowPlaying(movieList.nowPlaying);
        設定熱門電影_topRated(movieList.topRated);
        設定熱門電影_animation(movieList.animation);
        設定熱門影集_popular(tvList.popular);
        設定熱門影集_nowPlaying(tvList.nowPlaying);
        設定熱門影集_topRated(tvList.topRated);
        設定熱門影集_animation(tvList.animation);
      } catch (error) {
        console.error('初始載入推薦清單失敗', error);
        顯示錯誤訊息('⚠️ 載入推薦清單失敗，請稍後再試');
      }
    })();
  }, []);

  const 重新整理推薦清單 = useCallback(async () => {
    try {
      const [movieList, tvList] = await Promise.all([fetch推薦清單('movie'), fetch推薦清單('tv')]);
      設定熱門電影_popular(movieList.popular);
      設定熱門電影_nowPlaying(movieList.nowPlaying);
      設定熱門電影_topRated(movieList.topRated);
      設定熱門電影_animation(movieList.animation);
      設定熱門影集_popular(tvList.popular);
      設定熱門影集_nowPlaying(tvList.nowPlaying);
      設定熱門影集_topRated(tvList.topRated);
      設定熱門影集_animation(tvList.animation);
    } catch (error) {
      console.error('刷新推薦清單失敗', error);
      顯示錯誤訊息('⚠️ 載入推薦清單失敗，請稍後再試');
    }
  }, []);

  const { lastUpdated, loading } = useAutoRefresh({
    onRefresh: 重新整理推薦清單,
  });

  const openDetail = useOpenDetail(); // ✅ 用新的 hook

  const handleOpenDetail = useCallback(
    (film: Film) => {
      logClick(film.tmdbId, film.類型);
      const merged = watchlistMap[film.tmdbId] ? { ...film, ...watchlistMap[film.tmdbId] } : film;
      openDetail({
        film: merged,
        from: 'search',
        onToggleWatchlist: handleToggleWatchlist,
        追蹤狀態,
      });
    },
    [openDetail, handleToggleWatchlist, 追蹤狀態, watchlistMap],
  );

  return (
    <>
      <div className="flex min-h-screen flex-col">
        {/* 🔍 搜尋列 */}
        <SearchInputSection
          關鍵字={關鍵字}
          設定關鍵字={設定關鍵字}
          篩選類型={篩選類型}
          設定篩選類型={設定篩選類型}
          搜尋影片={搜尋影片}
          搜尋中={搜尋中}
        />

        {/* 🔖 分類 Tabs */}
        {!關鍵字.trim() && (
          <div className="mb-6 px-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => 設定當前Tab('movie')}
                className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                  當前Tab === 'movie'
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                }`}
              >
                🎬 電影
              </button>
              <button
                onClick={() => 設定當前Tab('tv')}
                className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                  當前Tab === 'tv'
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                }`}
              >
                📺 影集
              </button>
            </div>
          </div>
        )}

        {/* ⚠️ 錯誤提示 */}
        {(錯誤訊息 || 錯誤動畫中) && (
          <div
            className={cn(
              'mt-3 bg-red-600/20 text-red-400 rounded p-3 text-center text-sm transition-all duration-500 cursor-pointer',
              顯示錯誤 ? 'opacity-100 animate-fade-in' : 'opacity-0 animate-fade-out',
            )}
            onClick={() => {
              設定顯示錯誤(false);
              setTimeout(() => {
                設定錯誤動畫中(false);
                設定錯誤訊息('');
              }, 500);
            }}
          >
            {錯誤訊息}
          </div>
        )}

        {/* 📋 清單內容 */}
        <div className="flex-1">
          {搜尋中 ? (
            <EmptyState text="搜尋中..." loading />
          ) : (
            <>
              {關鍵字.trim() ? (
                <SearchResultList 結果列表={結果列表} onClickFilm={handleOpenDetail} />
              ) : (
                <div className="space-y-10 px-4">
                  {loading && <EmptyState text="正在刷新推薦清單..." loading small />}

                  <RecommendList
                    當前Tab={當前Tab}
                    熱門電影={{
                      popular: 熱門電影_popular,
                      nowPlaying: 熱門電影_nowPlaying,
                      topRated: 熱門電影_topRated,
                      animation: 熱門電影_animation,
                      watching: 大家都在看_movie, // ← 新增
                      interested: 大家感興趣_movie, // ← 新增
                    }}
                    熱門影集={{
                      popular: 熱門影集_popular,
                      nowPlaying: 熱門影集_nowPlaying,
                      topRated: 熱門影集_topRated,
                      animation: 熱門影集_animation,
                      watching: 大家都在看_tv, // ← 新增
                      interested: 大家感興趣_tv, // ← 新增
                    }}
                    onClickFilm={handleOpenDetail}
                  />
                  <div className="space-y-6"></div>
                  <LastUpdatedHint lastUpdated={lastUpdated} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
