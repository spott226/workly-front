'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiFetch } from '@/lib/apiFetch';
import { Appointment, getAppointments } from '@/lib/appointments';

import WeekCalendar from '@/components/calendar/WeekCalendar';
import TeamAvailability from '@/components/calendar/TeamAvailability';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';

/* =========================
   TIPOS
========================= */
type Business = {
  id: string;
  name: string;
  opening_hour?: number;
  closing_hour?: number;
};

type TodayAppointmentsSummary = {
  total: number;
  attended: number;
  pending: number;
  canceled: number;
};

type View = 'day' | 'week' | 'month' | 'year';

export default function DashboardPage() {
  const router = useRouter();
  const zone = 'America/Mexico_City';

  const [business, setBusiness] = useState<Business | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [summary, setSummary] = useState<TodayAppointmentsSummary>({
    total: 0,
    attended: 0,
    pending: 0,
    canceled: 0,
  });

  const [view, setView] = useState<View>('week');
  const [activeDate, setActiveDate] = useState(
    DateTime.now().setZone(zone)
  );

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [loading, setLoading] = useState(true);

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
        const s =
          await apiFetch<TodayAppointmentsSummary>(
            '/appointments/summary/today'
          );
        setSummary(s);
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
     FILTRO
  ========================= */
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(zone);

      if (view === 'day') return d.hasSame(activeDate, 'day');

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

  function move(delta: number) {
    if (view === 'day')
      setActiveDate(d => d.plus({ days: delta }));
    if (view === 'week')
      setActiveDate(d => d.plus({ weeks: delta }));
    if (view === 'month')
      setActiveDate(d => d.plus({ months: delta }));
    if (view === 'year')
      setActiveDate(d => d.plus({ years: delta }));
  }

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
          Dashboard · {business?.name}
        </h1>

        <button
          onClick={() => router.push('/appointments/new')}
          className="px-5 py-2 rounded bg-black text-white"
        >
          + Crear cita
        </button>
      </div>

      {/* RESUMEN */}
      <div className="mb-6 border rounded p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Hoy</p>
          <p className="text-lg font-semibold">{summary.total}</p>
        </div>
        <div>
          <p className="text-gray-500">Atendidas</p>
          <p className="text-lg font-semibold">{summary.attended}</p>
        </div>
        <div>
          <p className="text-gray-500">Pendientes</p>
          <p className="text-lg font-semibold">{summary.pending}</p>
        </div>
        <div>
          <p className="text-gray-500">Canceladas</p>
          <p className="text-lg font-semibold">{summary.canceled}</p>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
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

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => move(-1)}
            className="px-3 py-2 border rounded"
          >
            ←
          </button>

          <button
            onClick={() =>
              setActiveDate(DateTime.now().setZone(zone))
            }
            className="px-3 py-2 border rounded"
          >
            Hoy
          </button>

          <button
            onClick={() => move(1)}
            className="px-3 py-2 border rounded"
          >
            →
          </button>
        </div>
      </div>

      {/* VISTA */}
      {view === 'week' && (
        <div className="mb-6 border rounded p-4">
          <WeekCalendar
            appointments={filteredAppointments}
            startDate={activeDate}
            onAppointmentClick={setSelectedAppointment}
          />
        </div>
      )}

      {view !== 'week' && (
        <div className="mb-6 border rounded p-4 space-y-3">
          {filteredAppointments.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay citas para esta vista.
            </p>
          )}

          {filteredAppointments.map(a => (
            <div
              key={a.id}
              onClick={() => setSelectedAppointment(a)}
              className="border rounded p-3 cursor-pointer hover:bg-gray-50"
            >
              <p className="font-medium">
                {a.client_name} · {a.service_name}
              </p>
              <p className="text-sm text-gray-500">
                {DateTime.fromISO(a.starts_at, {
                  zone: 'utc',
                })
                  .setZone(zone)
                  .toFormat('dd LLL yyyy · HH:mm')}
              </p>
            </div>
          ))}
        </div>
      )}

      {(view === 'day' || view === 'week') && (
        <div className="mb-6 border rounded p-4">
          <h2 className="font-medium mb-3">
            Disponibilidad del equipo ·{' '}
            {activeDate.toFormat('dd LLL yyyy')}
          </h2>

          <TeamAvailability
            appointments={appointments}
            selectedDate={activeDate}
            openingHour={openingHour}
            closingHour={closingHour}
          />
        </div>
      )}

      {/* MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-xl relative">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-3 right-3"
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
