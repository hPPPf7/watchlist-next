'use client';

import 'react-day-picker/dist/style.css';
import { DayPicker } from 'react-day-picker';
import type { SelectSingleEventHandler } from 'react-day-picker';
import { zhTW } from 'date-fns/locale';

interface StyledCalendarProps {
  selected?: Date;
  onSelect?: SelectSingleEventHandler;
}

export function StyledCalendar({ selected, onSelect }: StyledCalendarProps) {
  const today = new Date();

  return (
    <div
      style={{ colorScheme: 'dark' }}
      className="mx-auto w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 shadow"
    >
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        locale={zhTW}
        captionLayout="dropdown"
        fromYear={1925}
        toYear={new Date().getFullYear()}
        className="rdp w-full text-white"
        classNames={{
          table: 'w-full border-collapse table-fixed',
          head_row: 'flex',
          row: 'flex',
          head_cell: 'w-10 text-xs font-semibold text-center text-zinc-400',
          cell: 'w-10 h-10 text-sm text-center',
          day: 'h-10 w-10 p-0 text-sm font-medium',
          day_selected:
            'bg-green-600 text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-green-500',
          day_today: 'border border-green-400 text-white rounded-full focus:outline-none',
          day_outside: 'text-zinc-500 opacity-50',
          nav_button:
            'text-white hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500',
          caption_dropdowns: 'flex gap-2',
          dropdown_month: 'bg-zinc-800 text-white rounded p-1 border border-zinc-600 w-24',
          dropdown_year: 'bg-zinc-800 text-white rounded p-1 border border-zinc-600 w-24',
        }}
      />
    </div>
  );
}
