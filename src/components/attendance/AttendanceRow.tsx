'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { AttendanceHistory } from './AttendanceHistory';

export type AttendanceItem = {
  employee_id: string;
  first_name: string;
  last_name: string;
  check_in?: string | null;
  check_out?: string | null;
  expected_check_in?: string | null;
  expected_check_out?: string | null;
  tolerance_minutes?: number | null;
};

export function AttendanceRow({
  item,
  onRefresh,
}: {
  item: AttendanceItem;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [tolerance, setTolerance] = useState(0);

  useEffect(() => {
    setCheckInTime(item.expected_check_in || '');
    setCheckOutTime(item.expected_check_out || '');
    setTolerance(item.tolerance_minutes ?? 0);
  }, [item]);

  const hasCheckInToday = !!item.check_in;
  const hasCheckOutToday = !!item.check_out;

  const checkIn = async () => {
    try {
      const now = new Date().toTimeString().slice(0, 5);
      await apiFetch(`/employees/${item.employee_id}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ time: now }),
      });
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Error al marcar entrada');
    }
  };

  const checkOut = async () => {
    try {
      const now = new Date().toTimeString().slice(0, 5);
      await apiFetch(`/employees/${item.employee_id}/check-out`, {
        method: 'POST',
        body: JSON.stringify({ time: now }),
      });
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Error al marcar salida');
    }
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);
      await apiFetch(`/employees/${item.employee_id}/schedule`, {
        method: 'PATCH',
        body: JSON.stringify({
          expected_check_in: checkInTime || null,
          expected_check_out: checkOutTime || null,
          tolerance_minutes: tolerance,
        }),
      });
      setEditing(false);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Error al guardar horario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium truncate">
            {item.first_name} {item.last_name}
          </p>

          <p className="text-sm text-gray-500">
            Entrada: {hasCheckInToday ? item.check_in : '—'} · Salida:{' '}
            {hasCheckOutToday ? item.check_out : '—'}
          </p>

          {!hasCheckInToday && (
            <p className="text-xs text-gray-400">
              Sin asistencia registrada hoy
            </p>
          )}

          {hasCheckInToday && hasCheckOutToday && (
            <p className="text-xs text-green-600">
              Asistencia de hoy cerrada
            </p>
          )}
        </div>

        {/* ACCIONES */}
        <div className="flex gap-2">
          {!hasCheckInToday && (
            <button
              onClick={checkIn}
              className="px-4 py-2 rounded-md bg-black text-white text-sm"
            >
              Entrada
            </button>
          )}

          {hasCheckInToday && !hasCheckOutToday && (
            <button
              onClick={checkOut}
              className="px-4 py-2 rounded-md bg-gray-200 text-sm"
            >
              Salida
            </button>
          )}
        </div>
      </div>

      {/* HORARIO */}
      {!editing ? (
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-sm text-gray-600">
          <div className="space-y-1">
            <p>
              Entrada esperada:{' '}
              <strong>{item.expected_check_in ?? '—'}</strong>
            </p>
            <p>
              Salida esperada:{' '}
              <strong>{item.expected_check_out ?? '—'}</strong>
            </p>
            <p>
              Tolerancia:{' '}
              <strong>{item.tolerance_minutes ?? 0} min</strong>
            </p>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="self-start text-sm underline"
          >
            Editar horario
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500">
                Entrada esperada
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="border rounded-md px-3 py-2 w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">
                Salida esperada
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="border rounded-md px-3 py-2 w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">
                Tolerancia (min)
              </label>
              <input
                type="number"
                min={0}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="border rounded-md px-3 py-2 w-full text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-md border text-sm"
            >
              Cancelar
            </button>

            <button
              onClick={saveSchedule}
              disabled={saving}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* HISTORIAL */}
      <AttendanceHistory employeeId={item.employee_id} />
    </div>
  );
}
