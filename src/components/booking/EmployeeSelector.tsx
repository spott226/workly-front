'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Employee = {
  id: string;
  name: string;
};

type Props = {
  serviceId: string | null;
  startISO: string | null;
  onSelect: (employeeId: string) => void;
  publicMode?: boolean;
};

export function EmployeeSelector({
  serviceId,
  startISO,
  onSelect,
  publicMode = false,
}: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId || !startISO) return;

    let cancelled = false;

    setEmployees([]);
    setSelected(null);
    setError(null);
    setLoading(true);

    const url = `/api/appointments/availability?serviceId=${serviceId}&startISO=${encodeURIComponent(
      startISO
    )}`;

    apiFetch(url, publicMode ? { public: true } : undefined)
      .then((res) => {
        if (!cancelled) {
          setEmployees(Array.isArray(res) ? res : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('No hay empleados disponibles para este horario');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, startISO, publicMode]);

  if (!serviceId || !startISO) return null;

  return (
    <div className="mt-6 border-t border-black/10 pt-4 space-y-3">
      <h3 className="font-semibold text-sm md:text-base">
        Selecciona empleada
      </h3>

      {loading && (
        <p className="text-sm opacity-60">
          Cargando disponibilidad…
        </p>
      )}

      {!loading && error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && employees.length === 0 && (
        <p className="text-sm text-red-600">
          No hay empleados disponibles para este horario
        </p>
      )}

      <div className="space-y-3">
        {employees.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => {
              setSelected(e.id);
              onSelect(e.id);
            }}
            className={`w-full text-left rounded-lg px-4 py-3 transition border
              ${
                selected === e.id
                  ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-500/10'
                  : 'border-black/10 hover:border-black/30'
              }`}
          >
            {e.name}
          </button>
        ))}
      </div>
    </div>
  );
}
