'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { ClientForm } from '@/components/booking/ClientForm';
import { apiFetch } from '@/lib/apiFetch';

type Employee = {
  id: string;
  name: string;
};

type AppointmentDraft = {
  serviceId: string | null;
  dateISO: string | null;
  employeeId: string | null;
  startISO: string | null;
  clientName: string;
  phone: string;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const zone = 'America/Mexico_City';

  const minDateISO = DateTime.now()
    .setZone(zone)
    .plus({ days: 1 })
    .toISODate();

  const [draft, setDraft] = useState<AppointmentDraft>({
    serviceId: null,
    dateISO: null,
    employeeId: null,
    startISO: null,
    clientName: '',
    phone: '',
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!draft.serviceId &&
    !!draft.dateISO &&
    !!draft.employeeId &&
    !!draft.startISO &&
    draft.clientName.trim() &&
    draft.phone.trim();

  /* =========================
     EMPLEADOS DISPONIBLES
  ========================= */
  useEffect(() => {
    if (!draft.serviceId || !draft.dateISO) return;

    setLoadingEmployees(true);
    setEmployees([]);
    setDraft(d => ({
      ...d,
      employeeId: null,
      startISO: null,
    }));

    apiFetch<Employee[]>(
      `/employees/available?serviceId=${draft.serviceId}&startISO=${DateTime
        .fromISO(draft.dateISO, { zone })
        .set({ hour: 12 })
        .toUTC()
        .toISO()}`
    )
      .then(res => {
        setEmployees(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        setEmployees([]);
      })
      .finally(() => {
        setLoadingEmployees(false);
      });
  }, [draft.serviceId, draft.dateISO]);

  /* =========================
     SLOTS POR EMPLEADO Y DÍA
  ========================= */
  useEffect(() => {
    if (!draft.serviceId || !draft.employeeId || !draft.dateISO) return;

    setLoadingSlots(true);
    setSlots([]);
    setDraft(d => ({ ...d, startISO: null }));

    apiFetch<string[]>(
      `/employees/${draft.employeeId}/availability?serviceId=${draft.serviceId}&dateISO=${draft.dateISO}`
    )
      .then(res => {
        setSlots(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        setSlots([]);
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [draft.serviceId, draft.employeeId, draft.dateISO]);

  /* =========================
     CREAR CITA
  ========================= */
  async function handleSubmit() {
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);

    try {
      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: draft.serviceId,
          employeeId: draft.employeeId,
          startISO: draft.startISO,
          clientName: draft.clientName.trim(),
          phone: draft.phone.trim(),
        }),
      });

      router.push('/appointments');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-4">Nueva cita</h1>

      <div className="max-w-xl space-y-6">
        <ServiceSelector
          onSelect={(serviceId) =>
            setDraft({
              serviceId,
              dateISO: null,
              employeeId: null,
              startISO: null,
              clientName: '',
              phone: '',
            })
          }
        />

        {draft.serviceId && (
          <div>
            <h3 className="font-semibold mb-2">Fecha</h3>
            <input
              type="date"
              min={minDateISO ?? undefined}
              value={draft.dateISO ?? ''}
              onChange={(e) =>
                setDraft(d => ({
                  ...d,
                  dateISO: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}

        {draft.dateISO && (
          <div>
            <h3 className="font-semibold mb-2">Empleado</h3>

            {loadingEmployees ? (
              <p className="text-sm opacity-60">Cargando empleados…</p>
            ) : employees.length === 0 ? (
              <p className="text-sm text-red-500">
                No hay empleados disponibles ese día
              </p>
            ) : (
              employees.map(e => (
                <button
                  key={e.id}
                  type="button"
                  className={`w-full border rounded px-4 py-2 text-left mb-2 ${
                    draft.employeeId === e.id
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() =>
                    setDraft(d => ({
                      ...d,
                      employeeId: e.id,
                    }))
                  }
                >
                  {e.name}
                </button>
              ))
            )}
          </div>
        )}

        {draft.employeeId && (
          <div>
            <h3 className="font-semibold mb-2">Hora</h3>

            {loadingSlots ? (
              <p className="text-sm opacity-60">Cargando horarios…</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-red-500">
                No hay horarios disponibles
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map(iso => {
                  const t = DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone);
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={`border rounded px-3 py-2 ${
                        draft.startISO === iso
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() =>
                        setDraft(d => ({ ...d, startISO: iso }))
                      }
                    >
                      {t.toFormat('HH:mm')}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {draft.startISO && (
          <ClientForm
            clientName={draft.clientName}
            phone={draft.phone}
            onChange={(data) =>
              setDraft(d => ({
                ...d,
                ...data,
              }))
            }
          />
        )}

        {error && (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        )}

        <button
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {loading ? 'Creando…' : 'Confirmar cita'}
        </button>
      </div>
    </DashboardLayout>
  );
}
