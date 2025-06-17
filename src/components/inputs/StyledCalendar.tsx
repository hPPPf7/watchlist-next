'use client';

import { DayPicker } from 'react-day-picker';
import { CustomCaption } from './CustomCaption';
import { zhTW } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface StyledCalendarProps {
  selected?: Date;
  onSelect?: (date?: Date) => void;
}

export function StyledCalendar({ selected, onSelect }: StyledCalendarProps) {
  const minDate = new Date(1925, 0);
  const maxDate = new Date();

  return (
    <div
      style={{ colorScheme: 'dark' }}
      className="mx-auto w-full max-w-xs rounded-xl border bg-zinc-800 p-4 shadow"
    >
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        components={{ MonthCaption: CustomCaption }}
        locale={zhTW}
        hidden={{ before: minDate }}
        disabled={{ after: maxDate }}
        classNames={{
          nav_button: 'group text-white hover:text-green-400',
          chevron: 'w-4 h-4 fill-current transition-colors duration-200',
          table: 'w-full border-collapse table-fixed',
          head_row: 'flex',
          row: 'flex',
          head_cell: 'w-10 text-xs text-center text-zinc-400',
          cell: 'w-10 h-10 text-center',
          day: 'h-10 w-10 p-0 text-sm hover:bg-zinc-700 rounded-full',
          day_button: 'flex items-center justify-center w-full h-full',
          selected: 'bg-green-500 text-white font-semibold',
          today: 'border-green-400 text-green-400',
          day_selected: 'bg-green-500 text-white rounded-full',
          day_today: 'border border-green-500 text-green-400 rounded-full',
        }}
      />
    </div>
  );
}
