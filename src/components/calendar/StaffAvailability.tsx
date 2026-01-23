'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

type Props = {
  appointments: Appointment[];
  viewMode: 'day' | 'week';
  activeDate: DateTime;
  onChangeDay?: (d: DateTime) => void;

  openingHour: number;
  closingHour: number;
};

export default function StaffAvailability({
  appointments,
  viewMode,
  activeDate,
  onChangeDay,
  openingHour,
  closingHour,
}: Props) {
  const zone = 'America/Mexico_City';

  const hours = Array.from(
    { length: closingHour - openingHour },
    (_, i) => openingHour + i
  );

  const employees = Array.from(
    new Set(appointments.map(a => a.employee_name))
  );

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    activeDate.startOf('week').plus({ days: i })
  );

  const day =
    viewMode === 'day'
      ? activeDate
      : activeDate.startOf('day');

  function overlaps(
    slotStart: DateTime,
    slotEnd: DateTime,
    apptStart: DateTime,
    apptEnd: DateTime
  ) {
    return slotStart < apptEnd && slotEnd > apptStart;
  }

  return (
    <div className="space-y-6">
      {viewMode === 'week' && onChangeDay && (
        <div className="flex gap-2 overflow-x-auto">
          {weekDays.map(d => (
            <button
              key={d.toISODate()}
              onClick={() => onChangeDay(d)}
              className={`px-3 py-1 text-sm rounded border ${
                d.hasSame(activeDate, 'day')
                  ? 'bg-black text-white'
                  : ''
              }`}
            >
              {d.toFormat('ccc dd')}
            </button>
          ))}
        </div>
      )}

      {employees.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay citas para mostrar disponibilidad.
        </p>
      )}

      {employees.map(emp => (
        <div key={emp} className="space-y-1">
          <p className="text-sm font-medium">{emp}</p>

          <div className="flex gap-1 items-center">
            {hours.map(h => {
              const slotStart = day.set({
                hour: h,
                minute: 0,
                second: 0,
                millisecond: 0,
              });

              const slotEnd = slotStart.plus({ hours: 1 });

              const busy = appointments.some(a => {
                if (a.employee_name !== emp) return false;

                const start = DateTime
                  .fromISO(a.starts_at, { zone: 'utc' })
                  .setZone(zone);

                const end = DateTime
                  .fromISO(a.ends_at, { zone: 'utc' })
                  .setZone(zone);

                if (!start.hasSame(day, 'day')) return false;

                return overlaps(
                  slotStart,
                  slotEnd,
                  start,
                  end
                );
              });

              return (
                <div
                  key={h}
                  title={`${h}:00`}
                  className={`h-4 w-6 rounded ${
                    busy ? 'bg-gray-300' : 'bg-green-500'
                  }`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
