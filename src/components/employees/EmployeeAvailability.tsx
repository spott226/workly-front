'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { apiFetch } from '@/lib/apiFetch';
import { EmployeeTimeSelector } from './EmployeeTimeSelector';

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
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [slots, setSlots] = useState<DateTime[]>([]);
  const [loading, setLoading] = useState(false);

  // cargar empleadas
  useEffect(() => {
    apiFetch<Employee[]>(
      '/employees',
      publicMode ? { public: true } : undefined
    ).then(setEmployees);
  }, [publicMode]);

  // generar slots base (30 min)
  const daySlots = useMemo(() => {
    const start = date.setZone(zone).startOf('day');
    const out: DateTime[] = [];
    for (let h = 0; h < 24; h++) {
      out.push(start.set({ hour: h, minute: 0 }));
      out.push(start.set({ hour: h, minute: 30 }));
    }
    return out;
  }, [date, zone]);

  // validar slots SOLO para la empleada seleccionada
  useEffect(() => {
    if (!employeeId) {
      setSlots([]);
      return;
    }

    async function load() {
      setLoading(true);
      const valid: DateTime[] = [];

      for (const t of daySlots) {
        try {
          const res = await apiFetch<Employee[]>(
            `/availability?serviceId=${serviceId}&startISO=${t
              .setZone('utc')
              .toISO()}`,
            publicMode ? { public: true } : undefined
          );

          if (Array.isArray(res) && res.find(e => e.id === employeeId)) {
            valid.push(t);
          }
        } catch {}
      }

      setSlots(valid);
      setLoading(false);
    }

    load();
  }, [employeeId, daySlots, serviceId, publicMode]);

  return (
    <div className="space-y-4">
      {/* elegir empleada */}
      <div className="space-y-2">
        <p className="font-semibold">Selecciona la empleada</p>
        <div className="flex flex-wrap gap-2">
          {employees.map(e => (
            <button
              key={e.id}
              onClick={() => setEmployeeId(e.id)}
              className={`px-3 py-1 rounded border ${
                employeeId === e.id ? 'bg-black text-white' : ''
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* horarios */}
      {employeeId && (
        <>
          {loading ? (
            <p className="text-sm opacity-60">Cargando horarios…</p>
          ) : slots.length ? (
            <EmployeeTimeSelector
              slots={slots}
              onSelect={iso => onSelect(employeeId, iso)}
            />
          ) : (
            <p className="text-sm text-red-500">
              Esta empleada no tiene horarios disponibles
            </p>
          )}
        </>
      )}
    </div>
  );
}
