'use client';

import { memo } from 'react';
import { Film } from '@/types/Film';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { FilmCard } from '@/components/FilmCard';

interface Props {
  標題?: string;
  當前Tab: 'movie' | 'tv';
  熱門電影: {
    popular: Film[];
    nowPlaying: Film[];
    topRated: Film[];
    animation: Film[];
    watching?: Film[]; // 👈 新增
    interested?: Film[]; // 👈 新增
  };
  熱門影集: {
    popular: Film[];
    nowPlaying: Film[];
    topRated: Film[];
    animation: Film[];
    watching?: Film[];
    interested?: Film[];
  };
  onClickFilm: (film: Film) => void;
}

export const RecommendList = memo(function RecommendList({
  當前Tab,
  熱門電影,
  熱門影集,
  onClickFilm,
}: Props) {
  const 資料 = 當前Tab === 'movie' ? 熱門電影 : 熱門影集;

  const sections = [
    {
      title: 當前Tab === 'movie' ? '🔥 熱門電影' : '🔥 熱門影集',
      list: 資料.popular,
    },
    {
      title: 當前Tab === 'movie' ? '🎞️ 現正上映' : '📺 熱門播出中',
      list: 資料.nowPlaying,
    },
    {
      title: '🏆 高分推薦',
      list: 資料.topRated,
    },
    {
      title: '🎨 動畫精選',
      list: 資料.animation,
    },
    {
      title: 當前Tab === 'movie' ? '🔥 大家都在看' : '🔥 大家都在看',
      list: 資料.watching ?? [],
    },
    {
      title: 當前Tab === 'movie' ? '🌟 大家感興趣' : '🌟 大家感興趣',
      list: 資料.interested ?? [],
    },
  ];

  return (
    <div className="space-y-10">
      {sections.map(({ title, list }) =>
        list.length > 0 ? (
          <div key={title}>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <div className="-mx-4">
              <Swiper
                loop
                slidesPerView="auto"
                spaceBetween={16}
                slidesOffsetBefore={16}
                grabCursor
              >
                {list.map((item) => (
                  <SwiperSlide key={`recommend-${item.tmdbId}`} style={{ width: '140px' }}>
                    <FilmCard {...item} mode="poster" onClick={() => onClickFilm(item)} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
});
