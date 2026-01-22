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
   🎨 THEME SYSTEM (REAL)
========================= */

const THEMES: Record<string, any> = {
  dental: {
    page: 'bg-sky-50 text-slate-900 font-sans',
    hero: 'bg-white border-b',
    card: 'bg-white rounded-xl shadow-sm border border-slate-200',
    button: 'bg-sky-600 text-white hover:bg-sky-700',
  },
  physio: {
    page: 'bg-indigo-50 text-slate-900 font-sans',
    hero: 'bg-gradient-to-b from-indigo-100 to-indigo-50',
    card: 'bg-white rounded-xl shadow',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  beauty: {
    page: 'bg-white text-neutral-900 font-sans',
    hero: 'bg-gradient-to-b from-pink-50 to-white',
    card: 'bg-white rounded-2xl shadow-md',
    button: 'bg-pink-600 text-white hover:bg-pink-700',
  },
  barber: {
    page: 'bg-neutral-950 text-white font-sans',
    hero: 'bg-neutral-900',
    card: 'bg-neutral-900 border border-neutral-800 rounded-lg',
    button: 'bg-white text-black hover:bg-neutral-200',
  },
  spa: {
    page: 'bg-stone-50 text-stone-800 font-serif',
    hero: 'bg-gradient-to-b from-stone-200 to-stone-50',
    card: 'bg-white rounded-2xl shadow-sm',
    button: 'bg-stone-700 text-white hover:bg-stone-800',
  },
  holistic: {
    page: 'bg-emerald-50 text-emerald-900 font-serif',
    hero: 'bg-gradient-to-b from-emerald-100 to-emerald-50',
    card: 'bg-white rounded-xl shadow-sm',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
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

  if (confirmed) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <BookingConfirmation onClose={() => location.reload()} />
      </main>
    );
  }

  const themeKey = business?.theme_variant || 'spa';
  const theme = THEMES[themeKey];

  return (
    <main className={`${theme.page} min-h-screen`}>
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
            <p className="mt-3 opacity-80">
              {business.public_description}
            </p>
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
              setDraft({ ...draft, serviceId, employeeId: null })
            }
          />
        </div>

        <div className={theme.card}>
          <DateTimeSelector
            minTime={openingTime ?? undefined}
            maxTime={closingTime ?? undefined}
            onSelect={(dateTime) =>
              setDraft({ ...draft, dateTime, employeeId: null })
            }
          />
        </div>

        <div className={theme.card}>
          <EmployeeSelector
            serviceId={draft.serviceId}
            startISO={draft.dateTime}
            publicMode
            onSelect={(employeeId) =>
              setDraft({ ...draft, employeeId })
            }
          />
        </div>

        <div className={theme.card}>
          <ClientForm
            clientName={draft.clientName}
            phone={draft.phone}
            onChange={(data) =>
              setDraft({ ...draft, ...data })
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
          onClick={() => {}}
          className={`w-full py-4 rounded-xl text-lg transition ${theme.button}`}
        >
          {business?.cta_text || 'Reservar cita'}
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
