'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { type Film } from '@/types/Film';
import { useOpenDetail } from '@/hooks/useOpenDetail';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { EmptyState } from '@/components/EmptyState';
import { HorizontalFilmCard } from '@/components/HorizontalFilmCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 分類排序觀看進度 } from '@/utils/sortLogic';
import { formatCountdown, formatDate } from '@/lib/date';
import { getNextEpisodeInfo, type NextEpisode } from '@/utils/tv';

type WatchlistMap = Record<string, Film>;

export default function SeriesProgressPage() {
  const { 使用者 } = useUser();
  const openDetail = useOpenDetail();
  const [清單, 設定清單] = useState<WatchlistMap>({});
  const [載入中, 設定載入中] = useState(true);
  const [下一集資訊, 設定下一集資訊] = useState<Record<number, NextEpisode | null>>({});
  const [目前Tab, 設定目前Tab] = useState('progress');

  async function 載入清單() {
    設定載入中(true);
    try {
      const data = await getWatchlist();
      console.log('載入影集清單完成，共', Object.keys(data).length, '筆');

      const 影集Only = Object.fromEntries(
        Object.entries(data).filter(([, item]: any) => item.類型 === 'tv'),
      );
      設定清單(影集Only);
    } catch (e) {
      console.error('讀取清單失敗', e);
    } finally {
      設定載入中(false);
    }
  }

  useEffect(() => {
    if (使用者) {
      載入清單();
    }
  }, [使用者]);

  useEffect(() => {
    async function loadNext() {
      const entries = await Promise.all(
        Object.values(清單).map(async (item) => {
          const info = await getNextEpisodeInfo(item);
          return [item.tmdbId, info] as [number, NextEpisode | null];
        }),
      );
      設定下一集資訊(Object.fromEntries(entries));
    }
    if (Object.keys(清單).length > 0) {
      loadNext();
    } else {
      設定下一集資訊({});
    }
  }, [清單]);

  const { 有新集數未看, 有紀錄中, 尚未看過 } = 分類排序觀看進度(清單);
  const 即將播出 = Object.entries(清單)
    .filter(([, item]) => {
      const next = item.詳細?.next_episode_to_air;
      if (!next || !next.air_date) return false;
      const d = new Date(next.air_date);
      return !isNaN(d.getTime()) && d.getTime() > Date.now();
    })
    .map(([id, item]) => ({ id, item }))
    .sort((a, b) => {
      const da = new Date(a.item.詳細!.next_episode_to_air!.air_date).getTime();
      const db = new Date(b.item.詳細!.next_episode_to_air!.air_date).getTime();
      return da - db;
    });

  const handleToggleWatchlist = async (film: Film) => {
    if (!film) return;
    const is追蹤中 = !!清單[film.tmdbId.toString()];
    try {
      if (is追蹤中) {
        await removeFromWatchlist(film.tmdbId);
      } else {
        await addToWatchlist(film);
      }
      await 載入清單();
    } catch (e) {
      console.error('更新追蹤清單失敗', e);
    }
  };

  const handleOpenDetail = (item: Film) => {
    openDetail({
      film: { ...item, 類型: 'tv' },
      from: 'progress',
      onToggleWatchlist: handleToggleWatchlist,
      追蹤狀態: Object.fromEntries(Object.keys(清單).map((id) => [Number(id), true])),
      onUpdated: 載入清單,
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold text-white">🎯 觀看進度畫面</h1>

      {載入中 ? (
        <EmptyState text="載入中..." loading />
      ) : 有新集數未看.length + 有紀錄中.length + 尚未看過.length === 0 && 即將播出.length === 0 ? (
        <EmptyState text="目前沒有追蹤的影集" />
      ) : (
        <Tabs value={目前Tab} onValueChange={設定目前Tab} className="w-full">
          <TabsList className="mb-6 inline-flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
            <TabsTrigger
              value="upcoming"
              className="h-10 w-[120px] text-sm text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
            >
              ⏳ <span className="ml-1">即將播出 ({即將播出.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="h-10 w-[120px] text-sm text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
            >
              📺{' '}
              <span className="ml-1">
                進度列表 ({有新集數未看.length + 有紀錄中.length + 尚未看過.length})
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {即將播出.length === 0 ? (
              <EmptyState text="目前沒有即將播出的影集" />
            ) : (
              <div className="space-y-4">
                {即將播出.map(({ id, item }) => {
                  const next = item.詳細!.next_episode_to_air!;
                  return (
                    <HorizontalFilmCard key={id} film={item} onClick={() => handleOpenDetail(item)}>
                      <p className="text-sm text-gray-500">
                        下一集：S{next.season_number}E{next.episode_number}
                        {next.name ? ` - ${next.name}` : ''}
                      </p>
                      <p className="text-sm text-gray-500">播出日：{formatDate(next.air_date)}</p>
                      {formatCountdown(next.air_date) === '0 天後' ? (
                        <p className="mt-1 text-base font-bold text-green-400">🎉 今天播出</p>
                      ) : (
                        <p className="mt-1 text-base font-bold text-red-400">
                          {formatCountdown(next.air_date)}
                        </p>
                      )}
                    </HorizontalFilmCard>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress">
            {[...有新集數未看, ...有紀錄中].map(({ id, item }) => (
              <HorizontalFilmCard
                key={id}
                film={item}
                onClick={() => handleOpenDetail(item)}
                className="mb-6"
              >
                <p className="mt-1 text-xs text-gray-400">
                  {(() => {
                    const next = 下一集資訊[item.tmdbId];
                    if (next === undefined) return '...';
                    return next
                      ? `下一集：S${next.season}E${next.episode}${next.name ? ` - ${next.name}` : ''}`
                      : '已看完';
                  })()}
                </p>
              </HorizontalFilmCard>
            ))}

            {尚未看過.length > 0 && (
              <>
                <div className="mt-10 text-center text-base text-gray-400">
                  👇 尚未開始觀看的影集
                </div>
                <div className="mt-4 space-y-4">
                  {尚未看過.map(({ id, item }) => (
                    <HorizontalFilmCard key={id} film={item} onClick={() => handleOpenDetail(item)}>
                      <p className="mt-1 text-xs text-gray-400">尚未觀看任何集數</p>
                    </HorizontalFilmCard>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
