'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { type Film } from '@/types/Film';
import { useOpenDetail } from '@/hooks/useOpenDetail';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { EmptyState } from '@/components/EmptyState';
import { HorizontalFilmCard } from '@/components/HorizontalFilmCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 分類排序觀看進度 } from '@/utils/sortLogic';
import { formatCountdown, formatDate } from '@/lib/date';
import {
  getNextEpisodeInfo,
  type NextEpisode,
  getUpcomingEpisodes,
  type EpisodeInfo,
  getUnwatchedSpecialEpisodes,
} from '@/utils/tv';
import { getTMDbDetail } from '@/lib/api';

type WatchlistMap = Record<string, Film>;

export default function SeriesProgressPage() {
  const { 使用者 } = useUser();
  const openDetail = useOpenDetail();
  const [清單, 設定清單] = useState<WatchlistMap>({});
  const [載入中, 設定載入中] = useState(true);
  const [下一集資訊, 設定下一集資訊] = useState<Record<number, NextEpisode | null>>({});
  const [即將播出集數, 設定即將播出集數] = useState<
    { id: string; item: Film; episode: EpisodeInfo }[]
  >([]);
  const [特別篇清單, 設定特別篇清單] = useState<
    { id: string; item: Film; episodes: EpisodeInfo[] }[]
  >([]);
  const [目前Tab, 設定目前Tab] = useState('progress');
  const progressRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const previousTabRef = useRef('');
  const hasScrolledRef = useRef(false);

  async function 載入清單() {
    設定載入中(true);
    try {
      const data = await getWatchlist();
      console.log('載入影集清單完成，共', Object.keys(data).length, '筆');

      const tvEntries = Object.entries(data).filter(([, item]: any) => item.類型 === 'tv');
      const withDetail = await Promise.all(
        tvEntries.map(async ([id, item]: [string, any]) => {
          const detail = await getTMDbDetail('tv', item.tmdbId);
          return [id, { ...item, 詳細: detail }] as [string, Film];
        }),
      );
      設定清單(Object.fromEntries(withDetail));
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
    async function loadData() {
      const entries = await Promise.all(
        Object.values(清單).map(async (item) => {
          const info = await getNextEpisodeInfo(item);
          return { id: item.tmdbId.toString(), item, info };
        }),
      );
      const nextMap: Record<number, NextEpisode | null> = {};
      const upcomingList: { id: string; item: Film; episode: EpisodeInfo }[] = [];
      const specialList: { id: string; item: Film; episodes: EpisodeInfo[] }[] = [];

      for (const entry of entries) {
        nextMap[Number(entry.id)] = entry.info;

        const upcoming = await getUpcomingEpisodes(entry.item);
        upcoming.forEach((ep) => {
          upcomingList.push({ id: entry.id, item: entry.item, episode: ep });
        });

        const specials = await getUnwatchedSpecialEpisodes(entry.item);
        if (specials.length > 0 && !entry.info) {
          specialList.push({ id: entry.id, item: entry.item, episodes: specials });
        }
      }

      upcomingList.sort(
        (a, b) =>
          new Date(a.episode.air_date || 0).getTime() - new Date(b.episode.air_date || 0).getTime(),
      );

      設定下一集資訊(nextMap);
      設定即將播出集數(upcomingList);
      設定特別篇清單(specialList);
    }
    if (Object.keys(清單).length > 0) {
      loadData();
    } else {
      設定下一集資訊({});
      設定即將播出集數([]);
      設定特別篇清單([]);
    }
  }, [清單]);

  const { 有新集數未看, 有紀錄中, 尚未看過, 已看完 } = 分類排序觀看進度(清單);

  useEffect(() => {
    const prevTab = previousTabRef.current;

    if (!載入中 && 目前Tab === 'progress' && (!hasScrolledRef.current || prevTab !== 'progress')) {
      // 延後捲動，避免 Radix Tabs 變更焦點導致捲動位置被覆蓋
      setTimeout(() => {
        if (progressRef.current) {
          const top = progressRef.current.getBoundingClientRect().top + window.scrollY;
          const navHeight =
            (document.querySelector('nav') as HTMLElement | null)?.offsetHeight || 0;
          const stickyHeight = stickyRef.current?.offsetHeight || 0;
          // 將卷動位置往上多移動一些，避免被導覽列與上方 Tabs 擋住
          window.scrollTo({ top: top - navHeight - stickyHeight, behavior: 'auto' });
          hasScrolledRef.current = true;
        }
      }, 0);
    } else if (目前Tab !== 'progress') {
      window.scrollTo({ top: 0, behavior: 'auto' });
      hasScrolledRef.current = false;
    }
    previousTabRef.current = 目前Tab;
  }, [目前Tab, 載入中]);

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

  const handleOpenDetail = (item: Film, season?: number) => {
    openDetail({
      film: { ...item, 類型: 'tv' },
      from: 'progress',
      onToggleWatchlist: handleToggleWatchlist,
      追蹤狀態: Object.fromEntries(Object.keys(清單).map((id) => [Number(id), true])),
      onUpdated: 載入清單,
      season,
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Tabs value={目前Tab} onValueChange={設定目前Tab} className="w-full">
        <div
          ref={stickyRef}
          className="sticky top-16 z-20 mb-6 border-b border-zinc-700 bg-zinc-900 shadow-md backdrop-blur-md"
        >
          <div className="px-4 py-3">
            <h1 className="mb-3 text-2xl font-bold text-white">🎯 觀看進度畫面</h1>
            <TabsList className="inline-flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
              <TabsTrigger
                value="upcoming"
                className="h-10 w-[120px] text-sm text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
              >
                ⏳ <span className="ml-1">即將播出 ({即將播出集數.length})</span>
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
              <TabsTrigger
                value="specials"
                className="h-10 w-[140px] text-sm text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
              >
                🎞️ <span className="ml-1">特別篇 ({特別篇清單.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {載入中 ? (
          <EmptyState text="載入中..." loading />
        ) : 有新集數未看.length + 有紀錄中.length + 尚未看過.length === 0 &&
          即將播出集數.length === 0 ? (
          <EmptyState text="目前沒有追蹤的影集" />
        ) : (
          <>
            <TabsContent value="upcoming">
              {即將播出集數.length === 0 ? (
                <EmptyState text="目前沒有即將播出的影集" />
              ) : (
                <div className="space-y-4">
                  {即將播出集數.map(({ id, item, episode }) => (
                    <HorizontalFilmCard
                      key={`${id}-${episode.season}-${episode.episode}`}
                      film={item}
                      onClick={() => handleOpenDetail(item)}
                    >
                      <p className="text-sm text-gray-500">
                        下一集：S{episode.season}E{episode.episode}
                        {episode.name ? ` - ${episode.name}` : ''}
                      </p>
                      <p className="text-sm text-gray-500">
                        播出日：{formatDate(episode.air_date || '')}
                      </p>
                      {formatCountdown(episode.air_date || '') === '0 天後' ? (
                        <p className="mt-1 text-base font-bold text-green-400">🎉 今天播出</p>
                      ) : (
                        <p className="mt-1 text-base font-bold text-red-400">
                          {formatCountdown(episode.air_date || '')}
                        </p>
                      )}
                    </HorizontalFilmCard>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="specials">
              {特別篇清單.length === 0 ? (
                <EmptyState text="目前沒有未看特別篇" />
              ) : (
                <div className="space-y-6">
                  {特別篇清單.map(({ id, item, episodes }) => (
                    <HorizontalFilmCard
                      key={id}
                      film={item}
                      onClick={() => handleOpenDetail(item, 0)}
                    >
                      <p className="mt-1 text-xs text-gray-400">
                        尚有 {episodes.length} 集特別篇未看
                      </p>
                    </HorizontalFilmCard>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress">
              {已看完.length > 0 && (
                <>
                  <div className="mb-4 text-center text-base text-gray-400">✅ 已看完的影集</div>
                  <div className="mb-10 space-y-4">
                    {已看完.map(({ id, item }) => (
                      <HorizontalFilmCard
                        key={id}
                        film={item}
                        onClick={() => handleOpenDetail(item)}
                      >
                        <p className="mt-1 text-xs text-gray-400">已看完</p>
                      </HorizontalFilmCard>
                    ))}
                  </div>
                </>
              )}

              {[...有新集數未看, ...有紀錄中].length > 0 && (
                <div className="mb-4 text-center text-base text-gray-400" ref={progressRef}>
                  👇 正在觀看的影集
                </div>
              )}

              {[...有新集數未看, ...有紀錄中].map(({ id, item, 新集 }) => (
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
                  {新集 && (
                    <span className="ml-2 rounded bg-red-500 px-1 text-xs text-white">NEW</span>
                  )}
                </HorizontalFilmCard>
              ))}

              {尚未看過.length > 0 && (
                <>
                  <div className="mt-10 text-center text-base text-gray-400">
                    👇 尚未開始觀看的影集
                  </div>
                  <div className="mt-4 space-y-4">
                    {尚未看過.map(({ id, item }) => (
                      <HorizontalFilmCard
                        key={id}
                        film={item}
                        onClick={() => handleOpenDetail(item)}
                      >
                        <p className="mt-1 text-xs text-gray-400">尚未觀看任何集數</p>
                      </HorizontalFilmCard>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
