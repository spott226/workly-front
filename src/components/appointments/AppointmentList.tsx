'use client';

import { useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { EmployeeSelector } from '@/components/booking/EmployeeSelector';
import { ClientForm } from '@/components/booking/ClientForm';
import { apiFetch } from '@/lib/apiFetch';

/* =========================
   TYPES
========================= */
type Draft = {
  date: DateTime | null;
  serviceId: string | null;
  employeeId: string | null;
  startISO: string | null;
  clientName: string;
  phone: string;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const zone = 'America/Mexico_City';

  const [draft, setDraft] = useState<Draft>({
    date: DateTime.now().setZone(zone),
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
      !!draft.date &&
      !!draft.serviceId &&
      !!draft.employeeId &&
      !!draft.startISO &&
      !!draft.clientName.trim() &&
      !!draft.phone.trim()
    );
  }

  async function handleSubmit() {
    if (!canSubmit()) return;

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
        {/* 0️⃣ FECHA */}
        <div className="border rounded p-4 space-y-2">
          <h3 className="font-semibold text-sm">Selecciona fecha</h3>
          <div className="flex gap-2">
            {[0, 1, 2].map(d => {
              const day = DateTime.now()
                .setZone(zone)
                .plus({ days: d });

              return (
                <button
                  key={d}
                  onClick={() =>
                    setDraft(prev => ({
                      ...prev,
                      date: day,
                      employeeId: null,
                      startISO: null,
                    }))
                  }
                  className={`px-3 py-2 rounded border ${
                    draft.date?.hasSame(day, 'day')
                      ? 'bg-black text-white'
                      : ''
                  }`}
                >
                  {day.toFormat('ccc dd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1️⃣ SERVICIO */}
        <ServiceSelector
          onSelect={(serviceId) =>
            setDraft(prev => ({
              ...prev,
              serviceId,
              employeeId: null,
              startISO: null,
            }))
          }
        />

        {/* 2️⃣ EMPLEADA (POR SERVICIO + FECHA) */}
        {draft.serviceId && draft.date && (
          <EmployeeSelector
            serviceId={draft.serviceId}
            onSelect={(employeeId) =>
              setDraft(prev => ({
                ...prev,
                employeeId,
                startISO: null,
              }))
            }
          />
        )}

        {/* 4️⃣ CLIENTE */}
        {draft.startISO && (
          <ClientForm
            clientName={draft.clientName}
            phone={draft.phone}
            onChange={(data) =>
              setDraft(prev => ({ ...prev, ...data }))
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
