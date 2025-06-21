'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getTMDbDetail } from '@/lib/api';
import { Film } from '@/types/Film';
import { DetailDialog } from '@/components/DetailDialog';
import { useUser } from '@/hooks/useUser';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';

export default function MediaPage({ params }: { params: Promise<{ tmdbId: string }> }) {
  const router = useRouter();
  const { tmdbId } = use(params); // ✅ 使用 use 解開 Promise
  const { 使用者 } = useUser();

  const tmdbIdNum = Number(tmdbId);

  useEffect(() => {
    if (!tmdbId || isNaN(tmdbIdNum) || tmdbIdNum <= 0) {
      console.warn('⚠️ 無效的 tmdbId，返回首頁');
      router.push('/');
    }
  }, [tmdbId, tmdbIdNum, router]);

  const [film, setFilm] = useState<Film | null>(null);
  const [追蹤狀態, 設定追蹤狀態] = useState<Record<number, boolean | 'loading'>>({});
  const [watchlistMap, setWatchlistMap] = useState<Record<string, Film>>({});

  const 載入資料 = useCallback(async () => {
    try {
      const watchlist = await getWatchlist();
      setWatchlistMap(watchlist);
      const isFollowed = !!watchlist[tmdbIdNum.toString()];
      設定追蹤狀態({ [tmdbIdNum]: isFollowed });

      const 類型 = watchlist[tmdbIdNum]?.類型 ?? 'movie';
      const 詳細 = await getTMDbDetail(類型, tmdbIdNum);
      const 封面圖 = 詳細.poster_path ? `https://image.tmdb.org/t/p/w500${詳細.poster_path}` : '';

      setFilm({
        tmdbId: tmdbIdNum,
        title: 詳細.title || 詳細.name || '無標題',
        類型,
        封面圖,
        詳細: {
          ...詳細,
          watchRecord: watchlist[tmdbIdNum]?.詳細?.watchRecord ?? {},
        },
      });
    } catch (e) {
      console.error('❌ 載入資料失敗', e);
    }
  }, [tmdbIdNum]);

  useEffect(() => {
    if (使用者) {
      載入資料();
    }
  }, [使用者, tmdbIdNum, 載入資料]);

  async function handleToggleWatchlist(film: Film) {
    const isFollowed = !!watchlistMap[film.tmdbId.toString()];
    設定追蹤狀態({ [film.tmdbId]: 'loading' });
    try {
      if (isFollowed) {
        await removeFromWatchlist(film.tmdbId);
      } else {
        await addToWatchlist(film);
      }
      await 載入資料();
    } catch (e) {
      console.error('❌ 無法更新追蹤清單', e);
    }
  }

  if (!film) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <DetailDialog
        film={film}
        open={true}
        onOpenChange={() => router.push('/movies')}
        from="movies"
        onToggleWatchlist={handleToggleWatchlist}
        追蹤狀態={追蹤狀態}
        onUpdated={載入資料}
      />
    </div>
  );
}
