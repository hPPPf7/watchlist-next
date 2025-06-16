'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/EmptyState';
import { useUser } from '@/hooks/useUser';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { formatDate, formatCountdown } from '@/lib/date';
import { type Film } from '@/types/Film';
import { HorizontalFilmCard } from '@/components/HorizontalFilmCard';
import { useOpenDetail } from '@/hooks/useOpenDetail';

type 清單資料 = Record<string, Film>;

function 分類電影(清單: 清單資料) {
  const 即將上映: [string, Film][] = [];
  const 已上映: [string, Film][] = [];

  for (const [id, item] of Object.entries(清單)) {
    if (item.類型 !== 'movie') continue;

    // ⛔️ 如果已看過，就不要分類進來
    if (item.已看紀錄?.movie) continue;

    const date = item.上映日 ? new Date(item.上映日) : null;
    if (!date || isNaN(date.getTime()) || date.getTime() > Date.now()) {
      即將上映.push([id, item]);
    } else {
      已上映.push([id, item]);
    }
  }

  即將上映.sort(
    (a, b) => new Date(a[1].上映日 || '').getTime() - new Date(b[1].上映日 || '').getTime(),
  );
  已上映.sort(
    (a, b) => new Date(b[1].上映日 || '').getTime() - new Date(a[1].上映日 || '').getTime(),
  );

  return { 即將上映, 已上映 };
}

function itemTime(item: Film) {
  const raw = item.已看紀錄?.movie;

  if (!raw) return 0;

  if (typeof raw === 'string') return new Date(raw).getTime();
  if (typeof raw === 'object' && typeof raw.toDate === 'function') return raw.toDate().getTime();

  return 0;
}

export default function MovieTrackerPage() {
  const { 使用者 } = useUser();
  const [清單, 設定清單] = useState<清單資料>({});
  const [載入中, 設定載入中] = useState(true);
  const openDetail = useOpenDetail();
  const [目前Tab, 設定目前Tab] = useState('watchlist');

  async function 載入清單() {
    設定載入中(true);
    try {
      const data = await getWatchlist();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [目前Tab]);

  const { 即將上映, 已上映 } = 分類電影(清單);
  const 已看 = Object.entries(清單).filter(([_, item]) => item.已看紀錄?.movie);

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
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold">🎬 想看電影清單</h1>

      <Tabs value={目前Tab} onValueChange={設定目前Tab} className="w-full">
        <TabsList className="mb-6 inline-flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
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

        <TabsContent value="countdown">
          {載入中 ? (
            <EmptyState text="載入中..." loading />
          ) : 即將上映.length === 0 ? (
            <EmptyState text="目前沒有即將上映的電影" />
          ) : (
            <div className="space-y-4">
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
            <div className="space-y-4">
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
            <div className="space-y-4">
              {Object.entries(清單)
                .filter(([_, item]) => item.已看紀錄?.movie)
                .sort((a, b) => {
                  const aTime = itemTime(a[1]);
                  const bTime = itemTime(b[1]);
                  return bTime - aTime; // 依觀看時間倒序
                })
                .map(([id, item]) => (
                  <HorizontalFilmCard key={id} film={item} onClick={() => handleOpenDetail(item)}>
                    <p className="text-sm text-gray-500">
                      🎬 觀看日期：
                      {formatDate(
                        typeof item.已看紀錄?.movie === 'string'
                          ? item.已看紀錄.movie
                          : item.已看紀錄?.movie?.toDate?.().toISOString?.() || '',
                      )}
                    </p>
                  </HorizontalFilmCard>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
