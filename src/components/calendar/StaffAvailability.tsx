'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

type Props = {
  appointments: Appointment[];
  viewMode: 'day' | 'week' | 'month';
  activeDate: DateTime;
};

const START_HOUR = 8;
const END_HOUR = 20;

export default function StaffAvailability({
  appointments,
  viewMode,
  activeDate,
}: Props) {
  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  // Empleadas únicas sacadas de las citas
  const employees = Array.from(
    new Set(appointments.map(a => a.employee_name))
  );

  return (
    <div className="space-y-4">
      {employees.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay citas para mostrar disponibilidad.
        </p>
      )}

      {employees.map(emp => (
        <div key={emp}>
          <p className="text-sm font-medium mb-1">{emp}</p>

          <div className="flex gap-1">
            {hours.map(h => {
              const slot = activeDate.set({
                hour: h,
                minute: 0,
                second: 0,
                millisecond: 0,
              });

              const busy = appointments.some(a => {
                if (a.employee_name !== emp) return false;

                const start = DateTime
                  .fromISO(a.starts_at, { zone: 'utc' })
                  .setZone('America/Mexico_City');

                const end = DateTime
                  .fromISO(a.ends_at, { zone: 'utc' })
                  .setZone('America/Mexico_City');

                return slot >= start && slot < end;
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
