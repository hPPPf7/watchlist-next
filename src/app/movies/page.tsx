'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/EmptyState';
import { useUser } from '@/hooks/useUser';
import { getWatchlistRaw, addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { formatDate, formatCountdown, parseLocalDate } from '@/lib/date';
import { type Film } from '@/types/Film';
import { HorizontalFilmCard } from '@/components/HorizontalFilmCard';
import { useOpenDetail } from '@/hooks/useOpenDetail';
import { getTMDbDetail } from '@/lib/api';
import { useFriends } from '@/hooks/useFriends';

type 清單資料 = Record<string, Film>;

function 分類電影(清單: 清單資料) {
  const 即將上映: [string, Film][] = [];
  const 已上映: [string, Film][] = [];

  for (const [id, item] of Object.entries(清單)) {
    if (item.類型 !== 'movie') continue;

    // ⛔️ 如果已看過，就不要分類進來
    if (item.已看紀錄?.movie) continue;

    const date = item.上映日 ? parseLocalDate(item.上映日) : null;
    if (!date || isNaN(date.getTime()) || date.getTime() > Date.now()) {
      即將上映.push([id, item]);
    } else {
      已上映.push([id, item]);
    }
  }

  即將上映.sort(
    (a, b) =>
      parseLocalDate(a[1].上映日 || '').getTime() - parseLocalDate(b[1].上映日 || '').getTime(),
  );
  已上映.sort(
    (a, b) =>
      parseLocalDate(b[1].上映日 || '').getTime() - parseLocalDate(a[1].上映日 || '').getTime(),
  );

  return { 即將上映, 已上映 };
}

function itemTime(item: Film) {
  const raw = item.已看紀錄?.movie;

  if (!raw) return 0;

  const value = typeof raw === 'object' && 'watchDate' in raw ? (raw as any).watchDate : raw;

  if (typeof value === 'string') return parseLocalDate(value).getTime();
  if (typeof value === 'object' && typeof (value as any).toDate === 'function')
    return (value as any).toDate().getTime();

  return 0;
}

export default function MovieTrackerPage() {
  const { 使用者 } = useUser();
  const { friends } = useFriends();
  const [清單, 設定清單] = useState<清單資料>({});
  const [載入中, 設定載入中] = useState(true);
  const openDetail = useOpenDetail();
  const [目前Tab, 設定目前Tab] = useState('watchlist');
  const listKeys = Object.keys(清單).join(',');

  async function 載入清單() {
    設定載入中(true);
    try {
      const data = await getWatchlistRaw();
      console.log('載入電影清單完成，共', Object.keys(data).length, '筆');
      設定清單(data);
    } catch (e) {
      console.error('讀取清單失敗', e);
      設定清單({});
    } finally {
      設定載入中(false);
    }
  }

  useEffect(() => {
    載入清單();
  }, [使用者]);

  useEffect(() => {
    if (載入中) return;
    const entries = Object.entries(清單).filter(([, item]) => !item.詳細);
    if (entries.length === 0) return;

    let cancelled = false;
    const CONCURRENCY = 5;

    const load = async (index: number) => {
      const batch = entries.slice(index, index + CONCURRENCY);
      await Promise.all(
        batch.map(async ([id, item]) => {
          try {
            const detail = await getTMDbDetail('movie', item.tmdbId);
            if (!cancelled) {
              設定清單((prev) => ({
                ...prev,
                [id]: { ...prev[id], 詳細: detail },
              }));
            }
          } catch (err) {
            console.warn('⚠️ 載入電影詳細資料失敗', err);
          }
        }),
      );
      if (!cancelled && index + CONCURRENCY < entries.length) {
        load(index + CONCURRENCY);
      }
    };

    load(0);
    return () => {
      cancelled = true;
    };
  }, [listKeys, 載入中]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [目前Tab]);

  const { 即將上映, 已上映 } = 分類電影(清單);
  const 已看 = Object.entries(清單).filter((entry) => entry[1].已看紀錄?.movie);

  const handleToggleWatchlist = async (film: Film) => {
    const is追蹤中 = !!清單[film.tmdbId.toString()];
    try {
      if (is追蹤中) {
        await removeFromWatchlist(film.tmdbId);
      } else {
        await addToWatchlist(film);
      }
      await 載入清單();
    } catch (err) {
      console.error('加入／移除清單失敗', err);
    }
  };

  const 追蹤狀態Map = Object.fromEntries(Object.keys(清單).map((id) => [Number(id), true]));

  const handleOpenDetail = (item: Film) => {
    openDetail({
      film: { ...item, 類型: 'movie' },
      from: 'movies',
      onToggleWatchlist: handleToggleWatchlist,
      追蹤狀態: 追蹤狀態Map,
      onUpdated: 載入清單,
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-4">
      <Tabs value={目前Tab} onValueChange={設定目前Tab} className="w-full">
        <div className="sticky top-16 z-20 mb-6 border-b border-zinc-700 bg-zinc-900 shadow-md backdrop-blur-md">
          <div className="px-4 py-3">
            <h1 className="mb-3 text-2xl font-bold text-white">🎬 想看電影清單</h1>
            <TabsList className="inline-flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
              <TabsTrigger
                value="countdown"
                className="h-10 w-[120px] text-sm text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
              >
                ⏳ <span className="ml-1">即將上映 ({即將上映.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="watchlist"
                className="h-10 w-[120px] text-sm text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
              >
                📌 <span className="ml-1">電影清單 ({已上映.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="watched"
                className="h-10 w-[120px] text-sm text-zinc-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
              >
                ✅ <span className="ml-1">已看清單 ({已看.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="countdown">
          {載入中 ? (
            <EmptyState text="載入中..." loading />
          ) : 即將上映.length === 0 ? (
            <EmptyState text="目前沒有即將上映的電影" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {即將上映.map(([id, item]) => (
                <HorizontalFilmCard key={id} film={item} onClick={() => handleOpenDetail(item)}>
                  <p className="text-sm text-gray-500">上映日：{formatDate(item.上映日 || '')}</p>
                  {formatCountdown(item.上映日 || '') === '0 天後' ? (
                    <p className="mt-1 text-base font-bold text-green-400">🎉 今天上映</p>
                  ) : (
                    <p className="mt-1 text-base font-bold text-red-400">
                      {formatCountdown(item.上映日 || '')}
                    </p>
                  )}
                </HorizontalFilmCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="watchlist">
          {載入中 ? (
            <EmptyState text="載入中..." loading />
          ) : 已上映.length === 0 ? (
            <EmptyState text="目前沒有已上映的電影" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {已上映.map(([id, item]) => (
                <HorizontalFilmCard key={id} film={item} onClick={() => handleOpenDetail(item)}>
                  <p className="text-sm text-gray-500">上映日：{formatDate(item.上映日 || '')}</p>
                </HorizontalFilmCard>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="watched">
          {載入中 ? (
            <EmptyState text="載入中..." loading />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(清單)
                .filter((entry) => entry[1].已看紀錄?.movie)
                .sort((a, b) => {
                  const aTime = itemTime(a[1]);
                  const bTime = itemTime(b[1]);
                  return bTime - aTime; // 依觀看時間倒序
                })
                .map(([id, item]) => {
                  const watchedRaw = item.已看紀錄?.movie;
                  const together =
                    watchedRaw && typeof watchedRaw === 'object' && 'togetherWith' in watchedRaw
                      ? (watchedRaw.togetherWith as string[])
                      : [];
                  const friendNames = together
                    .map((uid) => friends.find((f) => f.uid === uid)?.nickname || uid)
                    .join('、');
                  const value =
                    watchedRaw && typeof watchedRaw === 'object' && 'watchDate' in watchedRaw
                      ? watchedRaw.watchDate
                      : watchedRaw;
                  const watchedDate =
                    typeof value === 'string'
                      ? value
                      : (typeof value === 'object' && typeof (value as any).toDate === 'function'
                          ? (value as any).toDate().toISOString()
                          : '') || '';
                  return (
                    <HorizontalFilmCard key={id} film={item} onClick={() => handleOpenDetail(item)}>
                      <p className="text-sm text-gray-500">
                        上映日：{formatDate(item.上映日 || '')}
                      </p>
                      <p className="mt-1 text-base font-bold text-green-400">
                        觀看日期：{formatDate(watchedDate)}
                      </p>
                      {friendNames && (
                        <p className="text-sm text-zinc-400">和 {friendNames} 一起看</p>
                      )}
                    </HorizontalFilmCard>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
