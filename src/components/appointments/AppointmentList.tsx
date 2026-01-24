'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import { Appointment, getAppointments } from '@/lib/appointments';
import { AppointmentCard } from './AppointmentCard';
import { CalendarView } from '@/components/calendar/CalendarView';

/* =========================
   TIPOS
========================= */
type Period = 'day' | 'week' | 'month' | 'year';
type ViewMode = 'list' | 'calendar';

/* =========================
   CONSTANTES
========================= */
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const PAGE_SIZE = 10;
const ZONE = 'America/Mexico_City';

/* =========================
   COMPONENTE
========================= */
export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<Period>('day');
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  const currentYear = DateTime.now().setZone(ZONE).year;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  /* =========================
     CARGA
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
     FILTRO
  ========================= */
  const todayMX = DateTime.now().setZone(ZONE);

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(ZONE);

      if (period === 'year') return d.year === year;

      if (period === 'month') {
        const m = month ?? todayMX.month - 1;
        return d.year === year && d.month - 1 === m;
      }

      if (period === 'week') {
        return d >= todayMX.startOf('week') && d <= todayMX.endOf('week');
      }

      return d.hasSame(todayMX, 'day');
    });
  }, [appointments, period, year, month, todayMX]);

  /* =========================
     ORDEN + PAGINACIÓN
  ========================= */
  const statusPriority: Record<string, number> = {
    PENDING: 1,
    CONFIRMED: 2,
    ATTENDED: 3,
    NO_SHOW: 3,
  };

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const pA = statusPriority[a.status] ?? 99;
      const pB = statusPriority[b.status] ?? 99;
      if (pA !== pB) return pA - pB;

      return (
        DateTime.fromISO(a.starts_at).toMillis() -
        DateTime.fromISO(b.starts_at).toMillis()
      );
    });
  }, [filtered]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [period, year, month, viewMode]);

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
              {p === 'day' && 'Hoy'}
              {p === 'week' && 'Semana'}
              {p === 'month' && 'Mes'}
              {p === 'year' && 'Año'}
            </button>
          ))}
        </div>

        {/* SELECTORES */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
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

          {/* VISTA */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm rounded-md border ${
                viewMode === 'calendar' ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              Calendario
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm rounded-md border ${
                viewMode === 'list' ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      {viewMode === 'calendar' ? (
        <CalendarView
          appointments={filtered}
          view={
            period === 'day'
              ? 'day'
              : period === 'week'
              ? 'week'
              : 'month'
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {paginated.length === 0 && (
              <p className="text-sm text-gray-500">
                No hay citas en este rango.
              </p>
            )}

            {paginated.map(a => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                onChange={loadAppointments}
              />
            ))}
          </div>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 text-sm border rounded-md disabled:opacity-40"
              >
                Anterior
              </button>

              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-sm border rounded-md disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
