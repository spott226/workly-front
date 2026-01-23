'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { EmployeeSelector } from '@/components/booking/EmployeeSelector';
import { DateTimeSelector } from '@/components/booking/DateTimeSelector';
import { ClientForm } from '@/components/booking/ClientForm';
import { apiFetch } from '@/lib/apiFetch';

type AppointmentDraft = {
  serviceId: string | null;
  serviceDuration: number | null;
  employeeId: string | null;
  clientName: string;
  phone: string;
  dateTime: string | null;
};

export default function NewAppointmentPage() {
  const router = useRouter();

  const [draft, setDraft] = useState<AppointmentDraft>({
    serviceId: null,
    serviceDuration: null,
    employeeId: null,
    clientName: '',
    phone: '',
    dateTime: null,
  });

  const [openingTime, setOpeningTime] = useState<string | null>(null);
  const [closingTime, setClosingTime] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     HORARIO DEL NEGOCIO
  ========================= */
  useEffect(() => {
    apiFetch<{ opening_time: string; closing_time: string }>(
      '/business/me'
    )
      .then((biz) => {
        setOpeningTime(biz.opening_time ?? null);
        setClosingTime(biz.closing_time ?? null);
      })
      .catch(() => {
        setOpeningTime(null);
        setClosingTime(null);
      });
  }, []);

  function canSubmit() {
    return (
      !!draft.serviceId &&
      !!draft.employeeId &&
      !!draft.clientName.trim() &&
      !!draft.phone.trim() &&
      !!draft.dateTime
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
          startISO: draft.dateTime,
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
          onSelect={(serviceId, durationMinutes) => {
            setDraft((d) => ({
              ...d,
              serviceId,
              serviceDuration: durationMinutes,
              employeeId: null,
              dateTime: null,
            }));
          }}
        />

        {/* 2️⃣ FECHA Y HORA (LIMITADO POR HORARIO DEL NEGOCIO) */}
        {draft.serviceId && (
          <DateTimeSelector
            minTime={openingTime ?? undefined}
            maxTime={closingTime ?? undefined}
            onSelect={(dateTime) => {
              setError(null);
              setDraft((d) => ({
                ...d,
                dateTime,
                employeeId: null,
              }));
            }}
          />
        )}

        {/* 3️⃣ EMPLEADA (FILTRADA POR SERVICIO + HORARIO) */}
        <EmployeeSelector
          serviceId={draft.serviceId}
          startISO={draft.dateTime}
          onSelect={(employeeId) =>
            setDraft((d) => ({ ...d, employeeId }))
          }
        />

        {/* 4️⃣ CLIENTE */}
        <ClientForm
          clientName={draft.clientName}
          phone={draft.phone}
          onChange={(data) =>
            setDraft((d) => ({ ...d, ...data }))
          }
        />

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
