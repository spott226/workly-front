'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Business = {
  name: string;
  opening_time: string | null;
  closing_time: string | null;
  public_title?: string | null;
  public_description?: string | null;
  theme_variant?: string | null;
  font_variant?: string | null;
};

type Props = {
  slug: string;
  onBusinessLoaded?: (biz: Business) => void;
};

/* ======================================================
   MAPEO DE TEMAS (escala, no circo)
====================================================== */
function themeClasses(theme?: string | null) {
  switch (theme) {
    case 'spa':
      return {
        wrapper: 'bg-white',
        title: 'text-neutral-900',
        subtitle: 'text-neutral-600',
        description: 'text-neutral-500',
      };
    case 'barber':
      return {
        wrapper: 'bg-black',
        title: 'text-white',
        subtitle: 'text-gray-300',
        description: 'text-gray-400',
      };
    case 'clinic':
      return {
        wrapper: 'bg-gray-50',
        title: 'text-gray-900',
        subtitle: 'text-gray-600',
        description: 'text-gray-500',
      };
    default:
      return {
        wrapper: 'bg-white',
        title: 'text-neutral-900',
        subtitle: 'text-neutral-600',
        description: 'text-neutral-500',
      };
  }
}

/* ======================================================
   MAPEO DE FUENTES
====================================================== */
function fontClass(font?: string | null) {
  switch (font) {
    case 'spa':
      return 'font-serif';
    case 'modern':
      return 'font-sans';
    case 'bold':
      return 'font-semibold';
    default:
      return 'font-sans';
  }
}

export function BusinessHeader({ slug, onBusinessLoaded }: Props) {
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await apiFetch<Business>(
        `/public/business/${slug}`,
        { public: true }
      );

      if (mounted) {
        setBusiness(data);
        onBusinessLoaded?.(data);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [slug, onBusinessLoaded]);

  if (!business) return null;

  const theme = themeClasses(business.theme_variant);
  const font = fontClass(business.font_variant);

  return (
    <header
      className={`w-full ${theme.wrapper} py-6 mb-6`}
    >
      <div className="max-w-3xl mx-auto text-center space-y-3 px-4">
        {/* NOMBRE DEL NEGOCIO */}
        <h1
          className={`text-2xl sm:text-3xl font-bold ${font} ${theme.title}`}
        >
          {business.name}
        </h1>

        {/* TÍTULO PÚBLICO */}
        {business.public_title && (
          <h2
            className={`text-lg sm:text-xl font-medium ${font} ${theme.subtitle}`}
          >
            {business.public_title}
          </h2>
        )}

        {/* DESCRIPCIÓN */}
        {business.public_description && (
          <p
            className={`text-sm sm:text-base leading-relaxed ${theme.description}`}
          >
            {business.public_description}
          </p>
        )}

        {/* MICRO COPY DE CONFIANZA */}
        <p className="text-xs text-gray-400 mt-2">
          Agenda en menos de 1 minuto · Sin llamadas · Confirmación inmediata
        </p>
      </div>
    </header>
  );
}
