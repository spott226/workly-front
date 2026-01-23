'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { EmployeeSelector } from '@/components/booking/EmployeeSelector';
import { EmployeeAvailability } from '@/components/employees/EmployeeAvailability';
import { ClientForm } from '@/components/booking/ClientForm';
import { apiFetch } from '@/lib/apiFetch';

type AppointmentDraft = {
  serviceId: string | null;
  employeeId: string | null;
  startISO: string | null;
  clientName: string;
  phone: string;
};

export default function NewAppointmentPage() {
  const router = useRouter();

  const [draft, setDraft] = useState<AppointmentDraft>({
    serviceId: null,
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
        {/* 1️⃣ SERVICIO */}
        <ServiceSelector
          onSelect={(serviceId) =>
            setDraft({
              serviceId,
              employeeId: null,
              startISO: null,
              clientName: '',
              phone: '',
            })
          }
        />

        {/* 2️⃣ EMPLEADA */}
        <EmployeeSelector
          serviceId={draft.serviceId}
          onSelect={(employeeId) =>
            setDraft((d) => ({
              ...d,
              employeeId,
              startISO: null,
            }))
          }
        />

        {/* 3️⃣ HORARIOS (SLOTS REALES) */}
        {draft.serviceId && draft.employeeId && (
          <EmployeeAvailability
            serviceId={draft.serviceId}
            employeeId={draft.employeeId}
            onSelect={(startISO) =>
              setDraft((d) => ({ ...d, startISO }))
            }
          />
        )}

        {/* 4️⃣ CLIENTE */}
        {draft.startISO && (
          <ClientForm
            clientName={draft.clientName}
            phone={draft.phone}
            onChange={(data) =>
              setDraft((d) => ({ ...d, ...data }))
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
          {loading ? 'Creando…' : 'Crear cita'}
        </button>
      </div>
    </DashboardLayout>
  );
}
