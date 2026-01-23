'use client';

import { DateTime } from 'luxon';

type Props = {
  date: DateTime;
  onMonthClick?: (date: DateTime) => void;
};

export default function YearCalendar({
  date,
  onMonthClick,
}: Props) {
  const months = Array.from({ length: 12 }, (_, i) =>
    date.set({ month: i + 1 })
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {months.map(month => (
        <div
          key={month.month}
          onClick={() => onMonthClick?.(month)}
          className="border rounded p-4 text-center cursor-pointer hover:bg-gray-50"
        >
          <p className="font-medium">
            {month.toFormat('LLLL')}
          </p>
        </div>
      ))}
    </div>
  );
}
