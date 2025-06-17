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
function CustomCaption(props: { displayMonth: Date; onMonthChange?: (date: Date) => void }) {
  const handlePrevious = () => {
    const { displayMonth, onMonthChange } = props;
    onMonthChange?.(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1));
  };

  const handleNext = () => {
    const { displayMonth, onMonthChange } = props;
    onMonthChange?.(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1));
  };

  return (
    <div className="mb-2 flex w-full items-center justify-between">
      <button type="button" className="px-2" onClick={handlePrevious} aria-label="Previous month">
        ◀
      </button>
      <div className="flex-1 text-center">
        {`${props.displayMonth.getFullYear()} 年 ${props.displayMonth.getMonth() + 1} 月`}
      </div>
      <button type="button" className="px-2" onClick={handleNext} aria-label="Next month">
        ▶
      </button>
    </div>
  );
}

export function StyledCalendar({ selected, onSelect }: StyledCalendarProps) {
  const fromDate = new Date(1925, 0);
  const toDate = new Date();

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
            Caption: (captionProps: any) => <CustomCaption {...captionProps} />,
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
