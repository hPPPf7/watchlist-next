'use client';

import { createContext, useContext, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { DetailDialog } from '@/components/DetailDialog';
import { Film } from '@/types/Film';

interface DetailContextType {
  film: Film | null;
  openDetail: (params: {
    film: Film;
    from: 'search' | 'progress' | 'movies';
    onToggleWatchlist: (film: Film) => Promise<void>;
    追蹤狀態: Record<number, boolean | 'loading'>;
    onUpdated?: () => void;
    season?: number;
  }) => void;
  closeDetail: () => void;
  from: 'search' | 'progress' | 'movies';

  onToggleWatchlist: (film: Film) => Promise<void>;
  追蹤狀態: Record<number, boolean | 'loading'>;
  season?: number;
}

const DetailContext = createContext<DetailContextType | null>(null);

export function useDetail() {
  const context = useContext(DetailContext);
  if (!context) {
    throw new Error('useDetail 必須在 DetailProvider 中使用');
  }
  return context;
}

export function DetailPortalProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [film, setFilm] = useState<Film | null>(null);
  const [from, setFrom] = useState<'search' | 'progress' | 'movies'>('search');
  const [onToggleWatchlist, setOnToggleWatchlist] = useState<(film: Film) => Promise<void>>(
    async () => {},
  );
  const [追蹤狀態, 設定追蹤狀態] = useState<Record<number, boolean | 'loading'>>({});
  const [onUpdated, setOnUpdated] = useState<(() => void) | undefined>(undefined);
  const [dialogKey, setDialogKey] = useState<number>(0);
  const [season, setSeason] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const openDetail = ({
    film,
    from,
    onToggleWatchlist,
    追蹤狀態,
    onUpdated,
    season,
  }: {
    film: Film;
    from: 'search' | 'progress' | 'movies';
    onToggleWatchlist: (film: Film) => Promise<void>;
    追蹤狀態: Record<number, boolean | 'loading'>;
    onUpdated?: () => void;
    season?: number;
  }) => {
    setFilm(film);
    setFrom(from);
    setOnToggleWatchlist(() => onToggleWatchlist);
    setOnUpdated(() => onUpdated);
    設定追蹤狀態(追蹤狀態);
    setSeason(season);
    setDialogKey(Date.now()); // ✅ 每次打開更新 key
  };

  const closeDetail = () => {
    setFilm(null);
  };

  return (
    <DetailContext.Provider
      value={{ film, openDetail, closeDetail, from, onToggleWatchlist, 追蹤狀態, season }}
    >
      {children}

      {mounted &&
        film &&
        createPortal(
          <DetailDialog
            key={dialogKey}
            film={film}
            open={true}
            onOpenChange={(isOpen) => {
              if (!isOpen) closeDetail();
            }}
            from={from}
            onToggleWatchlist={onToggleWatchlist}
            追蹤狀態={追蹤狀態}
            onUpdated={onUpdated}
            initialSeason={season}
          />,
          document.body,
        )}
    </DetailContext.Provider>
  );
}
