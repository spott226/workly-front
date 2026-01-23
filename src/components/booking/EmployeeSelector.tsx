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
};

export function EmployeeSelector({
  serviceId,
  onSelect,
  publicMode = false,
}: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    setEmployees([]);
    setSelected(null);

    apiFetch<Employee[]>(
      '/employees',
      publicMode ? { public: true } : undefined
    ).then((res) => {
      setEmployees(
        Array.isArray(res)
          ? res.filter((e) => e.active !== false)
          : []
      );
    });
  }, [serviceId, publicMode]);

  if (!serviceId) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Selecciona empleada</h3>

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
