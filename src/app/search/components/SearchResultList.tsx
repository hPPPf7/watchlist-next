'use client';

import { Film } from '@/types/Film';
import { FilmCard } from '@/components/FilmCard';

interface Props {
  結果列表: Film[];
  onClickFilm: (film: Film) => void;
}

export function SearchResultList({ 結果列表, onClickFilm }: Props) {
  if (結果列表.length === 0) {
    return <div className="mt-6 text-center text-gray-400">目前沒有找到資料</div>;
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <div
        className="mt-6 grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 140px))',
          justifyContent: 'center',
          justifyItems: 'center',
        }}
      >
        {結果列表.map((項) => (
          <FilmCard
            key={`search-${項.tmdbId}`}
            {...項}
            mode="poster"
            onClick={() => onClickFilm(項)}
          />
        ))}
      </div>
    </div>
  );
}
