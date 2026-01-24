'use client';

import { DateTime } from 'luxon';
import { Fragment, useMemo } from 'react';
import { Appointment } from '@/lib/appointments';

const ZONE = 'America/Mexico_City';

/* =========================
   TIPOS
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
  date: DateTime;        // 🔑 MISMA FECHA DEL DASHBOARD
  period: Period;        // 🔑 MISMO PERIODO
  business: Business;
};

/* =========================
   COMPONENTE
========================= */
export function StaffAvailabilityBoard({
  employee,
  appointments,
  date,
  period,
  business,
}: Props) {
  /* =========================
     HORARIO DEL NEGOCIO
  ========================= */
  const [openH, closeH] = useMemo(() => {
    if (!business.opening_time || !business.closing_time) {
      return [8, 18];
    }

    return [
      Number(business.opening_time.split(':')[0]),
      Number(business.closing_time.split(':')[0]),
    ];
  }, [business]);

  /* =========================
     DIAS VISIBLES (IGUAL QUE AppointmentList)
  ========================= */
  const days = useMemo(() => {
    if (period === 'day') return [date];

    if (period === 'week') {
      return Array.from({ length: 7 }, (_, i) =>
        date.startOf('week').plus({ days: i })
      );
    }

    // month → se sigue mostrando por día seleccionado
    return [date];
  }, [date, period]);

  /* =========================
     CITAS DEL EMPLEADO (MISMO FILTRO)
  ========================= */
  const employeeAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (a.employee_id !== employee.id) return false;

      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(ZONE);

      if (period === 'day') return d.hasSame(date, 'day');
      if (period === 'week') {
        return d >= date.startOf('week') && d <= date.endOf('week');
      }

      return d.hasSame(date, 'day');
    });
  }, [appointments, employee.id, date, period]);

  /* =========================
     SLOT OCUPADO?
  ========================= */
  function isOccupied(slot: DateTime) {
    return employeeAppointments.some(a => {
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
      <div
        className="grid"
        style={{
          gridTemplateColumns: `80px repeat(${days.length}, 1fr)`,
        }}
      >
        {/* HEADER */}
        <div className="border-b p-2 font-medium">Hora</div>
        {days.map(d => (
          <div
            key={d.toISODate()}
            className="border-b p-2 text-center font-medium"
          >
            {d.toFormat('ccc dd')}
          </div>
        ))}

        {/* SLOTS */}
        {Array.from({ length: (closeH - openH) * 2 }).map((_, i) => {
          const hour = openH + Math.floor(i / 2);
          const minute = i % 2 === 0 ? 0 : 30;

          return (
            <Fragment key={i}>
              <div className="border-t p-2 text-sm text-gray-600">
                {String(hour).padStart(2, '0')}:
                {minute === 0 ? '00' : '30'}
              </div>

              {days.map(day => {
                const slot = day.set({ hour, minute });

                const busy = isOccupied(slot);

                return (
                  <div
                    key={slot.toISO()}
                    className={`border-t h-8 ${
                      busy
                        ? 'bg-blue-500/70'     // 🔵 OCUPADO
                        : 'bg-emerald-500/40' // 🟢 LIBRE
                    }`}
                  />
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
