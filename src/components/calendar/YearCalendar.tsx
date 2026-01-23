'use client';

import { DateTime } from 'luxon';

type Props = {
  date: DateTime;                 // fecha activa (año base)
  onMonthClick?: (month: DateTime) => void;
};

export default function YearCalendar({
  date,
  onMonthClick,
}: Props) {
  const year = date.year;

  const months = Array.from({ length: 12 }, (_, i) =>
  DateTime.fromObject(
    { year, month: i + 1, day: 1 },
    { zone: date.zone }
  )
);


  return (
    <div className="border rounded p-4">
      <div className="text-center font-medium mb-4">
        {year}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {months.map(month => (
          <button
            key={month.month}
            type="button"
            onClick={() => onMonthClick?.(month)}
            className="border rounded p-4 text-center hover:bg-gray-50"
          >
            {month.toFormat('LLLL')}
          </button>
        ))}
      </div>
    </div>
  );
}
