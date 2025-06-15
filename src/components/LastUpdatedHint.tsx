'use client';

import { useEffect, useState } from 'react';

interface LastUpdatedHintProps {
  lastUpdated: Date | null;
}

export function LastUpdatedHint({ lastUpdated }: LastUpdatedHintProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // 每 10 秒更新一次
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000); // 10000ms = 10秒

    return () => clearInterval(timer);
  }, []);

  if (!lastUpdated) return null;

  const diffMs = now.getTime() - lastUpdated.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  let displayText = '';

  if (diffMinutes < 1) {
    displayText = '剛剛';
  } else if (diffMinutes < 60) {
    displayText = `${diffMinutes} 分鐘前`;
  } else if (diffHours < 24) {
    displayText = `${diffHours} 小時前`;
  } else if (diffDays < 30) {
    displayText = `${diffDays} 天前`;
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    displayText = `${diffMonths} 個月前`;
  } else {
    const diffYears = Math.floor(diffDays / 365);
    displayText = `${diffYears} 年前`;
  }

  return (
    <div className="my-6 pb-4 text-center text-sm text-zinc-400">
      （上次更新：{displayText}）
    </div>
  );
}
