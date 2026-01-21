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
   🎨 THEME SYSTEM (SaaS-ready)
========================= */

const themeClasses: Record<string, string> = {
  spa: `
    bg-stone-50 text-stone-800
    [&_button]:bg-stone-800
    [&_button]:text-white
    [&_button]:hover:bg-stone-700
  `,
  beauty: `
    bg-white text-neutral-900
    [&_button]:bg-pink-600
    [&_button]:text-white
    [&_button]:hover:bg-pink-700
  `,
  barber: `
    bg-black text-white
    [&_button]:bg-white
    [&_button]:text-black
    [&_button]:hover:bg-neutral-200
  `,
};

const fontClasses: Record<string, string> = {
  spa: 'font-serif',
  modern: 'font-sans',
  classic: 'font-serif tracking-wide',
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

  /* =========================
     RESET CUANDO CAMBIA SLUG
  ========================= */
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

  const theme = business?.theme_variant || 'spa';
  const font = business?.font_variant || 'spa';

  return (
    <main
      className={`
        min-h-screen
        ${themeClasses[theme]}
        ${fontClasses[font]}
      `}
    >
      <div className="max-w-xl mx-auto px-4 py-6">
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
            <h1 className="text-3xl font-semibold">
              {business.public_title}
            </h1>

            {business.public_description && (
              <p className="opacity-80 text-sm leading-relaxed">
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
            <p className="text-red-500 text-sm font-medium">
              {error}
            </p>
          )}

          <p className="text-xs opacity-70 text-center leading-relaxed">
            Al crear la cita aceptas los{' '}
            <Link
              href="/legal/terminos"
              className="underline"
              target="_blank"
            >
              Términos y Condiciones
            </Link>{' '}
            y la{' '}
            <Link
              href="/legal/privacidad"
              className="underline"
              target="_blank"
            >
              Política de Privacidad
            </Link>{' '}
            de Workly.
          </p>

          <button
            disabled={!canSubmit() || loading}
            onClick={handleSubmit}
            className="w-full py-3 rounded transition disabled:opacity-40"
          >
            {loading
              ? 'Creando cita…'
              : business?.cta_text || 'Crear cita'}
          </button>
        </div>
      </div>
    </main>
  );
}
