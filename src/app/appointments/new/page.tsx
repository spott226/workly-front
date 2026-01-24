'use client';

import { useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { ClientForm } from '@/components/booking/ClientForm';
import { apiFetch } from '@/lib/apiFetch';

type Employee = {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
};

type AppointmentDraft = {
  serviceId: string | null;
  dateISO: string | null;
  startISO: string | null;
  employeeId: string | null;
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
    startISO: null,
    employeeId: null,
    clientName: '',
    phone: '',
  });

  const [serviceDuration, setServiceDuration] = useState<number>(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!draft.serviceId &&
    !!draft.dateISO &&
    !!draft.startISO &&
    !!draft.employeeId &&
    draft.clientName.trim() &&
    draft.phone.trim();

  /* =========================
     DURACIÓN DEL SERVICIO
  ========================= */
  async function loadServiceDuration(serviceId: string) {
    const res = await apiFetch<any>(`/services/${serviceId}`);
    setServiceDuration(res.duration_minutes);
  }

  /* =========================
     EMPLEADOS DISPONIBLES
     (BACKEND DECIDE)
  ========================= */
  async function loadEmployees(startISO: string) {
    if (!draft.serviceId) return;

    setLoadingEmployees(true);
    setEmployees([]);

    try {
      const res = await apiFetch<Employee[]>(
        `/employees/available?serviceId=${draft.serviceId}&startISO=${encodeURIComponent(startISO)}`
      );

      setEmployees(Array.isArray(res) ? res : []);
    } catch {
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  }

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

  /* =========================
     HORAS (DINÁMICAS, COMO ANTES)
  ========================= */
  function TimePicker() {
    if (!draft.dateISO || !serviceDuration) return null;

    const start = DateTime.fromISO(draft.dateISO, { zone }).set({
      hour: 9,
      minute: 0,
    });

    const end = DateTime.fromISO(draft.dateISO, { zone }).set({
      hour: 19,
      minute: 0,
    });

    const times: DateTime[] = [];
    let cursor = start;

    while (cursor.plus({ minutes: serviceDuration }) <= end) {
      times.push(cursor);
      cursor = cursor.plus({ minutes: serviceDuration });
    }

    return (
      <div className="grid grid-cols-4 gap-2">
        {times.map(t => {
          const iso = t.toUTC().toISO()!;
          return (
            <button
              key={iso}
              type="button"
              className="border rounded px-3 py-2 hover:bg-gray-50"
              onClick={() => {
                setDraft(d => ({
                  ...d,
                  startISO: iso,
                  employeeId: null,
                }));
                loadEmployees(iso);
              }}
            >
              {t.toFormat('HH:mm')}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-4">Nueva cita</h1>

      <div className="max-w-xl space-y-6">
        {/* SERVICIO */}
        <ServiceSelector
          onSelect={async (serviceId) => {
            setDraft({
              serviceId,
              dateISO: null,
              startISO: null,
              employeeId: null,
              clientName: '',
              phone: '',
            });
            await loadServiceDuration(serviceId);
          }}
        />

        {/* FECHA */}
        {draft.serviceId && (
          <div>
            <h3 className="font-semibold mb-2">Selecciona la fecha</h3>
            <input
              type="date"
              min={minDateISO ?? undefined}
              onChange={(e) =>
                setDraft(d => ({
                  ...d,
                  dateISO: e.target.value,
                  startISO: null,
                  employeeId: null,
                }))
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}

        {/* HORA */}
        {draft.dateISO && (
          <div>
            <h3 className="font-semibold mb-2">Selecciona la hora</h3>
            <TimePicker />
          </div>
        )}

        {/* EMPLEADOS */}
        {draft.startISO && (
          <div>
            <h3 className="font-semibold mb-2">Empleado disponible</h3>

            {loadingEmployees ? (
              <p className="text-sm opacity-60">Buscando disponibilidad…</p>
            ) : employees.length === 0 ? (
              <p className="text-sm text-red-500">
                No hay empleados disponibles a esa hora
              </p>
            ) : (
              employees.map(e => (
                <button
                  key={e.id}
                  type="button"
                  className={`w-full border rounded px-4 py-2 text-left mb-2
                    ${
                      draft.employeeId === e.id
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'hover:bg-gray-50'
                    }`}
                  onClick={() =>
                    setDraft(d => ({ ...d, employeeId: e.id }))
                  }
                >
                  {e.name ??
                    `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim()}
                </button>
              ))
            )}
          </div>
        )}

        {/* CLIENTE */}
        {draft.employeeId && (
          <ClientForm
            clientName={draft.clientName}
            phone={draft.phone}
            onChange={(data) =>
              setDraft(d => ({ ...d, ...data }))
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
