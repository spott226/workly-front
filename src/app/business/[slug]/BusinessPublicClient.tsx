'use client';

import { useRef, useState } from 'react';
import { BusinessHeader } from '@/components/business/BusinessHeader';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { EmployeeSelector } from '@/components/booking/EmployeeSelector';
import { ClientForm } from '@/components/booking/ClientForm';
import { DateTimeSelector } from '@/components/booking/DateTimeSelector';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';

import { BUSINESS_THEMES } from '@/styles/businessThemes';
import { FONT_PRESETS } from '@/styles/fontPresets';

/* =========================
   TYPES
========================= */

type Props = { slug: string };

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
  const bookingRef = useRef<HTMLDivElement>(null);

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

  async function handleSubmit() {
    if (
      !draft.serviceId ||
      !draft.employeeId ||
      !draft.clientName.trim() ||
      !draft.phone.trim() ||
      !draft.dateTime
    )
      return;

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
      setError(e instanceof Error ? e.message : 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <BookingConfirmation onClose={() => location.reload()} />
      </main>
    );
  }

  const themeKey =
    (business?.theme_variant as keyof typeof BUSINESS_THEMES) || 'spa';
  const theme = BUSINESS_THEMES[themeKey] ?? BUSINESS_THEMES.spa;

  const fontKey =
    (business?.font_variant as keyof typeof FONT_PRESETS) || 'elegant';
  const fontClass =
    FONT_PRESETS[fontKey]?.className ?? FONT_PRESETS.elegant.className;

  return (
    <main className={`${theme.page} ${fontClass} min-h-screen`}>
      {/* ================= HERO ================= */}
      <section className={`${theme.hero} px-6 py-20 text-center`}>
        {/* Loader invisible */}
        <div className="sr-only">
          <BusinessHeader
            slug={slug}
            onBusinessLoaded={(biz: any) => {
              setBusiness(biz);
              setOpeningTime(biz.opening_time ?? null);
              setClosingTime(biz.closing_time ?? null);
            }}
          />
        </div>

        {business && (
          <div className="animate-[fadeUp_0.6s_ease-out]">
            <h1 className="text-4xl md:text-5xl font-semibold">
              {business.public_title}
            </h1>

            {business.public_description && (
              <p className="mt-4 text-lg opacity-80 max-w-2xl mx-auto">
                {business.public_description}
              </p>
            )}

            <button
              onClick={() =>
                bookingRef.current?.scrollIntoView({ behavior: 'smooth' })
              }
              className={`mt-10 px-10 py-4 rounded-full text-lg transition ${theme.button}`}
            >
              {business.cta_text || 'Reservar ahora'}
            </button>
          </div>
        )}
      </section>

      {/* ================= BLOQUE CONFIANZA ================= */}
      <section className="px-6 py-16">
        <div
          className={`max-w-3xl mx-auto text-center rounded-2xl ${theme.card}`}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Agenda tu cita en menos de 1 minuto
          </h2>

          <p className="text-base md:text-lg opacity-80 leading-relaxed">
            Sin llamadas. Sin mensajes interminables.  
            Confirmación inmediata y atención profesional desde el primer momento.
          </p>
        </div>
      </section>

      {/* ================= BOOKING ================= */}
      <section
        ref={bookingRef}
        className="max-w-xl mx-auto px-4 py-10 space-y-6"
      >
        <div className={theme.card}>
          <ServiceSelector
            slug={slug}
            publicMode
            onSelect={(serviceId) =>
              setDraft((d) => ({
                ...d,
                serviceId,
                employeeId: null,
                dateTime: null,
              }))
            }
          />
        </div>

        <div className={theme.card}>
          <DateTimeSelector
            minTime={openingTime ?? undefined}
            maxTime={closingTime ?? undefined}
            onSelect={(dateTime) =>
              setDraft((d) => ({
                ...d,
                dateTime,
                employeeId: null,
              }))
            }
          />
        </div>

        <div className={theme.card}>
          <EmployeeSelector
            serviceId={draft.serviceId}
            startISO={draft.dateTime}
            publicMode
            onSelect={(employeeId) =>
              setDraft((d) => ({ ...d, employeeId }))
            }
          />
        </div>

        <div className={theme.card}>
          <ClientForm
            clientName={draft.clientName}
            phone={draft.phone}
            onChange={(data) =>
              setDraft((d) => ({ ...d, ...data }))
            }
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}

        <button
          disabled={loading}
          onClick={handleSubmit}
          className={`w-full py-4 rounded-xl text-lg transition ${theme.button}`}
        >
          {loading ? 'Creando cita…' : 'Confirmar reserva'}
        </button>

        <p className="text-xs opacity-70 text-center">
          Al crear la cita aceptas los{' '}
          <Link href="/legal/terminos" className="underline">
            Términos
          </Link>{' '}
          y la{' '}
          <Link href="/legal/privacidad" className="underline">
            Política de Privacidad
          </Link>
        </p>
      </section>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
