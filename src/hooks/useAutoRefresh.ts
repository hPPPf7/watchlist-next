// src/hooks/useAutoRefresh.ts

import { useState, useEffect, useCallback } from 'react';

interface UseAutoRefreshOptions {
  refreshIntervalMs?: number; // 預設15分鐘（900,000毫秒）
  onRefresh: () => Promise<void>;
}

export function useAutoRefresh({
  refreshIntervalMs = 15 * 60 * 1000,
  onRefresh,
}: UseAutoRefreshOptions) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // 🆕 新增 loading 狀態

  const refresh = useCallback(async () => {
    try {
      setLoading(true); // 🚀 開始刷新
      await onRefresh();
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('自動更新失敗', err);
      setError('更新失敗');
    } finally {
      setLoading(false); // ✅ 無論成功失敗都關閉 loading
    }
  }, [onRefresh]);

  useEffect(() => {
    refresh(); // 頁面一開始先刷新一次

    const timer = setInterval(() => {
      refresh();
    }, refreshIntervalMs);

    return () => clearInterval(timer);
  }, [refresh, refreshIntervalMs]);

  return { lastUpdated, error, loading }; // 🆕 把 loading 一起回傳
}
