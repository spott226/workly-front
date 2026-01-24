'use client';

import { useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { apiFetch } from '@/lib/apiFetch';

type Employee = {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
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
  const [activeEmployee, setActiveEmployee] = useState<string | null>(null);
  const [slots, setSlots] = useState<DateTime[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // cache simple en memoria
  const cacheRef = useRef<
    Map<string, DateTime[]>
  >(new Map());

  /* =========================
     CARGAR EMPLEADOS (1 request)
  ========================= */
  useEffect(() => {
    async function loadEmployees() {
      setLoadingEmployees(true);
      setActiveEmployee(null);
      setSlots([]);

      const emps = await apiFetch<Employee[]>(
        `/employees?serviceId=${serviceId}`,
        publicMode ? { public: true } : undefined
      );

      setEmployees(Array.isArray(emps) ? emps : []);
      setLoadingEmployees(false);
    }

    loadEmployees();
  }, [serviceId, date, publicMode]);

  /* =========================
     CARGAR HORARIOS (solo al click)
  ========================= */
  async function loadSlots(employeeId: string) {
    setActiveEmployee(employeeId);
    setLoadingSlots(true);
    setSlots([]);

    const cacheKey = `${serviceId}-${employeeId}-${date.toISODate()}`;
    const cached = cacheRef.current.get(cacheKey);

    if (cached) {
      setSlots(cached);
      setLoadingSlots(false);
      return;
    }

    const startDay = date.setZone(zone).startOf('day');
    const hours: DateTime[] = [];

    for (let h = 8; h < 20; h++) {
      hours.push(startDay.set({ hour: h, minute: 0 }));
      hours.push(startDay.set({ hour: h, minute: 30 }));
    }

    // ⚡ requests en paralelo
    const results = await Promise.all(
      hours.map(async (t) => {
        try {
          const res = await apiFetch<Employee[]>(
            `/appointments/availability?serviceId=${serviceId}&startISO=${t
              .setZone('utc')
              .toISO()}`,
            publicMode ? { public: true } : undefined
          );

          return Array.isArray(res) && res.some(e => e.id === employeeId)
            ? t
            : null;
        } catch {
          return null;
        }
      })
    );

    const validSlots = results.filter(Boolean) as DateTime[];
    cacheRef.current.set(cacheKey, validSlots);

    setSlots(validSlots);
    setLoadingSlots(false);
  }

  if (loadingEmployees) {
    return <p className="text-sm opacity-60">Cargando empleadas…</p>;
  }

  return (
    <div className="space-y-4">
      {employees.map(emp => {
        const label =
          emp.name ??
          `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim();

        const active = emp.id === activeEmployee;

        return (
          <div key={emp.id} className="border rounded-lg p-3">
            {/* EMPLEADA */}
            <button
              type="button"
              onClick={() => loadSlots(emp.id)}
              className={`w-full text-left rounded-md px-4 py-3 font-medium transition
                ${
                  active
                    ? 'bg-emerald-500/15 border border-emerald-400'
                    : 'bg-white hover:bg-gray-100'
                }`}
            >
              {label}
            </button>

            {/* HORARIOS */}
            {active && (
              <div className="mt-3">
                {loadingSlots ? (
                  <p className="text-sm opacity-60">Cargando horarios…</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-red-500">
                    Esta empleada no tiene horarios disponibles
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map(t => {
                      const iso = t.setZone('utc').toISO()!;
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => onSelect(emp.id, iso)}
                          className="rounded-md px-3 py-2 text-sm border bg-emerald-500/10 border-emerald-400 hover:bg-emerald-500/20"
                        >
                          {t.toFormat('HH:mm')}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
