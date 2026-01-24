'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

import { BusinessHeader } from '@/components/business/BusinessHeader';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { ClientForm } from '@/components/booking/ClientForm';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { apiFetch } from '@/lib/apiFetch';

type Props = { slug: string };

type Employee = {
  id: string;
  name: string;
};

type Draft = {
  serviceId: string | null;
  dateISO: string | null;
  employeeId: string | null;
  startISO: string | null;
  clientName: string;
  phone: string;
};

export default function BusinessPublicClient({ slug }: Props) {
  const zone = 'America/Mexico_City';

  const minDateISO = DateTime.now()
    .setZone(zone)
    .plus({ days: 1 })
    .toISODate();

  const [draft, setDraft] = useState<Draft>({
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
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!draft.serviceId &&
    !!draft.dateISO &&
    !!draft.employeeId &&
    !!draft.startISO &&
    draft.clientName.trim() &&
    draft.phone.trim();

  /* =========================
     EMPLEADOS DISPONIBLES (DÍA)
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
      `/employees/available?slug=${slug}&serviceId=${draft.serviceId}&startISO=${DateTime
        .fromISO(draft.dateISO, { zone })
        .set({ hour: 12 })
        .toUTC()
        .toISO()}`,
      { public: true }
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
  }, [draft.serviceId, draft.dateISO, slug]);

  /* =========================
     SLOTS POR EMPLEADO
  ========================= */
  useEffect(() => {
    if (!draft.serviceId || !draft.employeeId || !draft.dateISO) return;

    setLoadingSlots(true);
    setSlots([]);
    setDraft(d => ({ ...d, startISO: null }));

    apiFetch<string[]>(
      `/employees/${draft.employeeId}/availability?serviceId=${draft.serviceId}&dateISO=${draft.dateISO}`,
      { public: true }
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
     SUBMIT
  ========================= */
  async function handleSubmit() {
    setError(null);

    try {
      await apiFetch('/appointments/public', {
        method: 'POST',
        public: true,
        body: JSON.stringify({
          slug,
          serviceId: draft.serviceId,
          employeeId: draft.employeeId,
          startISO: draft.startISO,
          clientName: draft.clientName.trim(),
          phone: draft.phone.trim(),
        }),
      });

      setConfirmed(true);
    } catch {
      setError('Error al crear la cita');
    }
  }

  if (confirmed) {
    return <BookingConfirmation onClose={() => location.reload()} />;
  }

  return (
    <main className="min-h-screen">
      <BusinessHeader slug={slug} />

      <section className="max-w-xl mx-auto p-6 space-y-6">
        <ServiceSelector
          slug={slug}
          publicMode
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
            className="w-full border px-3 py-2 rounded"
          />
        )}

        {draft.dateISO && (
          <div>
            {loadingEmployees ? (
              <p>Buscando personal…</p>
            ) : employees.length === 0 ? (
              <p>No hay personal disponible ese día</p>
            ) : (
              employees.map(e => (
                <button
                  key={e.id}
                  className={`w-full border rounded px-4 py-2 mb-2 ${
                    draft.employeeId === e.id
                      ? 'border-black bg-gray-100'
                      : ''
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
            {loadingSlots ? (
              <p>Cargando horarios…</p>
            ) : slots.length === 0 ? (
              <p>No hay horarios disponibles</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map(iso => {
                  const t = DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone);
                  return (
                    <button
                      key={iso}
                      className={`border rounded px-3 py-2 ${
                        draft.startISO === iso
                          ? 'bg-black text-white'
                          : ''
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
            onChange={data =>
              setDraft(d => ({
                ...d,
                ...data,
              }))
            }
          />
        )}

        {error && <p className="text-red-500">{error}</p>}

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full bg-black text-white py-3 rounded disabled:bg-gray-300"
        >
          Confirmar reserva
        </button>
      </section>
    </main>
  );
}
