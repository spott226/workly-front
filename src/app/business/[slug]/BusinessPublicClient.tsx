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

/* =========================
   TIPOS
========================= */
type Props = { slug: string };

type Draft = {
  serviceId: string | null;
  dateISO: string | null;     // YYYY-MM-DD
  startISO: string | null;    // UTC ISO
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
    startISO: null,
    employeeId: null,
    clientName: '',
    phone: '',
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!draft.serviceId &&
    !!draft.dateISO &&
    !!draft.startISO &&
    !!draft.employeeId &&
    draft.clientName.trim().length > 0 &&
    draft.phone.trim().length > 0;

  /* =========================
     CREAR CITA (PUBLIC)
  ========================= */
  async function handleSubmit() {
    if (!canSubmit || loading) return;

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

  /* =========================
     CARGAR EMPLEADOS DISPONIBLES
     (USA getAvailableEmployees TAL CUAL)
  ========================= */
  async function loadEmployees(startISO: string) {
    if (!draft.serviceId) return;

    setLoadingEmployees(true);
    setEmployees([]);

    try {
      const res = await apiFetch<Employee[]>(
        `/employees/available?serviceId=${draft.serviceId}&startISO=${encodeURIComponent(startISO)}`,
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
     TIME PICKER SIMPLE
     (FLUJO VIEJO)
  ========================= */
  function TimePicker() {
    if (!draft.dateISO) return null;

    const start = DateTime.fromISO(draft.dateISO, { zone }).set({
      hour: 9,
      minute: 0,
    });

    const end = DateTime.fromISO(draft.dateISO, { zone }).set({
      hour: 19,
      minute: 0,
    });

    const times: DateTime[] = [];
    let cursor = start;

    while (cursor <= end) {
      times.push(cursor);
      cursor = cursor.plus({ minutes: 30 });
    }

    return (
      <div className="grid grid-cols-3 gap-2">
        {times.map(t => {
          const iso = t.toUTC().toISO()!;
          return (
            <button
              key={iso}
              type="button"
              className="border rounded px-3 py-2 hover:bg-gray-50"
              onClick={() => {
                setDraft(d => ({
                  ...d,
                  startISO: iso,
                  employeeId: null,
                }));
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
          <div>
            <h1 className="text-4xl font-semibold">
              {business.public_title}
            </h1>

            {business.public_description && (
              <p className="mt-4 opacity-80">
                {business.public_description}
              </p>
            )}

            <button
              onClick={() =>
                bookingRef.current?.scrollIntoView({ behavior: 'smooth' })
              }
              className={`mt-8 px-8 py-4 rounded-full ${theme.button}`}
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
        {/* SERVICIO */}
        <div className={theme.card}>
          <ServiceSelector
            slug={slug}
            publicMode
            onSelect={serviceId =>
              setDraft({
                serviceId,
                dateISO: null,
                startISO: null,
                employeeId: null,
                clientName: '',
                phone: '',
              })
            }
          />
        </div>

        {/* FECHA */}
        {draft.serviceId && (
          <div className={theme.card}>
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
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}

        {/* HORA */}
        {draft.dateISO && (
          <div className={theme.card}>
            <TimePicker />
          </div>
        )}

        {/* EMPLEADOS */}
        {draft.startISO && (
          <div className={theme.card}>
            {loadingEmployees ? (
              <p>Cargando personal…</p>
            ) : employees.length === 0 ? (
              <p>No hay personal disponible a esa hora</p>
            ) : (
              employees.map(e => (
                <button
                  key={e.id}
                  className={`w-full border rounded px-4 py-2 mb-2 ${
                    draft.employeeId === e.id
                      ? 'bg-emerald-500/10 border-emerald-400'
                      : ''
                  }`}
                  onClick={() =>
                    setDraft(d => ({ ...d, employeeId: e.id }))
                  }
                >
                  {e.name ??
                    `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim()}
                </button>
              ))
            )}
          </div>
        )}

        {/* CLIENTE */}
        {draft.employeeId && (
          <div className={theme.card}>
            <ClientForm
              clientName={draft.clientName}
              phone={draft.phone}
              onChange={data =>
                setDraft(d => ({ ...d, ...data }))
              }
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        <button
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
          className={`w-full py-4 rounded-xl ${
            canSubmit ? theme.button : 'opacity-40'
          }`}
        >
          {loading ? 'Creando cita…' : 'Confirmar reserva'}
        </button>

        <p className="text-xs text-center opacity-70">
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
