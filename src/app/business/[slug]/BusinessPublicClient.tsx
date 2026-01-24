'use client';

import { useRef, useState } from 'react';
import { DateTime } from 'luxon';
import Link from 'next/link';

import { BusinessHeader } from '@/components/business/BusinessHeader';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { EmployeeAvailability } from '@/components/employees/EmployeeAvailability';
import { ClientForm } from '@/components/booking/ClientForm';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { apiFetch } from '@/lib/apiFetch';

import { BUSINESS_THEMES } from '@/styles/businessThemes';
import { FONT_PRESETS } from '@/styles/fontPresets';

type Props = { slug: string };

type Draft = {
  serviceId: string | null;
  dateISO: string | null;       // YYYY-MM-DD
  employeeId: string | null;
  startISO: string | null;      // fecha + hora final
  clientName: string;
  phone: string;
};

type PublicBusiness = {
  public_title: string;
  public_description: string;
  cta_text: string;
  theme_variant: string;
  font_variant: string;
};

export default function BusinessPublicClient({ slug }: Props) {
  const bookingRef = useRef<HTMLDivElement>(null);
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

  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!draft.serviceId &&
    !!draft.dateISO &&
    !!draft.employeeId &&
    !!draft.startISO &&
    draft.clientName.trim().length > 0 &&
    draft.phone.trim().length > 0;

  async function handleSubmit() {
    if (loading || !canSubmit) return;

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
          startISO: draft.startISO,
          clientName: draft.clientName.trim(),
          phone: draft.phone.trim(),
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
      <section className={`${theme.hero} px-6 py-20 text-center`}>
        <div className="sr-only">
          <BusinessHeader
            slug={slug}
            onBusinessLoaded={(biz: any) => setBusiness(biz)}
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

      <section
        ref={bookingRef}
        className="max-w-xl mx-auto px-4 py-10 space-y-6"
      >
        <div className={theme.card}>
          <ServiceSelector
            slug={slug}
            publicMode
            onSelect={(serviceId) =>
              setDraft(d => ({
                ...d,
                serviceId,
                dateISO: null,
                employeeId: null,
                startISO: null,
              }))
            }
          />
        </div>

        {draft.serviceId && (
          <div className={theme.card}>
            <h3 className="font-semibold mb-2">Selecciona la fecha</h3>
            <input
              type="date"
              min={minDateISO ?? undefined}
              onChange={(e) =>
                setDraft(d => ({
                  ...d,
                  dateISO: e.target.value,
                  employeeId: null,
                  startISO: null,
                }))
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}

        {draft.startISO && (
          <div className={theme.card}>
            <ClientForm
              clientName={draft.clientName}
              phone={draft.phone}
              onChange={(data) =>
                setDraft(d => ({ ...d, ...data }))
              }
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm font-medium text-center">
            {error}
          </p>
        )}

        <button
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
          className={`w-full py-4 rounded-xl text-lg transition ${
            canSubmit ? theme.button : 'opacity-40 cursor-not-allowed'
          }`}
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
    </main>
  );
}
