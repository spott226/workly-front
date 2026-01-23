'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiFetch } from '@/lib/apiFetch';
import { Appointment, getAppointments } from '@/lib/appointments';

import WeekCalendar from '@/components/calendar/WeekCalendar';
import StaffAvailability from '@/components/calendar/StaffAvailability';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';

type Business = {
  id: string;
  name: string;
  opening_hour?: number; // ej: 8
  closing_hour?: number; // ej: 20
};

type TodayAppointmentsSummary = {
  total: number;
  attended: number;
  pending: number;
  canceled: number;
};

type View = 'day' | 'week' | 'month' | 'year';

export default function DashboardPage() {
  const zone = 'America/Mexico_City';

  /* =========================
     STATE
  ========================= */
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

  const [view, setView] = useState<View>('week');
  const [activeDate, setActiveDate] = useState(
    DateTime.now().setZone(zone)
  );

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  /* =========================
     LOAD
  ========================= */
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

  /* =========================
     FILTRADO POR VISTA
  ========================= */
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(zone);

      if (view === 'day') {
        return d.hasSame(activeDate, 'day');
      }

      if (view === 'week') {
        return (
          d >= activeDate.startOf('week') &&
          d <= activeDate.endOf('week')
        );
      }

      if (view === 'month') {
        return (
          d.year === activeDate.year &&
          d.month === activeDate.month
        );
      }

      return d.year === activeDate.year;
    });
  }, [appointments, view, activeDate]);

  if (loading) {
    return (
      <DashboardLayout>
        <p>Cargando…</p>
      </DashboardLayout>
    );
  }

  const openingHour = business?.opening_hour ?? 8;
  const closingHour = business?.closing_hour ?? 20;

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Dashboard{business ? ` · ${business.name}` : ''}
        </h1>
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

      {/* SELECTOR DE VISTA */}
      <div className="flex gap-2 mb-4">
        {(['day', 'week', 'month', 'year'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 text-sm border rounded ${
              view === v ? 'bg-black text-white' : ''
            }`}
          >
            {v === 'day' && 'Día'}
            {v === 'week' && 'Semana'}
            {v === 'month' && 'Mes'}
            {v === 'year' && 'Año'}
          </button>
        ))}
      </div>

      {/* CALENDARIO */}
      <div className="mb-6 border rounded p-4">
        <WeekCalendar
          appointments={filteredAppointments}
          startDate={activeDate}
          onAppointmentClick={(appt) =>
            setSelectedAppointment(appt)
          }
        />
      </div>

      {/* DISPONIBILIDAD STAFF (HOY / SEMANA) */}
      {(view === 'day' || view === 'week') && (
        <div className="mb-6 border rounded p-4">
          <h2 className="font-medium mb-3">
            Disponibilidad del staff
          </h2>

          <StaffAvailability
            appointments={filteredAppointments}
            viewMode={view}
            activeDate={activeDate}
            openingHour={openingHour}
            closingHour={closingHour}
          />
        </div>
      )}

      {/* MODAL CITA */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-xl relative">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-3 right-3 text-gray-500"
            >
              ✕
            </button>

            <AppointmentCard
              appointment={selectedAppointment}
              onChange={async () => {
                const all = await getAppointments();
                setAppointments(
                  all.filter(a => a.status !== 'CANCELLED')
                );
                setSelectedAppointment(null);
              }}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
