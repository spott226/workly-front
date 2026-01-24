'use client';

import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
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
  appointments: Appointment[];
};

export function StaffAvailabilityBoard({ appointments }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);

  const [period, setPeriod] = useState<Period>('day');
  const [date, setDate] = useState(DateTime.now().setZone(ZONE));
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    apiFetch<Employee[]>('/employees').then(setEmployees);
    apiFetch<Business>('/businesses/me').then(setBusiness);
  }, []);

  /* =========================
     HOURS FROM BUSINESS
  ========================= */
  const hours = useMemo(() => {
    if (!business?.opening_time || !business?.closing_time) return [];

    const startHour = Number(business.opening_time.split(':')[0]);
    const endHour = Number(business.closing_time.split(':')[0]);

    const slots: DateTime[] = [];
    for (let h = startHour; h < endHour; h++) {
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
      const d = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);

      if (period === 'month') return d.hasSame(date, 'month');
      if (period === 'week')
        return d >= date.startOf('week') && d <= date.endOf('week');

      return d.hasSame(date, 'day');
    });
  }, [appointments, period, date]);

  function isOccupied(employeeName: string, slot: DateTime) {
    return scopedAppointments.some(a => {
      if (a.employee_name !== employeeName) return false;

      const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);
      const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(ZONE);

      return slot >= start && slot < end;
    });
  }

  function moveDate(step: number) {
    if (period === 'day') setDate(d => d.plus({ days: step }));
    if (period === 'week') setDate(d => d.plus({ weeks: step }));
    if (period === 'month') setDate(d => d.plus({ months: step }));
  }

  if (!business) return null;

  return (
    <div className="mt-10 space-y-4">
      {/* CONTROLES */}
      <div className="flex gap-2 items-center">
        {(['day', 'week', 'month'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 border rounded ${
              period === p ? 'bg-black text-white' : ''
            }`}
          >
            {p === 'day' && 'Día'}
            {p === 'week' && 'Semana'}
            {p === 'month' && 'Mes'}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => moveDate(-1)}>←</button>
          <span className="font-medium">
            {date.toFormat('dd LLL yyyy')}
          </span>
          <button onClick={() => moveDate(1)}>→</button>
        </div>
      </div>

      {/* EMPLEADOS */}
      <div className="flex gap-2 flex-wrap">
        {employees.map(e => (
          <button
            key={e.id}
            onClick={() => setSelectedEmployee(e)}
            className={`px-3 py-1 border rounded ${
              selectedEmployee?.id === e.id ? 'bg-black text-white' : ''
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>

      {/* TABLA */}
      {selectedEmployee && (
        <div className="border rounded overflow-x-auto">
          <div className="grid grid-cols-[100px_1fr]">
            <div className="border-b p-2 font-medium">Hora</div>
            <div className="border-b p-2 font-medium text-center">
              {selectedEmployee.name}
            </div>

            {hours.map(slot => {
              const busy = isOccupied(selectedEmployee.name, slot);

              return (
                <>
                  <div
                    key={slot.toISO()}
                    className="border-t p-2 text-sm"
                  >
                    {slot.toFormat('HH:mm')}
                  </div>

                  <div
                    className={`border-t h-8 ${
                      busy ? 'bg-green-500/70' : 'bg-gray-200'
                    }`}
                  />
                </>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
