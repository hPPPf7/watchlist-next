'use client';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface WatchCalendarProps {
  value: Date | null | '未知';
  onChange: (val: Date | null | '未知') => void;
  className?: string;
}

export function WatchCalendar({ value, onChange, className }: WatchCalendarProps) {
  const [選擇日期, 設定選擇日期] = useState<Date | null>(null);

  useEffect(() => {
    if (value === '未知' || value === null) {
      設定選擇日期(null);
    } else if (value instanceof Date) {
      設定選擇日期(value);
    }
  }, [value]);

  return (
    <div className={cn('space-y-4', className)}>
      <Calendar
        mode="single"
        selected={選擇日期 ?? undefined}
        onSelect={(date) => {
          設定選擇日期(date ?? null);
          if (date) onChange(date);
        }}
        className="rounded-md border border-zinc-700 bg-zinc-900 text-white"
      />

      <div className="flex justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 bg-zinc-800 hover:bg-zinc-700"
          onClick={() => onChange(new Date())}
        >
          今天
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 bg-zinc-800 hover:bg-zinc-700"
          onClick={() => onChange('未知')}
        >
          不確定日期
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={() => onChange(null)}>
          取消紀錄
        </Button>
      </div>
    </div>
  );
}
