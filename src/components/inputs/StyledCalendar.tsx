'use client';

import 'react-day-picker/dist/style.css';
import { DayPicker } from 'react-day-picker';
import type { SelectSingleEventHandler } from 'react-day-picker';

interface StyledCalendarProps {
  selected?: Date;
  onSelect?: SelectSingleEventHandler;
}

export function StyledCalendar({ selected, onSelect }: StyledCalendarProps) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-4 shadow w-full mx-auto">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        className="rdp w-full text-white"
        classNames={{
          table: 'w-full border-collapse table-fixed',
          head_row: 'flex',
          row: 'flex',
          head_cell: 'w-10 text-xs font-semibold text-center text-zinc-400',
          cell: 'w-10 h-10 text-sm text-center',
          day: 'h-10 w-10 p-0 text-sm font-medium',
          day_selected: 'bg-zinc-500 text-white font-bold rounded-full hover:bg-zinc-400',
          day_today: 'border border-zinc-600 text-zinc-400 rounded-full',
        }}
      />
    </div>
  );
}
