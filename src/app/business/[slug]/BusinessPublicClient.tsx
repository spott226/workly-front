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
  date: DateTime | null;
  employeeId: string | null;
  startISO: string | null;
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

  const [draft, setDraft] = useState<Draft>({
    serviceId: null,
    date: null,
    employeeId: null,
    startISO: null,
    clientName: '',
    phone: '',
  });

  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (
      !draft.serviceId ||
      !draft.date ||
      !draft.employeeId ||
      !draft.startISO ||
      !draft.clientName.trim() ||
      !draft.phone.trim()
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
          startISO: draft.startISO,
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
    FONT_PRESETS[fontKey]?.className ??
    FONT_PRESETS.elegant.className;

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
              setDraft({
                serviceId,
                date: null,
                employeeId: null,
                startISO: null,
                clientName: '',
                phone: '',
              })
            }
          />
        </div>

        {draft.serviceId && (
          <div className={theme.card}>
            <h3 className="font-semibold mb-2">Selecciona el día</h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setDraft(d => ({
                    ...d,
                    date: DateTime.now().setZone(zone),
                    employeeId: null,
                    startISO: null,
                  }))
                }
                className="px-3 py-2 border rounded"
              >
                Hoy
              </button>
              <button
                onClick={() =>
                  setDraft(d => ({
                    ...d,
                    date: DateTime.now()
                      .setZone(zone)
                      .plus({ days: 1 }),
                    employeeId: null,
                    startISO: null,
                  }))
                }
                className="px-3 py-2 border rounded"
              >
                Mañana
              </button>
            </div>
          </div>
        )}

        {draft.serviceId && draft.date && (
          <div className={theme.card}>
            <EmployeeAvailability
              serviceId={draft.serviceId}
              date={draft.date}
              publicMode
              onSelect={(employeeId, startISO) =>
                setDraft(d => ({
                  ...d,
                  employeeId,
                  startISO,
                }))
              }
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
          <p className="text-red-500 text-sm font-medium">
            {error}
          </p>
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
