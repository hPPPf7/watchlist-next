'use client';

import { DayPicker } from 'react-day-picker';
import type { SelectSingleEventHandler } from 'react-day-picker';
import { zhTW } from 'date-fns/locale';

interface StyledCalendarProps {
  selected?: Date;
  onSelect?: SelectSingleEventHandler;
}

export function StyledCalendar({ selected, onSelect }: StyledCalendarProps) {
  return (
    <div
      style={{ colorScheme: 'dark' }}
      className="mx-auto w-full max-w-xs rounded-xl border border-zinc-700 bg-zinc-800 p-4 shadow"
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
          day: 'h-10 w-10 p-0 text-sm font-medium transition-colors hover:bg-zinc-700 rounded-full',
          day_selected:
            'bg-green-500 text-black font-bold rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-400',
          day_today: 'border border-green-500 text-green-400 font-semibold rounded-full',
          day_outside: 'text-zinc-500 opacity-50',
          nav_button:
            'text-white hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500',
          caption_dropdowns: 'flex gap-2 mb-2 justify-center',
          dropdown_month: 'bg-zinc-800 text-white rounded p-1 border border-zinc-600 w-24',
          dropdown_year: 'bg-zinc-800 text-white rounded p-1 border border-zinc-600 w-24',
        }}
        modifiersClassNames={{
          selected: 'bg-green-500 text-black',
          today: 'border border-green-500 text-green-400',
        }}
      />
    </div>
  );
}
