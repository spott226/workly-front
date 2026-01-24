'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import { apiFetch } from '@/lib/apiFetch';
import { Appointment, getAppointments } from '@/lib/appointments';

import { CalendarView } from '@/components/calendar/CalendarView';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { StaffAvailabilityBoard } from '@/components/calendar/StaffAvailabilityBoard';

type Period = 'day' | 'week' | 'month';

type Employee = {
  id: string;
  name: string;
};

type Business = {
  opening_time: string | null;
  closing_time: string | null;
};

const ZONE = 'America/Mexico_City';

export default function DashboardPage() {
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
     LOAD INITIAL DATA
  ========================= */
  useEffect(() => {
    getAppointments().then(a =>
      setAppointments(a.filter(x => x.status !== 'CANCELLED'))
    );
    apiFetch<Employee[]>('/employees').then(setEmployees);
    apiFetch<Business>('/businesses/me').then(setBusiness);
  }, []);

  /* =========================
     FILTER APPOINTMENTS
  ========================= */
  const filteredAppointments = useMemo(() => {
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
     DATE NAV
  ========================= */
  const moveDate = (dir: -1 | 1) => {
    setDate(d =>
      period === 'day'
        ? d.plus({ days: dir })
        : period === 'week'
        ? d.plus({ weeks: dir })
        : d.plus({ months: dir })
    );
  };

  if (!business) return null;

  return (
    <div className="space-y-8">
      {/* CONTROLES */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded border ${
                period === p ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              {p === 'day' && 'Día'}
              {p === 'week' && 'Semana'}
              {p === 'month' && 'Mes'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
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

      {/* DISPONIBILIDAD */}
      <div className="space-y-4">
        <h3 className="font-semibold">Disponibilidad por empleado</h3>

        <div className="flex flex-wrap gap-2">
          {employees.map(e => (
            <button
              key={e.id}
              onClick={() =>
                setSelectedEmployee(
                  selectedEmployee?.id === e.id ? null : e
                )
              }
              className={`px-4 py-2 rounded border ${
                selectedEmployee?.id === e.id
                  ? 'bg-black text-white'
                  : 'bg-white'
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>

        {selectedEmployee && (
          <StaffAvailabilityBoard
            employee={selectedEmployee}
            appointments={appointments}
            date={date}
            period={period}
            business={business}
          />
        )}
      </div>

      {/* MODAL CITA */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-lg p-4 relative">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>

            <AppointmentCard
              appointment={selectedAppointment}
              onChange={() =>
                getAppointments().then(a =>
                  setAppointments(a.filter(x => x.status !== 'CANCELLED'))
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
