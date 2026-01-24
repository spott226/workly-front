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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [slots, setSlots] = useState<DateTime[]>([]);
  const [selectedISO, setSelectedISO] = useState<string | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* =========================
     CARGAR EMPLEADAS (SOLO POR SERVICIO)
  ========================= */
  useEffect(() => {
    if (publicMode && !slug) return;

    let cancelled = false;

    async function loadEmployees() {
      setLoadingEmployees(true);
      setEmployees([]);
      setSelectedEmployeeId(null);
      setSlots([]);
      setSelectedISO(null);

      try {
        const url = publicMode
          ? `/employees/public?slug=${slug}&serviceId=${serviceId}`
          : `/employees?serviceId=${serviceId}`;

        const res = await apiFetch<Employee[]>(
          url,
          publicMode ? { public: true } : undefined
        );

        if (!cancelled) {
          setEmployees(Array.isArray(res) ? res : []);
        }
      } catch {
        if (!cancelled) setEmployees([]);
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    }

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [serviceId, publicMode, slug]); // 👈 CLAVE: NO date

  /* =========================
     CARGAR HORARIOS (DEPENDE DEL DÍA)
  ========================= */
  async function loadSlotsForEmployee(employeeId: string) {
    setSelectedEmployeeId(employeeId);
    setSelectedISO(null);
    setSlots([]);
    setLoadingSlots(true);

    try {
      const url = publicMode
        ? `/appointments/availability/day?serviceId=${serviceId}&employeeId=${employeeId}&date=${date.toISODate()}&slug=${slug}`
        : `/appointments/availability/day?serviceId=${serviceId}&employeeId=${employeeId}&date=${date.toISODate()}`;

      const res = await apiFetch<{ slots: string[] }>(
        url,
        publicMode ? { public: true } : undefined
      );

      setSlots(
        res.slots.map(iso =>
          DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone)
        )
      );
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  /* =========================
     UI
  ========================= */
  if (loadingEmployees) {
    return <p className="text-sm opacity-60">Cargando personal…</p>;
  }

  if (employees.length === 0) {
    return (
      <p className="text-sm text-red-500">
        No hay personal asignado a este servicio
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {employees.map(emp => {
        const isActive = emp.id === selectedEmployeeId;
        const label =
          emp.name ??
          `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim();

        return (
          <div key={emp.id} className="border rounded-lg p-3">
            <button
              type="button"
              onClick={() => loadSlotsForEmployee(emp.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition
                ${
                  isActive
                    ? 'bg-emerald-500/15 border border-emerald-400'
                    : 'bg-white hover:bg-gray-50 border'
                }`}
            >
              {label}
            </button>

            {isActive && (
              <div className="mt-4">
                {loadingSlots ? (
                  <p className="text-sm opacity-60">Cargando horarios…</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-red-500">
                    Esta empleada no tiene horarios disponibles este día
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map(t => {
                      const iso = t.toISO()!;
                      const selected = iso === selectedISO;

                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => {
                            setSelectedISO(iso);
                            onSelect(emp.id, iso);
                          }}
                          className={`px-3 py-2 rounded-md text-sm border transition
                            ${
                              selected
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-white hover:bg-emerald-50'
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
