'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type HistoryItem = {
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: 'PRESENT' | 'ABSENT';

  arrived_late?: boolean;
  arrived_early?: boolean;
  left_late?: boolean;
  left_early?: boolean;

  expected_check_in?: string | null;
};

function formatDateMX(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Mexico_City',
  });
}

export function AttendanceHistory({ employeeId }: { employeeId: string }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await apiFetch<HistoryItem[]>(
      `/employees/${employeeId}/attendance-history`
    );
    setItems(data);
    setLoading(false);
  };

  const toggle = async () => {
    if (!open) await load();
    setOpen(!open);
  };

  return (
    <div className="mt-3">
      <button
        onClick={toggle}
        className="text-sm underline text-gray-600"
      >
        {open ? 'Ocultar historial' : 'Ver historial'}
      </button>

      {open && (
        <div className="mt-3 border rounded-lg bg-white text-sm">
          {loading && (
            <p className="p-3 text-gray-500">Cargando…</p>
          )}

          {!loading && items.length === 0 && (
            <p className="p-3 text-gray-500">Sin registros</p>
          )}

          {!loading &&
            items.map((h) => {
              const arrivedEarly =
                h.arrived_early ??
                (h.check_in &&
                  h.expected_check_in &&
                  h.check_in < h.expected_check_in);

              return (
                <div
                  key={h.date}
                  className="flex flex-col sm:flex-row sm:justify-between gap-2 p-3 border-b last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {formatDateMX(h.date)}
                    </p>

                    <p className="text-gray-500">
                      Entrada: {h.check_in ?? '—'} · Salida:{' '}
                      {h.check_out ?? '—'}
                    </p>
                  </div>

                  <div className="text-xs space-y-0.5 sm:text-right">
                    {h.arrived_late && (
                      <p className="text-red-600">Llegó tarde</p>
                    )}
                    {arrivedEarly && (
                      <p className="text-blue-600">Llegó antes</p>
                    )}
                    {h.left_early && (
                      <p className="text-yellow-600">Salida temprana</p>
                    )}
                    {h.left_late && (
                      <p className="text-orange-600">Salió tarde</p>
                    )}
                    {h.status === 'ABSENT' && (
                      <p className="text-gray-500">No asistió</p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
