'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { apiFetch } from '@/lib/apiFetch';

type Employee = {
  id: string;
  name: string;
};

type EmployeeSlots = {
  employee: Employee;
  slots: string[]; // ISO UTC
};

type Props = {
  serviceId: string | null;
  dateISO: string | null; // YYYY-MM-DD
  onSelect: (employeeId: string, startISO: string) => void;
  publicMode?: boolean;
};

export function EmployeeSelector({
  serviceId,
  dateISO,
  onSelect,
  publicMode = false,
}: Props) {
  const [data, setData] = useState<EmployeeSlots[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serviceId || !dateISO) return;

    let cancelled = false;
    setLoading(true);
    setData([]);

    // 1️⃣ obtener empleadas del servicio (sin hora)
    apiFetch(
      `/api/employees?serviceId=${serviceId}`,
      publicMode ? { public: true } : undefined
    )
      .then(async (employees: Employee[]) => {
        const results: EmployeeSlots[] = [];

        for (const e of employees) {
          const slots = await apiFetch<string[]>(
            `/api/appointments/employee-day-availability?serviceId=${serviceId}&employeeId=${e.id}&dateISO=${dateISO}`,
            publicMode ? { public: true } : undefined
          );

          if (slots.length) {
            results.push({ employee: e, slots });
          }
        }

        if (!cancelled) setData(results);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, dateISO, publicMode]);

  if (!serviceId || !dateISO) return null;

  return (
    <div className="mt-6 border-t border-black/10 pt-4 space-y-4">
      <h3 className="font-semibold text-sm md:text-base">
        Horarios disponibles
      </h3>

      {loading && (
        <p className="text-sm opacity-60">Cargando horarios…</p>
      )}

      {!loading && data.length === 0 && (
        <p className="text-sm text-red-600">
          No hay horarios disponibles para este día
        </p>
      )}

      <div className="space-y-4">
        {data.map(({ employee, slots }) => (
          <div key={employee.id} className="space-y-2">
            <p className="font-medium">{employee.name}</p>

            <div className="flex flex-wrap gap-2">
              {slots.map((iso) => {
                const label = DateTime
                  .fromISO(iso, { zone: 'utc' })
                  .setZone('America/Mexico_City')
                  .toFormat('HH:mm');

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => onSelect(employee.id, iso)}
                    className="px-3 py-1 rounded border border-black/20 text-sm hover:bg-black hover:text-white transition"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
