'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

export type WeekCalendarProps = {
  startDate: DateTime;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
};

export default function WeekCalendar({
  startDate,
  appointments,
  onAppointmentClick,
}: WeekCalendarProps) {
  const zone = 'America/Mexico_City';

  const startOfWeek = startDate.setZone(zone).startOf('week');

  const days = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.plus({ days: i })
  );

  const toMX = (iso: string) =>
    DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone);

  return (
    <div className="border rounded overflow-x-auto">
      <div className="grid grid-cols-7 border-b bg-gray-50 text-sm font-medium">
        {days.map(d => (
          <div key={d.toISODate()} className="p-2 text-center">
            {d.toFormat('ccc dd')}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 min-h-[400px]">
        {days.map(day => (
          <div key={day.toISODate()} className="border-r p-2 space-y-2">
            {appointments
              .filter(a =>
                toMX(a.starts_at).hasSame(day, 'day')
              )
              .map(a => (
                <div
                  key={a.id}
                  onClick={() => onAppointmentClick?.(a)}
                  className="cursor-pointer rounded bg-black text-white px-2 py-1 text-xs"
                >
                  <p className="font-medium truncate">
                    {a.client_name}
                  </p>
                  <p className="truncate">
                    {toMX(a.starts_at).toFormat('HH:mm')}
                  </p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
