'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

type Props = {
  date: DateTime;
  appointments: Appointment[];
  onDayClick?: (date: DateTime) => void;
};

export default function MonthCalendar({
  date,
  appointments,
  onDayClick,
}: Props) {
  const zone = 'America/Mexico_City';

  const startOfMonth = date.startOf('month');
  const endOfMonth = date.endOf('month');

  const start = startOfMonth.startOf('week');
  const end = endOfMonth.endOf('week');

  const days: DateTime[] = [];
  let cursor = start;

  while (cursor <= end) {
    days.push(cursor);
    cursor = cursor.plus({ days: 1 });
  }

  const hasAppointments = (day: DateTime) =>
    appointments.some(a =>
      DateTime.fromISO(a.starts_at, { zone: 'utc' })
        .setZone(zone)
        .hasSame(day, 'day')
    );

  return (
    <div className="border rounded overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-50 border-b text-sm font-medium">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="p-2 text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map(day => {
          const isCurrentMonth = day.month === date.month;

          return (
            <div
              key={day.toISODate()}
              onClick={() => onDayClick?.(day)}
              className={`h-24 border cursor-pointer p-2 text-sm ${
                isCurrentMonth ? '' : 'bg-gray-50 text-gray-400'
              }`}
            >
              <div className="flex justify-between">
                <span>{day.day}</span>
                {hasAppointments(day) && (
                  <span className="h-2 w-2 rounded-full bg-black" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
