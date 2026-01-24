'use client';

import { useEffect, useState } from 'react';
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
  const [slotsByEmployee, setSlotsByEmployee] = useState<Record<string, DateTime[]>>({});
  const [selectedISO, setSelectedISO] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setActiveEmployee(null);
      setSelectedISO(null);
      setSlotsByEmployee({});

      const emps = await apiFetch<Employee[]>(
        '/employees',
        publicMode ? { public: true } : undefined
      );

      const startDay = date.setZone(zone).startOf('day');
      const generated: DateTime[] = [];

      for (let h = 8; h < 20; h++) {
        generated.push(startDay.set({ hour: h, minute: 0 }));
        generated.push(startDay.set({ hour: h, minute: 30 }));
      }

      const map: Record<string, DateTime[]> = {};

      for (const emp of emps) {
        const valid: DateTime[] = [];

        for (const t of generated) {
          try {
            const res = await apiFetch<Employee[]>(
              `/appointments/availability?serviceId=${serviceId}&startISO=${t
                .setZone('utc')
                .toISO()}`,
              publicMode ? { public: true } : undefined
            );

            if (Array.isArray(res) && res.some(e => e.id === emp.id)) {
              valid.push(t);
            }
          } catch {}
        }

        // 🔥 SOLO SE AGREGA SI TIENE HORARIOS
        if (valid.length > 0) {
          map[emp.id] = valid;
        }
      }

      // 🔥 FILTRAMOS EMPLEADAS SIN SERVICIO
      setEmployees(emps.filter(e => map[e.id]?.length));
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
        const slots = slotsByEmployee[emp.id] || [];
        const label =
          emp.name ??
          `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim();

        const isActive = activeEmployee === emp.id;

        return (
          <div key={emp.id} className="border rounded-lg p-3">
            {/* EMPLEADA */}
            <button
              type="button"
              onClick={() => {
                setActiveEmployee(emp.id);
                setSelectedISO(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition
                ${
                  isActive
                    ? 'border border-emerald-400 bg-emerald-500/10'
                    : 'border border-black/10 hover:border-black/30'
                }`}
            >
              {label}
            </button>

            {/* HORARIOS */}
            {isActive && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map(t => {
                  const iso = t.setZone('utc').toISO()!;
                  const selected = selectedISO === iso;

                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => {
                        setSelectedISO(iso);
                        onSelect(emp.id, iso);
                      }}
                      className={`px-3 py-2 rounded border text-sm transition
                        ${
                          selected
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white hover:bg-emerald-50 border-black/20'
                        }`}
                    >
                      {t.toFormat('HH:mm')}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
