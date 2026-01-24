'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import { apiFetch } from '@/lib/apiFetch';
import { Appointment, getAppointments } from '@/lib/appointments';

import { CalendarView } from '@/components/calendar/CalendarView';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { StaffAvailabilityBoard } from '@/components/calendar/StaffAvailabilityBoard';

const ZONE = 'America/Mexico_City';

type Period = 'day' | 'week' | 'month';

type Employee = {
  id: string;
  name: string;
};

type Business = {
  opening_time: string | null;
  closing_time: string | null;
};

export default function DashboardPage() {
  /* =========================
     STATE
  ========================= */
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);

  const [period, setPeriod] = useState<Period>('day');
  const [date, setDate] = useState(DateTime.now().setZone(ZONE));

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  /* =========================
     LOAD
  ========================= */
  async function load() {
    const [a, e, b] = await Promise.all([
      getAppointments(),
      apiFetch<Employee[]>('/employees'),
      apiFetch<Business>('/businesses/me'),
    ]);

    setAppointments(a.filter(x => x.status !== 'CANCELLED'));
    setEmployees(e);
    setBusiness(b);
  }

  useEffect(() => {
    load();
  }, []);

  /* =========================
     FILTRO CITAS
  ========================= */
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(ZONE);

      if (period === 'month') return d.hasSame(date, 'month');
      if (period === 'week')
        return d >= date.startOf('week') && d <= date.endOf('week');

      return d.hasSame(date, 'day');
    });
  }, [appointments, period, date]);

  /* =========================
     NAV FECHA
  ========================= */
  function moveDate(step: number) {
    if (period === 'day') setDate(d => d.plus({ days: step }));
    if (period === 'week') setDate(d => d.plus({ weeks: step }));
    if (period === 'month') setDate(d => d.plus({ months: step }));
  }

  if (!business) return null;

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-8">
      {/* CONTROLES */}
      <div className="flex flex-wrap gap-2 items-center">
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

      {/* CALENDARIO */}
      <CalendarView
        appointments={filteredAppointments}
        view={period}
        businessHours={business}
        onAppointmentClick={setSelectedAppointment}
      />

      {/* EMPLEADOS */}
      <div className="space-y-3">
        <h3 className="font-semibold">Disponibilidad por empleado</h3>

        <div className="flex flex-wrap gap-2">
          {employees.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedEmployee(e)}
              className={`px-3 py-1 border rounded ${
                selectedEmployee?.id === e.id
                  ? 'bg-black text-white'
                  : ''
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>

        {selectedEmployee && (
          <StaffAvailabilityBoard
            appointments={appointments}
          />
        )}
      </div>

      {/* MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-lg p-4 relative">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black"
            >
              ✕
            </button>

            <AppointmentCard
              appointment={selectedAppointment}
              onChange={load}
            />
          </div>
        </div>
      )}
    </div>
  );
}
