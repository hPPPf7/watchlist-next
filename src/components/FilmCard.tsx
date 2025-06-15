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
      <CardHeader className="relative overflow-hidden p-0">
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
            className="absolute inset-0 size-full object-cover object-center transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col p-2">
        <h3 className="line-clamp-2 min-h-12 text-sm font-semibold leading-tight text-white">
          {title}
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          {類型 === 'movie' ? '電影' : '影集'}｜{year || '年份未知'}
        </p>
      </CardContent>
    </Card>
  );
}
