'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { apiFetch } from '@/lib/apiFetch';
import { EmployeeTimeSelector } from './EmployeeTimeSelector';

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
  const [slotsByEmployee, setSlotsByEmployee] = useState<Record<string, Slot[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const emps = await apiFetch<Employee[]>(
        '/employees',
        publicMode ? { public: true } : undefined
      );

      setEmployees(emps);

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
        const slots = (slotsByEmployee[emp.id] ?? []).map(s =>
          DateTime.fromISO(s.startISO, { zone: 'utc' }).setZone(zone)
        );

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
