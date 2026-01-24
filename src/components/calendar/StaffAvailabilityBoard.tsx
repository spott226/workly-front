'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

type Employee = {
  id: string;
  name: string;
};

type Props = {
  employees: Employee[];
  appointments: Appointment[];
  date: DateTime;
};

const ZONE = 'America/Mexico_City';
const START_HOUR = 8;
const END_HOUR = 22;

export function StaffAvailabilityBoard({
  employees,
  appointments,
  date,
}: Props) {
  const slots: DateTime[] = [];

  for (let h = START_HOUR; h < END_HOUR; h++) {
    slots.push(date.set({ hour: h, minute: 0 }));
    slots.push(date.set({ hour: h, minute: 30 }));
  }

 function isOccupied(employeeId: string, slot: DateTime) {
  return appointments.some(a => {
    if (a.employee_id !== employeeId) return false;

    const start = DateTime.fromISO(a.starts_at, { zone: 'utc' })
      .setZone(ZONE);

    const end = DateTime.fromISO(a.ends_at, { zone: 'utc' })
      .setZone(ZONE);

    return slot >= start && slot < end;
  });
}

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-3">
        Disponibilidad por empleado · {date.toFormat('dd LLL yyyy')}
      </h3>

      <div className="border rounded overflow-x-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `100px repeat(${employees.length}, 1fr)`,
          }}
        >
          {/* HEADER */}
          <div className="border-b p-2 text-sm font-medium">
            Hora
          </div>

          {employees.map(e => (
            <div
              key={e.id}
              className="border-b p-2 text-sm font-medium text-center"
            >
              {e.name}
            </div>
          ))}

          {/* GRID */}
          {slots.map(slot => (
            <>
              <div
                key={slot.toISO()}
                className="border-t p-2 text-xs text-gray-500"
              >
                {slot.toFormat('HH:mm')}
              </div>

              {employees.map(e => {
                const busy = isOccupied(e.id, slot);

                return (
                  <div
                    key={e.id + slot.toISO()}
                    className={`border-t h-8 ${
                      busy
                        ? 'bg-green-500/70'
                        : 'bg-gray-200'
                    }`}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
