'use client';

import { useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { EmployeeAvailability } from '@/components/employees/EmployeeAvailability';
import { ClientForm } from '@/components/booking/ClientForm';
import { apiFetch } from '@/lib/apiFetch';

type AppointmentDraft = {
  serviceId: string | null;
  date: DateTime | null;
  employeeId: string | null;
  startISO: string | null;
  clientName: string;
  phone: string;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const zone = 'America/Mexico_City';

  // 👇 FECHA MÍNIMA (MAÑANA)
  const minDateISO =
    DateTime.now()
      .setZone(zone)
      .plus({ days: 1 })
      .toISODate();

  const [draft, setDraft] = useState<AppointmentDraft>({
    serviceId: null,
    date: null,
    employeeId: null,
    startISO: null,
    clientName: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function canSubmit() {
    return (
      !!draft.serviceId &&
      !!draft.date &&
      !!draft.employeeId &&
      !!draft.startISO &&
      !!draft.clientName.trim() &&
      !!draft.phone.trim()
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: draft.serviceId,
          employeeId: draft.employeeId,
          startISO: draft.startISO,
          clientName: draft.clientName,
          phone: draft.phone,
        }),
      });

      router.push('/appointments');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Error al crear la cita'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-4">Nueva cita</h1>

      <div className="max-w-xl space-y-6">
        {/* SERVICIO */}
        <ServiceSelector
          onSelect={(serviceId) =>
            setDraft({
              serviceId,
              date: null,
              employeeId: null,
              startISO: null,
              clientName: '',
              phone: '',
            })
          }
        />

        {/* FECHA — DESDE MAÑANA */}
        {draft.serviceId && (
          <div className="space-y-2">
            <h3 className="font-semibold">Selecciona la fecha</h3>
            <input
             key={draft.serviceId} // 🔥 FIX DEL BUG
              type="date"
              min={minDateISO as string}
              onChange={(e) =>
                setDraft(d => ({
                  ...d,
                  date: DateTime.fromISO(e.target.value, { zone }).startOf('day'),
                  employeeId: null,
                  startISO: null,
                }))
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}

        {/* EMPLEADAS + HORARIOS */}
        {draft.serviceId && draft.date && (
          <EmployeeAvailability
            serviceId={draft.serviceId}
            date={draft.date}
            onSelect={(employeeId, startISO) =>
              setDraft(d => ({
                ...d,
                employeeId,
                startISO,
              }))
            }
          />
        )}

        {/* CLIENTE */}
        {draft.startISO && (
          <ClientForm
            clientName={draft.clientName}
            phone={draft.phone}
            onChange={(data) =>
              setDraft(d => ({ ...d, ...data }))
            }
          />
        )}

        {error && (
          <p className="text-sm text-red-600 font-medium">
            {error}
          </p>
        )}

        <button
          disabled={!canSubmit() || loading}
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {loading ? 'Creando…' : 'Confirmar cita'}
        </button>
      </div>
    </DashboardLayout>
  );
}
