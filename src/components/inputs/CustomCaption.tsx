'use client';

import {
  CaptionLabel,
  NextMonthButton,
  PreviousMonthButton,
  useDayPicker,
  type MonthCaptionProps,
} from 'react-day-picker';

export function CustomCaption({ children, ...divProps }: MonthCaptionProps) {
  const { previousMonth, nextMonth, labels, goToMonth } = useDayPicker();

  return (
    <div {...divProps} className="flex items-center">
      <PreviousMonthButton
        type="button"
        className="mr-1 px-1 hover:text-green-400"
        tabIndex={previousMonth ? undefined : -1}
        aria-disabled={previousMonth ? undefined : true}
        aria-label={labels.labelPrevious(previousMonth)}
        onClick={() => previousMonth && goToMonth(previousMonth)}
      >
        ◀
      </PreviousMonthButton>
      <CaptionLabel className="flex-1 text-center">{children}</CaptionLabel>
      <NextMonthButton
        type="button"
        className="ml-1 px-1 hover:text-green-400"
        tabIndex={nextMonth ? undefined : -1}
        aria-disabled={nextMonth ? undefined : true}
        aria-label={labels.labelNext(nextMonth)}
        onClick={() => nextMonth && goToMonth(nextMonth)}
      >
        ▶
      </NextMonthButton>
    </div>
  );
}
