'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { AttendanceRow, AttendanceItem } from './AttendanceRow';

const ITEMS_PER_PAGE = 4;

export function AttendanceList() {
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await apiFetch<AttendanceItem[]>(
        '/employees/attendance/today'
      );
      setItems(data);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Cargando asistencia…
      </p>
    );
  }

  if (!items.length) {
    return (
      <p className="text-sm text-gray-500">
        No hay asistencias registradas hoy.
      </p>
    );
  }

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const visibleItems = items.slice(start, end);

  return (
    <div className="space-y-4">
      {/* LISTA */}
      <div className="w-full border rounded-lg divide-y bg-white">
        {visibleItems.map(item => (
          <AttendanceRow
            key={item.employee_id}
            item={item}
            onRefresh={load}
          />
        ))}
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-full sm:w-auto px-4 py-2 border rounded-md disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-gray-600">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-full sm:w-auto px-4 py-2 border rounded-md disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
