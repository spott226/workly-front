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
  onSelect: (employeeId: string) => void;
  publicMode?: boolean;
  slug?: string; // 👈 necesario para público
};

export function EmployeeSelector({
  serviceId,
  onSelect,
  publicMode = false,
  slug,
}: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serviceId) return;

    let cancelled = false;
    setEmployees([]);
    setSelected(null);
    setLoading(true);

    const url = publicMode
      ? `/employees/public?slug=${slug}&serviceId=${serviceId}`
      : `/employees?serviceId=${serviceId}`;

    apiFetch<Employee[]>(
      url,
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
      .catch(() => {
        if (!cancelled) setEmployees([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, publicMode, slug]);

  if (!serviceId) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Selecciona empleada</h3>

      {loading && (
        <p className="text-sm opacity-60">Cargando personal…</p>
      )}

      {!loading && employees.length === 0 && (
        <p className="text-sm text-red-500">
          No hay personal asignado a este servicio
        </p>
      )}

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
            className={`w-full text-left rounded-lg px-4 py-3 border transition
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
  );
}
