'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

type Props = {
  appointments: Appointment[];
  selectedDate: DateTime;
  openingHour: number;
  closingHour: number;
};

export default function TeamAvailability({
  appointments,
  selectedDate,
  openingHour,
  closingHour,
}: Props) {
  const zone = 'America/Mexico_City';

  const hours = Array.from(
    { length: closingHour - openingHour },
    (_, i) => openingHour + i
  );

  const team = Array.from(
    new Set(appointments.map(a => a.employee_name))
  );

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
      {team.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay equipo con citas este día.
        </p>
      )}

      {team.map(member => (
        <div key={member} className="border rounded p-3">
          <p className="font-medium mb-2">{member}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {hours.map(h => {
              const slotStart = selectedDate.set({
                hour: h,
                minute: 0,
                second: 0,
                millisecond: 0,
              });

              const slotEnd = slotStart.plus({ hours: 1 });

              const busy = appointments.some(a => {
                if (a.employee_name !== member) return false;

                const start = DateTime
                  .fromISO(a.starts_at, { zone: 'utc' })
                  .setZone(zone);

                const end = DateTime
                  .fromISO(a.ends_at, { zone: 'utc' })
                  .setZone(zone);

                if (!start.hasSame(selectedDate, 'day')) return false;

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
                  className={`px-3 py-2 rounded text-sm border ${
                    busy
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  {String(h).padStart(2, '0')}:00 ·{' '}
                  {busy ? 'Ocupado' : 'Disponible'}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
