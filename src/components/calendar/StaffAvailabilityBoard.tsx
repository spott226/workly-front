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
  openingHour: number;
  closingHour: number;
};

const ZONE = 'America/Mexico_City';

export function StaffAvailabilityBoard({
  employees,
  appointments,
  date,
  openingHour,
  closingHour,
}: Props) {
  const slots: DateTime[] = [];

  for (let h = openingHour; h < closingHour; h++) {
    slots.push(date.set({ hour: h, minute: 0 }));
    slots.push(date.set({ hour: h, minute: 30 }));
  }

  function isOccupied(employeeName: string, slot: DateTime) {
    return appointments.some(a => {
      if (a.employee_name !== employeeName) return false;

      const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);
      const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(ZONE);

      return slot >= start && slot < end;
    });
  }

  return (
    <div className="mt-10">
      <h3 className="font-semibold mb-4">
        Disponibilidad por empleado · {date.toFormat('dd LLL yyyy')}
      </h3>

      <div className="border rounded overflow-x-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `90px repeat(${employees.length}, 1fr)`,
          }}
        >
          {/* HEADER */}
          <div className="border-b p-2 text-sm font-medium">Hora</div>

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
            <div key={slot.toISO()} className="contents">
              <div className="border-t p-2 text-xs text-gray-500">
                {slot.toFormat('HH:mm')}
              </div>

              {employees.map(e => {
                const busy = isOccupied(e.name, slot);

                return (
                  <div
                    key={e.id + slot.toISO()}
                    className={`border-t h-8 ${
                      busy ? 'bg-green-500/70' : 'bg-gray-200'
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
