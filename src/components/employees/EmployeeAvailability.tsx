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
  slug?: string;
};

export function EmployeeAvailability({
  serviceId,
  date,
  onSelect,
  publicMode = false,
  slug,
}: Props) {
  const zone = 'America/Mexico_City';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [slots, setSlots] = useState<DateTime[]>([]);
  const [selectedISO, setSelectedISO] = useState<string | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* =========================
     CARGAR EMPLEADOS
  ========================= */
  useEffect(() => {
    if (!serviceId || !date) return;

    async function loadEmployees() {
      setLoadingEmployees(true);
      setEmployees([]);
      setActiveEmployeeId(null);
      setSlots([]);
      setSelectedISO(null);

      try {
        const url = publicMode
          ? `/employees/public?slug=${slug}`
          : '/employees';

        const res = await apiFetch<Employee[]>(
          url,
          publicMode ? { public: true } : undefined
        );

        setEmployees(Array.isArray(res) ? res : []);
      } catch {
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    }

    loadEmployees();
  }, [serviceId, date, publicMode, slug]);

  /* =========================
     CARGAR HORARIOS
  ========================= */
  async function loadSlots(employeeId: string) {
    setActiveEmployeeId(employeeId);
    setSlots([]);
    setSelectedISO(null);
    setLoadingSlots(true);

    const startDay = date.setZone(zone).startOf('day');
    const generated: DateTime[] = [];

    for (let h = 8; h < 20; h++) {
      generated.push(startDay.set({ hour: h, minute: 0 }));
      generated.push(startDay.set({ hour: h, minute: 30 }));
    }

    const valid: DateTime[] = [];

    for (const t of generated) {
      try {
        const res = await apiFetch<Employee[]>(
          `/appointments/availability?serviceId=${serviceId}&startISO=${t
            .setZone('utc')
            .toISO()}`,
          publicMode ? { public: true } : undefined
        );

        if (Array.isArray(res) && res.some(e => e.id === employeeId)) {
          valid.push(t);
        }
      } catch {}
    }

    setSlots(valid);
    setLoadingSlots(false);
  }

  /* =========================
     UI
  ========================= */
  if (loadingEmployees) {
    return <p className="text-sm opacity-60">Cargando empleadas…</p>;
  }

  if (employees.length === 0) {
    return (
      <p className="text-sm text-red-500">
        No hay empleadas disponibles para este servicio
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {employees.map(emp => {
        const label =
          emp.name ??
          `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim();

        const isActive = activeEmployeeId === emp.id;

        return (
          <div key={emp.id} className="border rounded-lg p-3">
            {/* EMPLEADO */}
            <button
              type="button"
              onClick={() => loadSlots(emp.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition
                ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-black/10 hover:border-black/30'
                }`}
            >
              {label}
            </button>

            {/* HORARIOS */}
            {isActive && (
              <div className="mt-4">
                {loadingSlots ? (
                  <p className="text-sm opacity-60">
                    Cargando horarios…
                  </p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-red-500">
                    Sin horarios disponibles
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map(t => {
                      const iso = t.setZone('utc').toISO()!;
                      const isSelected = selectedISO === iso;

                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => {
                            setSelectedISO(iso);
                            onSelect(emp.id, iso);
                          }}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition
                            ${
                              isSelected
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-white hover:bg-emerald-50 border-black/10'
                            }`}
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
