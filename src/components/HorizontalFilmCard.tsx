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
      className={`flex items-center gap-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 p-4 transition cursor-pointer ${
        className || ''
      }`}
      onClick={onClick}
    >
      <CardImageWithFallback
        src={film.封面圖}
        alt="封面"
        className="w-20 h-32 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold truncate">{film.title}</h2>
        {children}
      </div>
    </div>
  );
}
