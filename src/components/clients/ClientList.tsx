'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import ClientCard from './ClientCard';

type Period = 'day' | 'week' | 'month' | 'year';
type ViewMode = 'history' | 'recurrent' | 'noshow' | 'risk';

const PAGE_SIZE = 10;

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function ClientList() {
  const [clients, setClients] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<Period>('month');
  const [view, setView] = useState<ViewMode>('history');

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | null>(null);

  const [page, setPage] = useState(1);

  /* LOAD */
  useEffect(() => {
    async function load() {
      const res = await apiFetch<{ data: any[]; business: any }>('/clients');
      setClients(Array.isArray(res.data) ? res.data : []);
      setBusiness(res.business);
      setLoading(false);
    }

    load().catch(() => {
      setClients([]);
      setBusiness(null);
      setLoading(false);
    });
  }, []);

  /* FECHA MX */
  const toMX = (iso?: string) =>
    iso
      ? new Date(
          new Date(iso).toLocaleString('en-US', {
            timeZone: 'America/Mexico_City',
          })
        )
      : null;

  const todayMX = toMX(new Date().toISOString())!;

  /* FILTRO FECHA */
  const filteredByDate = useMemo(() => {
    return clients.filter((c) => {
      const d = toMX(c.last_visit_at);
      if (!d) return false;

      if (period === 'year') return d.getFullYear() === year;

      if (period === 'month') {
        const m = month ?? todayMX.getMonth();
        return d.getFullYear() === year && d.getMonth() === m;
      }

      if (period === 'week') {
        const day = todayMX.getDay();
        const diff = day === 0 ? -6 : 1 - day;

        const start = new Date(todayMX);
        start.setDate(todayMX.getDate() + diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        return d >= start && d <= end;
      }

      return (
        d.getDate() === todayMX.getDate() &&
        d.getMonth() === todayMX.getMonth() &&
        d.getFullYear() === year
      );
    });
  }, [clients, period, year, month]);

  /* VISTAS */
  const finalList = useMemo(() => {
    let list = [...filteredByDate];

    if (view === 'recurrent') {
      list.sort((a, b) => b.attended_count - a.attended_count);
    }

    if (view === 'noshow') {
      list.sort((a, b) => b.no_show_count - a.no_show_count);
    }

    if (view === 'risk') {
      list = list.filter((c) => c.no_show_count > c.attended_count);
      list.sort((a, b) => b.no_show_count - a.no_show_count);
    }

    if (view === 'history') {
      list.sort(
        (a, b) =>
          new Date(b.last_visit_at).getTime() -
          new Date(a.last_visit_at).getTime()
      );
    }

    return list;
  }, [filteredByDate, view]);

  /* PAGINACIÓN */
  const totalPages = Math.ceil(finalList.length / PAGE_SIZE);

  const paginatedList = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return finalList.slice(start, start + PAGE_SIZE);
  }, [finalList, page]);

  useEffect(() => {
    setPage(1);
  }, [period, view, year, month]);

  if (loading) return <p className="text-sm text-gray-500">Cargando clientes…</p>;
  if (!business) return <p className="text-sm text-gray-500">Cargando negocio…</p>;
  if (!clients.length) return <p className="text-sm text-gray-500">No hay clientes aún.</p>;

  return (
    <div className="space-y-6">
      {/* CONTROLES */}
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
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

        <div className="flex flex-wrap gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>

          {period === 'month' && (
            <select
              value={month ?? ''}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Mes</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          )}

          <select
            value={view}
            onChange={(e) => setView(e.target.value as ViewMode)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="history">Historial</option>
            <option value="recurrent">Más recurrentes</option>
            <option value="noshow">Más faltistas</option>
            <option value="risk">En riesgo</option>
          </select>
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {paginatedList.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay clientes en este rango.
          </p>
        )}

        {paginatedList.map((c) => (
          <ClientCard key={c.id} client={c} business={business} />
        ))}
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-full sm:w-auto px-4 py-2 border rounded-md disabled:opacity-40"
          >
            ← Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-full sm:w-auto px-4 py-2 border rounded-md disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
