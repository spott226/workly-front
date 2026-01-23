'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiFetch } from '@/lib/apiFetch';
import { Appointment, getAppointments } from '@/lib/appointments';
import WeekCalendar from '@/components/calendar/WeekCalendar';

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
        setAppointments(all.filter(a => a.status !== 'CANCELLED'));
      } catch {
        setAppointments([]);
      }

      setLoading(false);
    }

    load();
  }, []);

  const filteredAppointments = useMemo(() => {
    const today = DateTime.now().setZone('America/Mexico_City');

    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone('America/Mexico_City');

      return (
        d >= today.startOf('week') &&
        d <= today.endOf('week')
      );
    });
  }, [appointments]);

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

          <div>
            <p className="text-gray-500">Canceladas</p>
            <p className="text-lg font-semibold">
              {appointmentsSummary.canceled}
            </p>
          </div>
        </div>
      </div>

      {/* CALENDARIO SEMANAL */}
      <div className="mb-6 border rounded p-4">
        <WeekCalendar
          appointments={filteredAppointments}
          onAppointmentClick={(appt) => {
            router.push(`/appointments/${appt.id}`);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
