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
    setEmployees([]);
    setSelected(null);
    setError(null);

    if (!serviceId || !startISO) return;

    const url = `/api/appointments/availability?serviceId=${serviceId}&startISO=${encodeURIComponent(
      startISO
    )}`;

    setLoading(true);

    apiFetch(url, publicMode ? { public: true } : undefined)
      .then((res) => {
        setEmployees(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        setError('No hay empleados disponibles para este horario');
      })
      .finally(() => setLoading(false));
  }, [serviceId, startISO, publicMode]);

  if (!serviceId || !startISO) return null;

  return (
    <div className="mt-6 border-t pt-4 space-y-3">
      <h3 className="font-semibold text-sm md:text-base">
        Selecciona empleada
      </h3>

      {loading && (
        <p className="text-sm text-gray-500">
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
            className={`w-full text-left border rounded-lg px-4 py-3 transition ${
              selected === e.id
                ? 'border-black bg-gray-50'
                : 'hover:border-gray-400'
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>
    </div>
  );
}
