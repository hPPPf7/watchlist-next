'use client';

import { Film } from '@/types/Film';
import { CardImageWithFallback } from '@/components/CardImageWithFallback';

interface Props {
  film: Film;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function HorizontalFilmCard({ film, onClick, children, className }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`flex cursor-pointer items-center gap-4 rounded-2xl bg-zinc-800 p-4 transition hover:bg-zinc-700 ${
        className || ''
      }`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <CardImageWithFallback
        src={film.封面圖}
        alt="封面"
        className="h-32 w-20 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold">{film.title}</h2>
        {children}
      </div>
    </div>
  );
}
