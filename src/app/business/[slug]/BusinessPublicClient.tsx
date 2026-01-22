'use client';

import { useState } from 'react';
import { BusinessHeader } from '@/components/business/BusinessHeader';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { EmployeeSelector } from '@/components/booking/EmployeeSelector';
import { ClientForm } from '@/components/booking/ClientForm';
import { DateTimeSelector } from '@/components/booking/DateTimeSelector';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';

// 🎨 estilos centralizados
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
     SUBMIT
  ========================= */

  async function handleSubmit() {
    if (
      !draft.serviceId ||
      !draft.employeeId ||
      !draft.clientName.trim() ||
      !draft.phone.trim() ||
      !draft.dateTime
    ) {
      return;
    }

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
     THEMES / FONTS (SAFE)
  ========================= */

  const themeKey =
    (business?.theme_variant as keyof typeof BUSINESS_THEMES) || 'spa';

  const theme =
    BUSINESS_THEMES[themeKey] ?? BUSINESS_THEMES.spa;

  const fontKey =
    (business?.font_variant as keyof typeof FONT_PRESETS) || 'elegant';

  const fontClass =
    FONT_PRESETS[fontKey]?.className ??
    FONT_PRESETS.elegant.className;

  /* =========================
     RENDER
  ========================= */

  return (
    <main className={`${theme.page} ${fontClass} min-h-screen`}>
      {/* HERO */}
      <section className={`${theme.hero} px-6 py-12 text-center`}>
        <BusinessHeader
          slug={slug}
          onBusinessLoaded={(biz: any) => {
            setBusiness(biz);
            setOpeningTime(biz.opening_time);
            setClosingTime(biz.closing_time);
          }}
        />

        {business && (
          <>
            <h1 className="text-4xl font-semibold mt-6">
              {business.public_title}
            </h1>
            {business.public_description && (
              <p className="mt-3 opacity-80">
                {business.public_description}
              </p>
            )}
          </>
        )}
      </section>

      {/* BOOKING */}
      <section className="max-w-xl mx-auto px-4 py-10 space-y-6">
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
          <p className="text-red-500 text-sm font-medium">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          onClick={handleSubmit}
          className={`w-full py-4 rounded-xl text-lg transition ${theme.button}`}
        >
          {loading
            ? 'Creando cita…'
            : business?.cta_text || 'Reservar cita'}
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
    </main>
  );
}
