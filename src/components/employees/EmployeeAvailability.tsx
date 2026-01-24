'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { apiFetch } from '@/lib/apiFetch';
import { EmployeeTimeSelector } from './EmployeeTimeSelector';

type Employee = {
  id: string;
  name: string;
};

type Props = {
  serviceId: string;
  date: DateTime; // fecha del día seleccionado (sin hora)
  onSelect: (employeeId: string, startISO: string) => void;
  publicMode?: boolean;
};

export function EmployeeAvailability({
  serviceId,
  date,
  onSelect,
  publicMode = false,
}: Props) {
  const zone = 'America/Mexico_City';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [slotsByEmployee, setSlotsByEmployee] = useState<
    Record<string, DateTime[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) empleados
      const emps = await apiFetch<Employee[]>(
        '/employees',
        publicMode ? { public: true } : undefined
      );
      setEmployees(emps);

      // 2) generar horas del día (cada 30 min)
      const startDay = date.setZone(zone).startOf('day');
      const slots: DateTime[] = [];
      for (let h = 8; h < 20; h++) {
        slots.push(startDay.set({ hour: h, minute: 0 }));
        slots.push(startDay.set({ hour: h, minute: 30 }));
      }

      // 3) validar cada hora contra backend (getAvailableEmployees)
      const map: Record<string, DateTime[]> = {};
      await Promise.all(
        emps.map(async emp => {
          const valid: DateTime[] = [];

          for (const t of slots) {
            try {
              const res = await apiFetch<Employee[]>(
                `/availability?serviceId=${serviceId}&startISO=${t
                  .setZone('utc')
                  .toISO()}`,
                publicMode ? { public: true } : undefined
              );

              if (Array.isArray(res) && res.find(e => e.id === emp.id)) {
                valid.push(t);
              }
            } catch {
              // ignora
            }
          }

          map[emp.id] = valid;
        })
      );

      setSlotsByEmployee(map);
      setLoading(false);
    }

    load();
  }, [serviceId, date, publicMode]);

  if (loading) {
    return <p className="text-sm opacity-60">Cargando disponibilidad…</p>;
  }

  return (
    <div className="space-y-4">
      {employees.map(emp => {
        const slots = slotsByEmployee[emp.id] ?? [];

        return (
          <div key={emp.id} className="border rounded p-3">
            <p className="font-medium mb-2">{emp.name}</p>

            <EmployeeTimeSelector
              slots={slots}
              onSelect={iso => onSelect(emp.id, iso)}
            />
          </div>
        );
      })}
    </div>
  );
}
