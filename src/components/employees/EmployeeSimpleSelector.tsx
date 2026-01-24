'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Employee = {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
};

type Props = {
  onSelect: (employee: Employee | null) => void;
};

export function EmployeeSimpleSelector({ onSelect }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Employee[]>('/employees')
      .then(res => setEmployees(Array.isArray(res) ? res : []))
      .catch(() => setEmployees([]));
  }, []);

  return (
    <div className="max-w-sm space-y-2">
      <label className="text-sm font-medium">Empleado</label>

      <select
        value={selected ?? ''}
        onChange={(e) => {
          const id = e.target.value;
          setSelected(id);
          const emp = employees.find(e => e.id === id) ?? null;
          onSelect(emp);
        }}
        className="w-full border rounded px-3 py-2 text-sm"
      >
        <option value="">Selecciona empleado</option>
        {employees.map(e => (
          <option key={e.id} value={e.id}>
            {e.name ?? `${e.first_name ?? ''} ${e.last_name ?? ''}`}
          </option>
        ))}
      </select>
    </div>
  );
}
