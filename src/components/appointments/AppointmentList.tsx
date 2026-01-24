'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import { Appointment, getAppointments } from '@/lib/appointments';
import { CalendarView } from '@/components/calendar/CalendarView';
import { AppointmentCard } from './AppointmentCard';
import { apiFetch } from '@/lib/apiFetch';

/* =========================
   TIPOS
========================= */
type Period = 'day' | 'week' | 'month' | 'year';

type Business = {
  opening_time: string | null;
  closing_time: string | null;
};

/* =========================
   CONSTANTES
========================= */
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ZONE = 'America/Mexico_City';

/* =========================
   COMPONENTE
========================= */
export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<Period>('day');
  const [date, setDate] = useState(DateTime.now().setZone(ZONE));
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const currentYear = date.year;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | null>(null);

  /* =========================
     CARGA
  ========================= */
  async function load() {
    setLoading(true);

    const [apps, biz] = await Promise.all([
      getAppointments(),
      apiFetch<Business>('/businesses/me'),
    ]);

    setAppointments(apps.filter(a => a.status !== 'CANCELLED'));
    setBusiness(biz);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* =========================
     FILTRO
  ========================= */
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(ZONE);

      if (period === 'year') return d.year === year;

      if (period === 'month') {
        const m = month ?? date.month - 1;
        return d.year === year && d.month - 1 === m;
      }

      if (period === 'week') {
        return d >= date.startOf('week') && d <= date.endOf('week');
      }

      return d.hasSame(date, 'day');
    });
  }, [appointments, period, year, month, date]);

  /* =========================
     NAVEGACIÓN DE FECHA
  ========================= */
  function moveDate(step: number) {
    if (period === 'day') setDate(d => d.plus({ days: step }));
    if (period === 'week') setDate(d => d.plus({ weeks: step }));
    if (period === 'month') setDate(d => d.plus({ months: step }));
    if (period === 'year') setDate(d => d.plus({ years: step }));
  }

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
      <div className="flex flex-col gap-4 border-b pb-4">
        {/* PERIODOS */}
        <div className="flex flex-wrap gap-2">
          {(['day', 'week', 'month', 'year'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                if (p !== 'month') setMonth(null);
              }}
              className={`px-4 py-2 text-sm rounded-md border ${
                period === p ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              {p === 'day' && 'Día'}
              {p === 'week' && 'Semana'}
              {p === 'month' && 'Mes'}
              {p === 'year' && 'Año'}
            </button>
          ))}
        </div>

        {/* SELECTORES + FECHA */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {[year - 2, year - 1, year, year + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {period === 'month' && (
            <select
              value={month ?? ''}
              onChange={e => setMonth(Number(e.target.value))}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Mes</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          )}

          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => moveDate(-1)}>←</button>
            <span className="font-medium">
              {date.toFormat('dd LLL yyyy')}
            </span>
            <button onClick={() => moveDate(1)}>→</button>
          </div>
        </div>
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
        businessHours={business}
        onAppointmentClick={setSelectedAppointment}
      />

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
