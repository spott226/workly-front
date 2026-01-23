'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Employee = {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  active?: boolean;
};

type Props = {
  serviceId: string | null;
  startISO?: string | null;
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

  useEffect(() => {
    if (!serviceId || !startISO) return;

    let cancelled = false;
    setLoading(true);
    setEmployees([]);
    setSelected(null);

    apiFetch<Employee[]>(
      '/employees',
      publicMode ? { public: true } : undefined
    )
      .then((res) => {
        if (cancelled) return;

        setEmployees(
          Array.isArray(res)
            ? res.filter((e) => e.active !== false)
            : []
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
          Cargando empleadas…
        </p>
      )}

      {!loading && employees.length === 0 && (
        <p className="text-sm text-red-600">
          No hay empleadas disponibles para este horario
        </p>
      )}

      <div className="space-y-3">
        {employees.map((e) => {
          const label =
            e.name ??
            `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim();

          return (
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
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
