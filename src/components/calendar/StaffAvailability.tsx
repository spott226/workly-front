'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

type Props = {
  appointments: Appointment[];
  viewMode: 'day' | 'week';
  activeDate: DateTime;

  // horario del negocio (DINÁMICO)
  openingHour: number; // ej 8
  closingHour: number; // ej 20
};

export default function StaffAvailability({
  appointments,
  viewMode,
  activeDate,
  openingHour,
  closingHour,
}: Props) {
  const zone = 'America/Mexico_City';

  const hours = Array.from(
    { length: closingHour - openingHour },
    (_, i) => openingHour + i
  );

  // empleadas únicas
  const employees = Array.from(
    new Set(appointments.map(a => a.employee_name))
  );

  // días de la semana (si view = week)
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    activeDate.startOf('week').plus({ days: i })
  );

  // día actualmente seleccionado
  const selectedDay =
    viewMode === 'day' ? activeDate : activeDate.startOf('day');

  return (
    <div className="space-y-6">
      {/* SELECTOR DE DÍA (SOLO EN SEMANA) */}
      {viewMode === 'week' && (
        <div className="flex gap-2 overflow-x-auto">
          {weekDays.map(day => (
            <button
              key={day.toISODate()}
              onClick={() => {
                activeDate.set({
                  year: day.year,
                  month: day.month,
                  day: day.day,
                });
              }}
              className={`px-3 py-1 text-sm rounded border ${
                day.hasSame(activeDate, 'day')
                  ? 'bg-black text-white'
                  : ''
              }`}
            >
              {day.toFormat('ccc dd')}
            </button>
          ))}
        </div>
      )}

      {/* DISPONIBILIDAD */}
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
                  .setZone(zone);

                const end = DateTime
                  .fromISO(a.ends_at, { zone: 'utc' })
                  .setZone(zone);

                return (
                  start.hasSame(activeDate, 'day') &&
                  slot >= start &&
                  slot < end
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
