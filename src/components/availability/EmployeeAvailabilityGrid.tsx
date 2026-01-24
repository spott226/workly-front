'use client';

import { DateTime } from 'luxon';

const ZONE = 'America/Mexico_City';
const START_HOUR = 13;
const END_HOUR = 19;

type Props = {
  employee: { id: string; name: string };
  appointments: any[];
  date: DateTime;
  period: 'day' | 'week' | 'month';
};

export function EmployeeAvailabilityGrid({
  employee,
  appointments,
  date,
}: Props) {
  const slots: DateTime[] = [];

  for (let h = START_HOUR; h < END_HOUR; h++) {
    slots.push(date.set({ hour: h, minute: 0 }));
    slots.push(date.set({ hour: h, minute: 30 }));
  }

  function isOccupied(slot: DateTime) {
    return appointments.some(a => {
      if (a.employee_id !== employee.id) return false;

      const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);
      const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(ZONE);

      return slot >= start && slot < end;
    });
  }

  return (
    <div className="border rounded overflow-hidden">
      {slots.map(slot => (
        <div
          key={slot.toISO()}
          className={`h-8 border-t flex items-center px-3 text-xs ${
            isOccupied(slot) ? 'bg-green-500/70' : 'bg-gray-200'
          }`}
        >
          {slot.toFormat('HH:mm')}
        </div>
      ))}
    </div>
  );
}
