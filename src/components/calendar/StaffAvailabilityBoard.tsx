'use client';

import { DateTime } from 'luxon';
import { Fragment, useMemo } from 'react';
import { Appointment } from '@/lib/appointments';

const ZONE = 'America/Mexico_City';

/* =========================
   TYPES
========================= */
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

/* =========================
   HELPERS
========================= */
function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* =========================
   COMPONENT
========================= */
export function StaffAvailabilityBoard({
  employee,
  appointments,
  date,
  period,
  business,
}: Props) {
  /* =========================
     BUSINESS HOURS
  ========================= */
  const hours = useMemo(() => {
    if (!business.opening_time || !business.closing_time) return [];

    const [openH, openM] = business.opening_time.split(':').map(Number);
    const [closeH, closeM] = business.closing_time.split(':').map(Number);

    const slots: DateTime[] = [];

    let cursor = date
      .setZone(ZONE)
      .set({ hour: openH, minute: openM, second: 0 });

    const end = date
      .setZone(ZONE)
      .set({ hour: closeH, minute: closeM, second: 0 });

    while (cursor < end) {
      slots.push(cursor);
      cursor = cursor.plus({ minutes: 30 });
    }

    return slots;
  }, [business, date]);

  /* =========================
     FILTER APPOINTMENTS (PERIOD)
  ========================= */
  const scopedAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(ZONE);

      if (period === 'day') {
        return d.hasSame(date, 'day');
      }

      if (period === 'week') {
        return (
          d >= date.startOf('week') &&
          d <= date.endOf('week')
        );
      }

      return d.hasSame(date, 'month');
    });
  }, [appointments, period, date]);

  /* =========================
     SLOT STATUS
  ========================= */
  function isOccupied(slot: DateTime) {
    return scopedAppointments.some(a => {
      if (
        !a.employee_name ||
        normalizeName(a.employee_name) !==
          normalizeName(employee.name)
      ) {
        return false;
      }

      const start = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(ZONE);

      const end = DateTime
        .fromISO(a.ends_at, { zone: 'utc' })
        .setZone(ZONE);

      return slot >= start && slot < end;
    });
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="border rounded overflow-x-auto">
      <div className="grid grid-cols-[100px_1fr]">
        {/* HEADER */}
        <div className="border-b p-2 font-medium">
          Hora
        </div>
        <div className="border-b p-2 font-medium text-center">
          {employee.name}
        </div>

        {/* SLOTS */}
        {hours.map(slot => {
          const busy = isOccupied(slot);

          return (
            <Fragment key={slot.toISO()}>
              <div className="border-t p-2 text-sm">
                {slot.toFormat('HH:mm')}
              </div>

              <div
                className={`border-t h-8 transition ${
                  busy
                    ? 'bg-blue-500/80'
                    : 'bg-emerald-400/70'
                }`}
              />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
