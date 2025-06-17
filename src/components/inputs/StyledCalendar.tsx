'use client';

import { DayPicker } from 'react-day-picker';
import type { SelectSingleEventHandler } from 'react-day-picker';
import 'react-day-picker/src/style.css';
import { zhTW } from 'date-fns/locale';

interface StyledCalendarProps {
  selected?: Date;
  onSelect?: SelectSingleEventHandler;
}

// 🧩 自訂 Caption 組件
function CustomCaption(props: {
  date: Date;
  onChangeMonth?: (date: Date) => void;
  fromYear: number;
  toYear: number;
  localeCode: string;
}) {
  const years: number[] = [];
  for (let y = props.fromYear; y <= props.toYear; y++) years.push(y);

  const monthIndex = props.date.getMonth();
  const yearIndex = props.date.getFullYear();

  return (
    <div className="mb-2 flex items-center justify-center gap-2">
      <select
        className="w-24 rounded border border-zinc-600 bg-zinc-800 p-1 text-white"
        value={monthIndex}
        onChange={(e) => props.onChangeMonth?.(new Date(yearIndex, Number(e.target.value)))}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <option key={i} value={i}>
            {new Intl.DateTimeFormat(props.localeCode, { month: 'long' }).format(new Date(2000, i))}
          </option>
        ))}
      </select>

      <select
        className="w-24 rounded border border-zinc-600 bg-zinc-800 p-1 text-white"
        value={yearIndex}
        onChange={(e) => props.onChangeMonth?.(new Date(Number(e.target.value), monthIndex))}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

export function StyledCalendar({ selected, onSelect }: StyledCalendarProps) {
  const fromDate = new Date(1925, 0);
  const toDate = new Date();
  const localeCode = 'zh-TW';

  return (
    <div
      style={{ colorScheme: 'dark' }}
      className="mx-auto w-full max-w-xs rounded-xl border bg-zinc-800 p-4 shadow"
    >
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        locale={zhTW}
        fromDate={fromDate}
        toDate={toDate}
        components={
          {
            Caption: (captionProps: any) => (
              <CustomCaption
                {...captionProps}
                fromYear={fromDate.getFullYear()}
                toYear={toDate.getFullYear()}
                localeCode={localeCode}
              />
            ),
          } as any
        }
        classNames={{
          nav: 'hidden',
          table: 'w-full border-collapse table-fixed',
          head_row: 'flex',
          row: 'flex',
          head_cell: 'w-10 text-xs text-center text-zinc-400',
          cell: 'w-10 h-10 text-center',
          day: 'h-10 w-10 p-0 text-sm hover:bg-zinc-700 rounded-full',
          day_button: 'flex items-center justify-center w-full h-full',
          selected: 'bg-green-500 text-white font-semibold', // 高亮整個圓
          today: 'border-green-400 text-green-400', // 今天加一圈
          day_selected: 'bg-green-500 text-black rounded-full',
          day_today: 'border border-green-500 text-green-400 rounded-full',
        }}
      />
    </div>
  );
}
