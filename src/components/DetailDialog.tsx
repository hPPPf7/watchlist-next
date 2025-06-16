'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { getTMDbDetail, tmdbFetch } from '@/lib/api';
import { Film } from '@/types/Film';
import { useUser } from '@/hooks/useUser';
import { DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { updateMovieWatchDate, updateEpisodeWatchDate } from '@/lib/watchlist';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StyledCalendar } from '@/components/inputs/StyledCalendar';
import { logWatchedRecord } from '@/lib/popular';

interface DetailDialogProps {
  film: Film | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from: 'search' | 'progress' | 'movies';
  onToggleWatchlist?: (film: Film) => Promise<void>;
  onUpdated?: () => void;
  追蹤狀態?: Record<number, boolean | 'loading'>;
}

export function DetailDialog({
  film,
  open,
  onOpenChange,
  from,
  onToggleWatchlist,
  onUpdated,
  追蹤狀態,
}: DetailDialogProps) {
  const { 使用者 } = useUser();
  const [詳細資料, 設定詳細資料] = useState<Record<string, any> | null>(() => {
    if (film?.詳細 && Object.keys(film.詳細).length > 0) return film.詳細;
    return null;
  });
  const [loading, 設定loading] = useState(false);
  const [error, 設定error] = useState<string | null>(null);
  const [已觀看日期文字, 設定已觀看日期文字] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [季資料, 設定季資料] = useState<any[]>([]);
  const [集數資料, 設定集數資料] = useState<any[]>([]);
  const [選擇的季, 設定選擇的季] = useState<number>(1);
  const [暫時追蹤狀態, 設定暫時追蹤狀態] = useState<boolean | 'loading' | null>(null);
  const is追蹤中 =
    暫時追蹤狀態 === 'loading'
      ? true // 或 false，看你希望 loading 狀態時顯示哪個樣式
      : 暫時追蹤狀態 !== null
        ? 暫時追蹤狀態
        : 追蹤狀態?.[film?.tmdbId ?? -1] === true;
  const is處理中 = 暫時追蹤狀態 === 'loading' || 追蹤狀態?.[film?.tmdbId ?? -1] === 'loading';
  const [觀看日期, 設定觀看日期] = useState<Date | 'forgot' | null>(null);
  const [已確認, 設定已確認] = useState(false);
  const [日期輸入, 設定日期輸入] = useState('');
  const [輸入錯誤, 設定輸入錯誤] = useState(false);
  const [錯誤訊息, 設定錯誤訊息] = useState('');
  const [日曆開啟, 設定日曆開啟] = useState(false);
  const [集數日期, 設定集數日期] = useState<Record<string, Date | null>>({});
  const [展開中的Popover, 設定展開中的Popover] = useState<number | null>(null);
  const [目前選擇的集數ID, 設定目前選擇的集數ID] = useState<number | null>(null);
  const [暫存日期, 設定暫存日期] = useState<Date | null>(null);
  const [編輯模式, 設定編輯模式] = useState(false);

  useEffect(() => {
    if (open && film) {
      const 無詳細資料 = !film.詳細 || Object.keys(film.詳細).length === 0;

      if (!無詳細資料) {
        設定詳細資料(film.詳細 && Object.keys(film.詳細).length > 0 ? film.詳細 : null);
        設定error(null);
        設定loading(false);
      } else {
        (async () => {
          try {
            設定loading(true);
            const 資料 = await getTMDbDetail(film.類型, film.tmdbId);
            設定詳細資料(資料);
          } catch (err: any) {
            console.error('取得詳細資料失敗', err);
            設定error('⚠️ 載入詳細資料失敗');
          } finally {
            設定loading(false);
          }
        })();
      }
    }
  }, [open, film]);

  useEffect(() => {
    if (open && film?.類型 === 'tv') {
      (async () => {
        try {
          const 資料 = await getTMDbDetail('tv', film.tmdbId);
          設定季資料(資料.seasons || []);
          const firstSeason =
            資料.seasons?.find((s: any) => s.season_number === 1) || 資料.seasons?.[0];
          if (firstSeason) {
            設定選擇的季(firstSeason.season_number);
            await 載入集數(film.tmdbId, firstSeason.season_number);
          }
        } catch (err) {
          console.error('載入季資料失敗', err);
        }
      })();
    }
  }, [open, film]);

  async function 載入集數(tvId: number, seasonNumber: number) {
    try {
      const data = await tmdbFetch<{ episodes: any[] }>(`/tv/${tvId}/season/${seasonNumber}`);
      設定集數資料(data.episodes || []);
    } catch (err) {
      console.error('載入集數資料失敗', err);
    }
  }

  /** 解析電影觀看日期，支援 string、Timestamp 或 'forgot' */
  useEffect(() => {
    if (film?.類型 !== 'movie') {
      設定已觀看日期文字(null);
      return;
    }

    const raw = film.已看紀錄?.movie ?? film.詳細?.watchRecord?.movie ?? film.詳細?.已看紀錄?.movie;

    if (!raw || raw === 'forgot') {
      設定已觀看日期文字(null);
    } else if (typeof raw === 'string') {
      const matched = /^\d{4}-\d{2}-\d{2}$/.exec(raw);
      設定已觀看日期文字(matched ? matched[0] : null);
    } else if (typeof raw === 'object' && typeof raw.toDate === 'function') {
      const date = raw.toDate();
      if (!isNaN(date.getTime())) {
        設定已觀看日期文字(date.toISOString().slice(0, 10));
      } else {
        設定已觀看日期文字(null);
      }
    } else {
      設定已觀看日期文字(null);
    }
  }, [film]);

  useEffect(() => {
    if (open && film) {
      if (film.類型 === 'tv' && from === 'progress') {
        setActiveTab('episodes');
      } else {
        setActiveTab('info');
      }
    }
  }, [open, film, from]);

  useEffect(() => {
    if (open && film?.類型 === 'tv') {
      const record = film.詳細?.watchRecord?.episodes ?? {};
      const parsed: Record<string, Date | null> = {};

      for (const key in record) {
        const dateStr = record[key];
        if (dateStr) parsed[key] = new Date(dateStr);
      }

      設定集數日期(parsed);
    }
  }, [open, film]);

  /** 當彈窗開啟且為電影時，載入既有的觀看紀錄 */
  useEffect(() => {
    if (!open || film?.類型 !== 'movie') return;

    const raw = film.已看紀錄?.movie ?? film.詳細?.watchRecord?.movie ?? film.詳細?.已看紀錄?.movie;

    let parsed: Date | 'forgot' | null = null;

    if (raw === 'forgot') {
      parsed = 'forgot';
    } else if (typeof raw === 'string') {
      parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(raw) : null;
    } else if (typeof raw === 'object' && typeof raw.toDate === 'function') {
      const d = raw.toDate();
      if (!isNaN(d.getTime())) parsed = d;
    }

    if (parsed) {
      設定觀看日期(parsed);
      if (parsed instanceof Date) {
        設定日期輸入(format(parsed, 'yyyy/MM/dd'));
      } else {
        設定日期輸入('');
      }
      設定已確認(true);
    } else {
      設定觀看日期(null);
      設定日期輸入('');
      設定已確認(false);
    }
  }, [open, film]);

  useEffect(() => {
    if (!open) {
      設定觀看日期(null);
      設定已確認(false);
      設定日期輸入('');
      設定輸入錯誤(false);
      設定錯誤訊息('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <DialogContent className="hide-close-button fixed left-1/2 top-1/2 z-50 w-full max-w-full -translate-x-1/2 -translate-y-1/2 overflow-hidden sm:max-w-5xl">
        {' '}
        <DialogTitle asChild>
          <VisuallyHidden>
            <h2>詳細資料</h2>
          </VisuallyHidden>
        </DialogTitle>
        <DialogDescription className="sr-only">
          顯示這部作品的基本資訊、劇情簡介與觀看紀錄
        </DialogDescription>
        {film && (
          <div className="relative flex h-full flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
              <TabsList className="flex justify-center bg-zinc-800 p-2">
                <TabsTrigger value="info" className="flex-1">
                  📄 詳細資料
                </TabsTrigger>
                <TabsTrigger value="episodes" className="flex-1">
                  📖 觀看紀錄
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 gap-6 overflow-y-auto p-6">
                {loading ? (
                  <div className="w-full animate-pulse text-center text-sm text-gray-400">
                    載入中...
                  </div>
                ) : error ? (
                  <div className="w-full text-center text-sm text-red-400">{error}</div>
                ) : (
                  <>
                    <TabsContent value="info">
                      <div className="flex flex-col gap-6 sm:flex-row">
                        <div className="hidden w-60 shrink-0 sm:block">
                          <div className="relative aspect-[2/3] w-full overflow-hidden rounded">
                            <ImageWithFallback
                              src={film.封面圖}
                              alt={film.title}
                              className="absolute inset-0 size-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col space-y-4">
                          <div className="flex justify-between items-start">
                            <h2 className="flex flex-wrap items-center gap-2 text-2xl font-bold">
                              {film.title}
                              {film.類型 === 'tv' && 詳細資料?.status && (
                                <span className="rounded-full border border-zinc-600 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                                  {詳細資料.status === 'Returning Series'
                                    ? '連載中'
                                    : 詳細資料.status === 'Ended'
                                      ? '已完結'
                                      : '狀態不明'}
                                </span>
                              )}
                            </h2>

                            {/* 👉 加入/移除清單按鈕 */}
                            {onToggleWatchlist &&
                              (已觀看日期文字 ? (
                                <Button
                                  size="sm"
                                  disabled
                                  className="text-green-500 border border-green-500 bg-transparent cursor-default"
                                >
                                  已觀看：{已觀看日期文字}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className={
                                    is追蹤中
                                      ? 'bg-red-600 hover:bg-red-500 text-white'
                                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                                  }
                                  disabled={is處理中}
                                  onClick={async () => {
                                    if (!film) return;
                                    設定暫時追蹤狀態('loading');
                                    await onToggleWatchlist(film);
                                    設定暫時追蹤狀態(!is追蹤中);
                                    onUpdated?.();
                                  }}
                                >
                                  {is處理中 ? '處理中...' : is追蹤中 ? '移除清單' : '加入清單'}
                                </Button>
                              ))}
                          </div>

                          {/* 類型＋年份 */}
                          <div className="text-sm text-zinc-400">
                            {film.類型 === 'tv'
                              ? (() => {
                                  const startYear = 詳細資料?.first_air_date?.slice(0, 4);
                                  const endYear = 詳細資料?.last_air_date?.slice(0, 4);
                                  return startYear && endYear
                                    ? startYear === endYear
                                      ? `影集｜${startYear}`
                                      : `影集｜${startYear} ~ ${endYear}`
                                    : '影集｜?';
                                })()
                              : 詳細資料?.release_date
                                ? `電影｜${詳細資料.release_date.slice(0, 4)}`
                                : '電影｜?'}
                          </div>

                          {/* 時長＋國家＋語言 */}
                          <div className="flex flex-wrap gap-2 text-sm text-zinc-400">
                            {(詳細資料?.runtime ?? 詳細資料?.episode_run_time?.[0]) && (
                              <span>
                                ⏳ {詳細資料?.runtime ?? 詳細資料?.episode_run_time?.[0]} 分鐘
                              </span>
                            )}
                            {詳細資料?.production_countries?.length > 0 && (
                              <span>
                                🌍{' '}
                                {詳細資料?.production_countries.map((c: any) => c.name).join('、')}
                              </span>
                            )}
                            {詳細資料?.original_language && (
                              <span>🗣️ {詳細資料.original_language.toUpperCase()}</span>
                            )}
                          </div>
                          {詳細資料?.overview && (
                            <div>
                              <h3 className="text-lg font-semibold">劇情簡介</h3>
                              <p className="whitespace-pre-line text-sm text-zinc-300">
                                {詳細資料.overview}
                              </p>
                            </div>
                          )}
                          {詳細資料?.homepage && (
                            <a
                              href={詳細資料.homepage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-400 hover:underline"
                            >
                              官方網站 🔗
                            </a>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="episodes">
                      {film.類型 === 'movie' ? (
                        <div className="flex flex-col items-center gap-4">
                          {已確認 && !編輯模式 ? (
                            <>
                              <h3 className="text-xl font-bold text-white">🎬 目前紀錄</h3>
                              <p className="text-lg text-zinc-200">
                                {觀看日期 === 'forgot'
                                  ? '❓ 忘記日期'
                                  : format(觀看日期 as Date, 'yyyy-MM-dd')}
                              </p>
                              <div className="mt-4 flex gap-3">
                                <Button onClick={() => 設定編輯模式(true)}>✏️ 編輯紀錄</Button>
                                <Button
                                  variant="destructive"
                                  onClick={async () => {
                                    if (!film) return;
                                    await updateMovieWatchDate(film.tmdbId, null);
                                    設定觀看日期(null);
                                    設定已確認(false);
                                    設定已觀看日期文字(null);
                                    設定編輯模式(false);
                                    await onUpdated?.();
                                    toast.success('🗑️ 已取消觀看紀錄');
                                  }}
                                >
                                  🗑️ 取消紀錄
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <StyledCalendar
                                  selected={觀看日期 instanceof Date ? 觀看日期 : undefined}
                                  onSelect={(date) => {
                                    if (!date) return;

                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);

                                    if (date <= today) {
                                      設定觀看日期(date);
                                    } else {
                                      toast.error('❌ 日期不能晚於今天');
                                    }
                                  }}
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button onClick={() => 設定觀看日期(new Date())}>📅 今天</Button>
                                <Button onClick={() => 設定觀看日期('forgot')}>❓ 忘記日期</Button>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  className="bg-green-600"
                                  onClick={async () => {
                                    if (!film) return;
                                    const formatted =
                                      觀看日期 === 'forgot'
                                        ? 'forgot'
                                        : format(觀看日期 as Date, 'yyyy-MM-dd');
                                    await updateMovieWatchDate(film.tmdbId, formatted);
                                    await logWatchedRecord(film.tmdbId, 'movie');
                                    設定已確認(true);
                                    設定編輯模式(false);
                                    await onUpdated?.();
                                    toast.success('✅ 已儲存觀看紀錄');
                                  }}
                                >
                                  ✅ 確認紀錄
                                </Button>
                                {已確認 && (
                                  <Button variant="ghost" onClick={() => 設定編輯模式(false)}>
                                    取消編輯
                                  </Button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">選擇季數：</span>
                            <select
                              className="rounded border bg-zinc-800 p-1 text-sm"
                              value={選擇的季}
                              onChange={async (e) => {
                                const 季 = parseInt(e.target.value);
                                設定選擇的季(季);
                                await 載入集數(film.tmdbId, 季);
                              }}
                            >
                              {季資料.map((s) => (
                                <option key={s.id} value={s.season_number}>
                                  第 {s.season_number} 季（{s.episode_count} 集）
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid max-h-[50vh] gap-2 overflow-y-auto pr-1">
                            {集數資料.map((ep) => {
                              const key = `${ep.season_number}-${ep.episode_number}`;
                              const selectedDate = 集數日期[key] ?? null;

                              return (
                                <div key={ep.id} className="w-full">
                                  {/* 上層列 */}
                                  <div
                                    className={cn(
                                      'flex justify-between items-center p-2 rounded',
                                      selectedDate ? 'bg-zinc-700' : 'bg-zinc-800',
                                    )}
                                  >
                                    <div className="text-sm">
                                      {`S${ep.season_number}E${ep.episode_number}`} -{' '}
                                      {ep.name || '未命名集數'}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-zinc-300"
                                      onClick={() => {
                                        設定目前選擇的集數ID((prev) =>
                                          prev === ep.id ? null : ep.id,
                                        );
                                        設定暫存日期(selectedDate);
                                      }}
                                    >
                                      📅{' '}
                                      {selectedDate
                                        ? format(selectedDate, 'yyyy/MM/dd')
                                        : '新增日期'}
                                    </Button>
                                  </div>

                                  {/* 展開日曆 */}
                                  {目前選擇的集數ID === ep.id && (
                                    <div className="rounded-b border-t border-zinc-700 bg-zinc-900 p-4">
                                      <StyledCalendar
                                        selected={暫存日期 ?? undefined}
                                        onSelect={async (date) => {
                                          if (date) {
                                            const key = `${ep.season_number}-${ep.episode_number}`;
                                            await updateEpisodeWatchDate(
                                              film.tmdbId,
                                              key,
                                              format(date, 'yyyy-MM-dd'),
                                            );
                                            await logWatchedRecord(film.tmdbId, 'tv');
                                            設定集數日期((prev) => ({ ...prev, [key]: date }));
                                            設定目前選擇的集數ID(null);
                                            await onUpdated?.();
                                            toast.success(
                                              `✅ 已儲存：${format(date, 'yyyy/MM/dd')}`,
                                            );
                                          }
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
