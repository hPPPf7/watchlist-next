'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { cn } from '@/lib/utils';

interface FilmCardProps {
  tmdbId: number;
  封面圖: string;
  title: string;
  year?: string;
  類型: 'movie' | 'tv';
  onClick?: () => void;
  className?: string;
  mode?: 'cover' | 'backdrop' | 'poster'; // 封面模式 or 背景模式 or 直式小卡
}

export function FilmCard({
  封面圖,
  title,
  year,
  類型,
  onClick,
  className,
  mode = 'cover',
}: FilmCardProps) {
  return (
    <Card
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()} // ⭐️ 加這個阻止 focus
      className={cn(
        'bg-zinc-900 border border-zinc-500 hover:border-white flex flex-col transition overflow-hidden rounded-lg cursor-pointer w-36',
        className,
      )}
    >
      <CardHeader className="p-0 overflow-hidden relative">
        <div
          className={cn(
            'relative w-full bg-zinc-800',
            mode === 'backdrop'
              ? 'aspect-video'
              : mode === 'poster'
              ? 'aspect-[2/3] w-36'
              : 'aspect-[2/3]',
          )}
        >
          <ImageWithFallback
            src={封面圖}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105 ease-in-out"
          />
        </div>
      </CardHeader>

      <CardContent className="p-2 flex flex-col">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-white min-h-[3rem]">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          {類型 === 'movie' ? '電影' : '影集'}｜{year || '年份未知'}
        </p>
      </CardContent>
    </Card>
  );
}
