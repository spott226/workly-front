'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { EmployeeAvailabilityList } from '@/components/availability/EmployeeAvailabilityList';

import { Appointment, getAppointments } from '@/lib/appointments';

/* =========================
   TIPOS
========================= */
type Period = 'day' | 'week' | 'month' | 'year';

const ZONE = 'America/Mexico_City';

/* =========================
   PAGE
========================= */
export default function DashboardPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<Period>('day');
  const [date, setDate] = useState(DateTime.now().setZone(ZONE));

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  /* =========================
     LOAD
  ========================= */
  async function loadAppointments() {
    setLoading(true);
    const data = await getAppointments();
    setAppointments(data.filter(a => a.status !== 'CANCELLED'));
    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  /* =========================
     FILTRO POR PERIODO
  ========================= */
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(ZONE);

      if (period === 'year') return d.year === date.year;
      if (period === 'month') return d.hasSame(date, 'month');
      if (period === 'week')
        return d >= date.startOf('week') && d <= date.endOf('week');

      return d.hasSame(date, 'day');
    });
  }, [appointments, period, date]);

  /* =========================
     NAV DATE
  ========================= */
  function moveDate(step: number) {
    if (period === 'day') setDate(d => d.plus({ days: step }));
    if (period === 'week') setDate(d => d.plus({ weeks: step }));
    if (period === 'month') setDate(d => d.plus({ months: step }));
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p>Cargando agenda…</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agenda</h1>

        <button
          onClick={() => router.push('/appointments/new')}
          className="px-5 py-2 rounded bg-black text-white"
        >
          + Crear cita
        </button>
      </div>

      {/* CONTROLES */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
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
        view={
          period === 'day'
            ? 'day'
            : period === 'week'
            ? 'week'
            : 'month'
        }
        onAppointmentClick={setSelectedAppointment}
      />

      {/* MODAL CITA */}
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
              onChange={loadAppointments}
            />
          </div>
        </div>
      )}

      {/* DISPONIBILIDAD POR EMPLEADO */}
      <div className="mt-10">
        <EmployeeAvailabilityList />
      </div>
    </DashboardLayout>
  );
}
