'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import { Appointment, getAppointments } from '@/lib/appointments';
import { CalendarView } from '@/components/calendar/CalendarView';
import { AppointmentModal } from './AppointmentModal';
import { apiFetch } from '@/lib/apiFetch';

/* =========================
   TIPOS
========================= */
type Period = 'day' | 'week' | 'month' | 'year';

type BusinessHours = {
  opening_time: string | null;
  closing_time: string | null;
};

/* =========================
   CONSTANTES
========================= */
const ZONE = 'America/Mexico_City';

/* =========================
   COMPONENTE
========================= */
export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessHours, setBusinessHours] =
    useState<BusinessHours | null>(null);

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('day');

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  /* =========================
     LOAD
  ========================= */
  async function loadAppointments() {
    setLoading(true);

    const [appointmentsData, businessData] = await Promise.all([
      getAppointments(),
      apiFetch<any>('/businesses/me'),
    ]);

    setAppointments(
      appointmentsData.filter(a => a.status !== 'CANCELLED')
    );

    setBusinessHours({
      opening_time: businessData.opening_time ?? null,
      closing_time: businessData.closing_time ?? null,
    });

    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  /* =========================
     FILTRO
  ========================= */
  const todayMX = DateTime.now().setZone(ZONE);

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);

      if (period === 'year') return d.year === todayMX.year;
      if (period === 'month') return d.hasSame(todayMX, 'month');
      if (period === 'week') {
        return d >= todayMX.startOf('week') && d <= todayMX.endOf('week');
      }

      return d.hasSame(todayMX, 'day');
    });
  }, [appointments, period, todayMX]);

  /* =========================
     STATES
  ========================= */
  if (loading) {
    return <p className="text-sm text-gray-500">Cargando citas…</p>;
  }

  if (!appointments.length) {
    return <p className="text-sm text-gray-500">No hay citas.</p>;
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-6">
      {/* CONTROLES */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {(['day', 'week', 'month', 'year'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm rounded-md border ${
              period === p ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            {p === 'day' && 'Hoy'}
            {p === 'week' && 'Semana'}
            {p === 'month' && 'Mes'}
            {p === 'year' && 'Año'}
          </button>
        ))}
      </div>

      {/* CALENDARIO */}
      <CalendarView
        appointments={filtered}
        view={
          period === 'day'
            ? 'day'
            : period === 'week'
            ? 'week'
            : 'month'
        }
        businessHours={businessHours}
        onAppointmentClick={setSelectedAppointment}
      />

      {/* MODAL */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onChange={() => {
            setSelectedAppointment(null);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}
