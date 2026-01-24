'use client';

import { DateTime } from 'luxon';
import { Fragment, useMemo } from 'react';
import { Appointment } from '@/lib/appointments';

const ZONE = 'America/Mexico_City';

type Employee = {
  id: string;
  name: string;
};

type Business = {
  opening_time: string | null;
  closing_time: string | null;
};

type Period = 'day' | 'week' | 'month';

type Props = {
  employee: Employee;
  appointments: Appointment[];
  date: DateTime;
  period: Period;
  business: Business;
};

export function StaffAvailabilityBoard({
  employee,
  appointments,
  date,
  period,
  business,
}: Props) {
  /* =========================
     HOURS
  ========================= */
  const hours = useMemo(() => {
    if (!business.opening_time || !business.closing_time) return [];

    const [openH] = business.opening_time.split(':').map(Number);
    const [closeH] = business.closing_time.split(':').map(Number);

    const slots: DateTime[] = [];

    for (let h = openH; h < closeH; h++) {
      slots.push(date.set({ hour: h, minute: 0 }));
      slots.push(date.set({ hour: h, minute: 30 }));
    }

    return slots;
  }, [business, date]);

  /* =========================
     FILTER APPOINTMENTS
  ========================= */
  const scopedAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(ZONE);

      if (period === 'day') return d.hasSame(date, 'day');
      if (period === 'week')
        return d >= date.startOf('week') && d <= date.endOf('week');

      return d.hasSame(date, 'month');
    });
  }, [appointments, period, date]);

  /* =========================
     SLOT STATUS
  ========================= */
  function isOccupied(slot: DateTime) {
    return scopedAppointments.some(a => {
      if (a.employee_name !== employee.name) return false;

      const start = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(ZONE);

      const end = DateTime
        .fromISO(a.ends_at, { zone: 'utc' })
        .setZone(ZONE);

      return slot >= start && slot < end;
    });
  }

  return (
    <div className="border rounded overflow-x-auto">
      <div className="grid grid-cols-[100px_1fr]">
        <div className="border-b p-2 font-medium">Hora</div>
        <div className="border-b p-2 font-medium text-center">
          {employee.name}
        </div>

        {hours.map(slot => {
          const busy = isOccupied(slot);

          return (
            <Fragment key={slot.toISO()}>
              <div className="border-t p-2 text-sm">
                {slot.toFormat('HH:mm')}
              </div>

              <div
                className={`border-t h-8 ${
                  busy ? 'bg-green-500/70' : 'bg-gray-200'
                }`}
              />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
