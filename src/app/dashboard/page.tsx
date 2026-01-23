'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiFetch } from '@/lib/apiFetch';
import { Appointment, getAppointments } from '@/lib/appointments';
import WeekCalendar from '@/components/calendar/WeekCalendar';
import StaffAvailability from '@/components/calendar/StaffAvailability';

type Business = {
  id: string;
  name: string;
};

type TodayAppointmentsSummary = {
  total: number;
  attended: number;
  pending: number;
  canceled: number;
};

type ViewMode = 'day' | 'week' | 'month';

export default function DashboardPage() {
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsSummary, setAppointmentsSummary] =
    useState<TodayAppointmentsSummary>({
      total: 0,
      attended: 0,
      pending: 0,
      canceled: 0,
    });

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [activeDate, setActiveDate] = useState(
    DateTime.now().setZone('America/Mexico_City')
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const biz = await apiFetch<Business>('/businesses/me');
        setBusiness(biz);
      } catch {}

      try {
        const summary =
          await apiFetch<TodayAppointmentsSummary>(
            '/appointments/summary/today'
          );
        setAppointmentsSummary(summary);
      } catch {}

      try {
        const all = await getAppointments();
        setAppointments(all);
      } catch {
        setAppointments([]);
      }

      setLoading(false);
    }

    load();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone('America/Mexico_City');

      if (viewMode === 'day') {
        return d.hasSame(activeDate, 'day');
      }

      if (viewMode === 'month') {
        return d.hasSame(activeDate, 'month');
      }

      return (
        d >= activeDate.startOf('week') &&
        d <= activeDate.endOf('week')
      );
    });
  }, [appointments, viewMode, activeDate]);

  if (loading) {
    return (
      <DashboardLayout>
        <p>Cargando…</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Dashboard{business ? ` · ${business.name}` : ''}
        </h1>

        <button
          onClick={() => router.push('/appointments/new')}
          className="px-5 py-2 rounded bg-black text-white"
        >
          + Crear cita
        </button>
      </div>

      {/* RESUMEN */}
      <div className="mb-6 border rounded p-4">
        <h2 className="font-medium mb-3">Hoy</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Citas hoy</p>
            <p className="text-lg font-semibold">
              {appointmentsSummary.total}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Atendidas</p>
            <p className="text-lg font-semibold">
              {appointmentsSummary.attended}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Pendientes</p>
            <p className="text-lg font-semibold">
              {appointmentsSummary.pending}
            </p>
          </div>
        </div>
      </div>

      {/* SELECTOR */}
      <div className="flex gap-2 mb-4">
        {(['day', 'week', 'month'] as ViewMode[]).map(v => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`px-4 py-2 text-sm rounded border ${
              viewMode === v ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            {v === 'day' && 'Día'}
            {v === 'week' && 'Semana'}
            {v === 'month' && 'Mes'}
          </button>
        ))}
      </div>

      {/* CALENDARIO */}
      <div className="mb-6 border rounded p-4">
        <WeekCalendar
          appointments={filteredAppointments}
          viewMode={viewMode}
          activeDate={activeDate}
          onDaySelect={(d) => {
            setActiveDate(d);
            setViewMode('day');
          }}
        />
      </div>

      {/* DISPONIBILIDAD */}
      <div className="mb-6 border rounded p-4">
        <StaffAvailability
          viewMode={viewMode}
          activeDate={activeDate}
          appointments={filteredAppointments}
        />
      </div>
    </DashboardLayout>
  );
}
