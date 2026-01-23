'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { apiFetch } from '@/lib/apiFetch';

type Employee = {
  id: string;
  name: string;
};

type Slot = {
  startISO: string;
};

type Props = {
  serviceId: string;
  date: DateTime;
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
    Record<string, Slot[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1️⃣ traer TODAS las empleadas
      const emps = await apiFetch<Employee[]>(
        '/employees',
        publicMode ? { public: true } : undefined
      );

      setEmployees(emps);

      // 2️⃣ traer slots por empleada
      const map: Record<string, Slot[]> = {};

      await Promise.all(
        emps.map(async emp => {
          const slots = await apiFetch<Slot[]>(
            `/availability?serviceId=${serviceId}&employeeId=${emp.id}&date=${date.toISODate()}`,
            publicMode ? { public: true } : undefined
          );

          map[emp.id] = slots;
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

            {slots.length === 0 ? (
              <p className="text-sm text-gray-400">
                Sin horarios disponibles
              </p>
            ) : (
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                onChange={e =>
                  onSelect(emp.id, e.target.value)
                }
              >
                <option value="">Selecciona horario</option>
                {slots.map(s => {
                  const t = DateTime
                    .fromISO(s.startISO, { zone: 'utc' })
                    .setZone(zone);

                  return (
                    <option key={s.startISO} value={s.startISO}>
                      {t.toFormat('HH:mm')}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}
