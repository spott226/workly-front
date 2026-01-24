'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { apiFetch } from '@/lib/apiFetch';

type Employee = {
  id: string;
  name: string;
};

type Props = {
  serviceId: string;
  date: DateTime; // día seleccionado (sin hora)
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [slots, setSlots] = useState<DateTime[]>([]);
  const [selectedISO, setSelectedISO] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* =========================
     CARGAR EMPLEADAS
  ========================= */
  useEffect(() => {
    async function loadEmployees() {
      setLoading(true);
      setSelectedEmployeeId(null);
      setSlots([]);
      setSelectedISO(null);

      const emps = await apiFetch<Employee[]>(
        '/employees',
        publicMode ? { public: true } : undefined
      );

      setEmployees(emps);
      setLoading(false);
    }

    loadEmployees();
  }, [serviceId, date, publicMode]);

  /* =========================
     CARGAR HORARIOS POR EMPLEADA
  ========================= */
  async function loadSlotsForEmployee(employeeId: string) {
    setSelectedEmployeeId(employeeId);
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
      } catch {
        // ignorar
      }
    }

    setSlots(valid);
    setLoadingSlots(false);
  }

  if (loading) {
    return <p className="text-sm opacity-60">Cargando empleadas…</p>;
  }

  return (
    <div className="space-y-4">
      {employees.map(emp => {
        const isActive = selectedEmployeeId === emp.id;

        return (
          <div key={emp.id} className="border rounded p-3">
            {/* EMPLEADA */}
            <button
              type="button"
              onClick={() => loadSlotsForEmployee(emp.id)}
              className={`w-full text-left font-medium mb-2 px-3 py-2 rounded transition
                ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
            >
              {emp.name}
            </button>

            {/* HORARIOS */}
            {isActive && (
              <div className="mt-3">
                {loadingSlots ? (
                  <p className="text-sm opacity-60">
                    Cargando horarios…
                  </p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-red-500">
                    Esta empleada no tiene horarios disponibles
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                                ? 'bg-black text-white'
                                : 'bg-white hover:bg-gray-100'
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
