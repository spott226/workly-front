'use client';

import { DateTime } from 'luxon';

type Appointment = {
  employee_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

type Employee = {
  id: string;
  name: string;
};

type BusinessHours = {
  opening_time: string; // "13:00"
  closing_time: string; // "21:00"
};

type Props = {
  employee: Employee;
  appointments: Appointment[];
  date: Date;
  business: BusinessHours;
};

export default function StaffAvailabilityBoard({
  employee,
  appointments,
  date,
  business,
}: Props) {
  if (!employee || !business) return null;

  const zone = 'America/Mexico_City';
  const day = DateTime.fromJSDate(date).setZone(zone);

  const opening = DateTime.fromISO(
    `${day.toISODate()}T${business.opening_time}`,
    { zone }
  );

  const closing = DateTime.fromISO(
    `${day.toISODate()}T${business.closing_time}`,
    { zone }
  );

  // slots de 30 min
  const slots: DateTime[] = [];
  let cursor = opening;

  while (cursor < closing) {
    slots.push(cursor);
    cursor = cursor.plus({ minutes: 30 });
  }

  const employeeAppointments = appointments.filter(
    (a) =>
      a.employee_id === employee.id &&
      a.status !== 'CANCELLED'
  );

  function isOccupied(slot: DateTime) {
    return employeeAppointments.some((a) => {
      const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(zone);
      const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(zone);
      return slot >= start && slot < end;
    });
  }

  return (
    <div className="border rounded mt-4 overflow-hidden">
      <div className="grid grid-cols-[80px_1fr] border-b font-semibold bg-gray-50">
        <div className="p-2">Hora</div>
        <div className="p-2">{employee.name}</div>
      </div>

      {slots.map((slot) => {
        const occupied = isOccupied(slot);

        return (
          <div
            key={slot.toISO()}
            className="grid grid-cols-[80px_1fr] border-b text-sm"
          >
            <div className="p-2 text-gray-600">
              {slot.toFormat('HH:mm')}
            </div>

            <div
              className={`p-2 ${
                occupied
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-200'
              }`}
            >
              {occupied ? 'Ocupado' : 'Libre'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
