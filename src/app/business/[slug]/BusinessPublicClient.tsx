'use client';

import { useEffect, useState } from 'react';
import { BusinessHeader } from '@/components/business/BusinessHeader';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { EmployeeSelector } from '@/components/booking/EmployeeSelector';
import { ClientForm } from '@/components/booking/ClientForm';
import { DateTimeSelector } from '@/components/booking/DateTimeSelector';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';

/* =========================
   TYPES
========================= */

type Props = {
  slug: string;
};

type Draft = {
  serviceId: string | null;
  employeeId: string | null;
  clientName: string;
  phone: string;
  dateTime: string | null;
};

type PublicBusiness = {
  public_title: string;
  public_description: string;
  cta_text: string;
  theme_variant: string;
  font_variant: string;
  opening_time?: string;
  closing_time?: string;
};

/* =========================
   COMPONENT
========================= */

export default function BusinessPublicClient({ slug }: Props) {
  const [draft, setDraft] = useState<Draft>({
    serviceId: null,
    employeeId: null,
    clientName: '',
    phone: '',
    dateTime: null,
  });

  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [openingTime, setOpeningTime] = useState<string | null>(null);
  const [closingTime, setClosingTime] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ======================================================
     🔄 RESET TOTAL CUANDO CAMBIA EL NEGOCIO (slug)
     👉 evita datos cruzados entre negocios
  ====================================================== */
  useEffect(() => {
    setDraft({
      serviceId: null,
      employeeId: null,
      clientName: '',
      phone: '',
      dateTime: null,
    });

    setBusiness(null);
    setOpeningTime(null);
    setClosingTime(null);
    setConfirmed(false);
    setError(null);
  }, [slug]);

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
      await apiFetch('/appointments/public', {
        method: 'POST',
        public: true,
        body: JSON.stringify({
          slug,
          serviceId: draft.serviceId,
          employeeId: draft.employeeId,
          startISO: draft.dateTime,
          clientName: draft.clientName,
          phone: draft.phone,
        }),
      });

      setConfirmed(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Error al crear la cita'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     CONFIRMACIÓN
  ========================= */

  if (confirmed) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <BookingConfirmation onClose={() => location.reload()} />
      </main>
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <BusinessHeader
        slug={slug}
        onBusinessLoaded={(biz: any) => {
          setBusiness(biz);
          setOpeningTime(biz.opening_time);
          setClosingTime(biz.closing_time);
        }}
      />

      {business && (
        <section className="text-center mt-6 space-y-2">
          <h1 className="text-2xl font-semibold">
            {business.public_title}
          </h1>

          {business.public_description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {business.public_description}
            </p>
          )}
        </section>
      )}

      <div className="space-y-6 mt-6">
        <ServiceSelector
          slug={slug}
          publicMode
          onSelect={(serviceId) => {
            setDraft((d) => ({
              ...d,
              serviceId,
              employeeId: null,
              dateTime: null,
            }));
          }}
        />

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

        <EmployeeSelector
          serviceId={draft.serviceId}
          startISO={draft.dateTime}
          publicMode
          onSelect={(employeeId) =>
            setDraft((d) => ({ ...d, employeeId }))
          }
        />

        <ClientForm
          clientName={draft.clientName}
          phone={draft.phone}
          onChange={(data) =>
            setDraft((d) => ({ ...d, ...data }))
          }
        />

        {error && (
          <p className="text-red-600 text-sm font-medium">
            {error}
          </p>
        )}

        {/* BLINDAJE LEGAL */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Al crear la cita aceptas los{' '}
          <Link
            href="/legal/terminos"
            className="underline hover:text-black"
            target="_blank"
          >
            Términos y Condiciones
          </Link>{' '}
          y la{' '}
          <Link
            href="/legal/privacidad"
            className="underline hover:text-black"
            target="_blank"
          >
            Política de Privacidad
          </Link>{' '}
          de Workly.
        </p>

        <button
          disabled={!canSubmit() || loading}
          onClick={handleSubmit}
          className="w-full bg-black text-white py-3 rounded disabled:bg-gray-300"
        >
          {loading
            ? 'Creando cita…'
            : business?.cta_text || 'Crear cita'}
        </button>
      </div>
    </main>
  );
}
