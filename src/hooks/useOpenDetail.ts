'use client';

import { useDetail } from '@/components/DetailPortal';
import { useRouter } from 'next/navigation';
import { Film } from '@/types/Film';

function isMobileDevice() {
  return typeof window !== 'undefined' && /Mobi|Android/i.test(window.navigator.userAgent);
}

export function useOpenDetail() {
  const router = useRouter();
  const { openDetail } = useDetail();

  return ({
    film,
    from,
    onToggleWatchlist,
    追蹤狀態,
    onUpdated,
  }: {
    film: Film;
    from: 'search' | 'progress' | 'movies';
    onToggleWatchlist: (film: Film) => Promise<void>;
    追蹤狀態: Record<number, boolean | 'loading'>;
    onUpdated?: () => void;
  }) => {
    if (isMobileDevice()) {
      router.push(`/media/${film.tmdbId}`);
    } else {
      openDetail({
        film,
        from,
        onToggleWatchlist,
        追蹤狀態,
        onUpdated,
      });
    }
  };
}
