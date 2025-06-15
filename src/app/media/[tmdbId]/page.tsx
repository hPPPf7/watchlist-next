'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getTMDbDetail, tmdbFetch } from '@/lib/api';
import { Film } from '@/types/Film';
import { DetailDialog } from '@/components/DetailDialog';
import { useUser } from '@/hooks/useUser';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';

export default function MediaPage({ params }: { params: { tmdbId: string } }) {
  const router = useRouter();
  const { 使用者 } = useUser();
  const tmdbId = Number(params.tmdbId);

  const [film, setFilm] = useState<Film | null>(null);
  const [追蹤狀態, 設定追蹤狀態] = useState<Record<number, boolean | 'loading'>>({});
  const [watchlistMap, setWatchlistMap] = useState<Record<string, Film>>({});

  async function 載入資料() {
    try {
      const watchlist = await getWatchlist();
      setWatchlistMap(watchlist);
      const isFollowed = !!watchlist[tmdbId.toString()];
      設定追蹤狀態({ [tmdbId]: isFollowed });

      const 類型 = watchlist[tmdbId]?.類型 ?? 'movie';
      const 詳細 = await getTMDbDetail(類型, tmdbId);
      const 封面圖 = 詳細.poster_path ? `https://image.tmdb.org/t/p/w500${詳細.poster_path}` : '';

      setFilm({
        tmdbId,
        title: 詳細.title || 詳細.name || '無標題',
        類型,
        封面圖,
        詳細: {
          ...詳細,
          watchRecord: watchlist[tmdbId]?.詳細?.watchRecord ?? {},
        },
      });
    } catch (e) {
      console.error('❌ 載入資料失敗', e);
    }
  }

  useEffect(() => {
    if (使用者) {
      載入資料();
    }
  }, [使用者, tmdbId]);

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
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <DetailDialog
        film={film}
        open={true}
        onOpenChange={() => {
          // ✅ 手機版不要用 router.back() 了
          // 直接跳到首頁或其他地方比較好，例如：
          router.push('/movies');
        }}
        from="movies"
        onToggleWatchlist={handleToggleWatchlist}
        追蹤狀態={追蹤狀態}
        onUpdated={載入資料}
      />
    </div>
  );
}
