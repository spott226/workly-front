'use client';

import { useRef, useState } from 'react';
import { DateTime } from 'luxon';
import Link from 'next/link';

import { BusinessHeader } from '@/components/business/BusinessHeader';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { ClientForm } from '@/components/booking/ClientForm';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { apiFetch } from '@/lib/apiFetch';

import { BUSINESS_THEMES } from '@/styles/businessThemes';
import { FONT_PRESETS } from '@/styles/fontPresets';

type Props = { slug: string };

type Draft = {
  serviceId: string | null;
  dateISO: string | null;
  startISO: string | null;
  employeeId: string | null;
  clientName: string;
  phone: string;
};

type Employee = {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
};

export default function BusinessPublicClient({ slug }: Props) {
  const bookingRef = useRef<HTMLDivElement>(null);
  const zone = 'America/Mexico_City';

  const minDateISO = DateTime.now().setZone(zone).plus({ days: 1 }).toISODate();

  const [draft, setDraft] = useState<Draft>({
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
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!draft.serviceId &&
    !!draft.dateISO &&
    !!draft.startISO &&
    !!draft.employeeId &&
    draft.clientName.trim() &&
    draft.phone.trim();

  /* =========================
     CARGAR DURACIÓN SERVICIO
  ========================= */
  async function loadServiceDuration(serviceId: string) {
    const res = await apiFetch<any>(`/services/${serviceId}`, { public: true });
    setServiceDuration(res.duration_minutes);
  }

  /* =========================
     EMPLEADOS DISPONIBLES
  ========================= */
  async function loadEmployees(startISO: string) {
    setLoadingEmployees(true);
    setEmployees([]);

    try {
      const res = await apiFetch<Employee[]>(
        `/employees/available?slug=${slug}&serviceId=${draft.serviceId}&startISO=${encodeURIComponent(startISO)}`,
        { public: true }
      );

      setEmployees(Array.isArray(res) ? res : []);
    } catch {
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  }

  /* =========================
     HORAS (DINÁMICAS POR DURACIÓN)
  ========================= */
  function TimePicker() {
    if (!draft.dateISO || !serviceDuration) return null;

    const start = DateTime.fromISO(draft.dateISO, { zone }).set({ hour: 9, minute: 0 });
    const end = DateTime.fromISO(draft.dateISO, { zone }).set({ hour: 19, minute: 0 });

    const times = [];
    let cursor = start;

    while (cursor.plus({ minutes: serviceDuration }) <= end) {
      times.push(cursor);
      cursor = cursor.plus({ minutes: serviceDuration });
    }

    return (
      <div className="grid grid-cols-3 gap-2">
        {times.map(t => {
          const iso = t.toUTC().toISO()!;
          return (
            <button
              key={iso}
              className="border rounded px-3 py-2"
              onClick={() => {
                setDraft(d => ({ ...d, startISO: iso, employeeId: null }));
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

  /* =========================
     SUBMIT
  ========================= */
  async function handleSubmit() {
    try {
      await apiFetch('/appointments/public', {
        method: 'POST',
        public: true,
        body: JSON.stringify({
          slug,
          serviceId: draft.serviceId,
          employeeId: draft.employeeId,
          startISO: draft.startISO,
          clientName: draft.clientName,
          phone: draft.phone,
        }),
      });

      setConfirmed(true);
    } catch (e) {
      setError('Error al crear la cita');
    }
  }

  if (confirmed) {
    return <BookingConfirmation onClose={() => location.reload()} />;
  }

  return (
    <main className="min-h-screen">
      <section ref={bookingRef} className="max-w-xl mx-auto p-6 space-y-6">

        <ServiceSelector
          slug={slug}
          publicMode
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

        {draft.serviceId && (
          <input
            type="date"
            min={minDateISO ?? undefined}
            onChange={e =>
              setDraft(d => ({
                ...d,
                dateISO: e.target.value,
                startISO: null,
                employeeId: null,
              }))
            }
            className="w-full border px-3 py-2 rounded"
          />
        )}

        {draft.dateISO && <TimePicker />}

        {draft.startISO && (
          loadingEmployees ? (
            <p>Buscando personal…</p>
          ) : employees.length === 0 ? (
            <p>No hay personal disponible a esa hora</p>
          ) : (
            employees.map(e => (
              <button
                key={e.id}
                className="w-full border rounded px-4 py-2"
                onClick={() =>
                  setDraft(d => ({ ...d, employeeId: e.id }))
                }
              >
                {e.name ?? `${e.first_name} ${e.last_name}`}
              </button>
            ))
          )
        )}

        {draft.employeeId && (
          <ClientForm
            clientName={draft.clientName}
            phone={draft.phone}
            onChange={data => setDraft(d => ({ ...d, ...data }))}
          />
        )}

        {error && <p className="text-red-500">{error}</p>}

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full bg-black text-white py-3 rounded"
        >
          Confirmar reserva
        </button>
      </section>
    </main>
  );
}
