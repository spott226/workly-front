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

  return (
    <div className="w-full text-center space-y-3">
      {/* NOMBRE DEL NEGOCIO */}
      <h1 className="text-2xl sm:text-3xl font-bold">
        {business.name}
      </h1>

      {/* TÍTULO PÚBLICO */}
      {business.public_title && (
        <h2 className="text-lg sm:text-xl font-medium opacity-80">
          {business.public_title}
        </h2>
      )}

      {/* DESCRIPCIÓN */}
      {business.public_description && (
        <p className="text-sm sm:text-base leading-relaxed opacity-70">
          {business.public_description}
        </p>
      )}

      {/* MICRO COPY */}
      <p className="text-xs opacity-50">
        Agenda en menos de 1 minuto · Sin llamadas · Confirmación inmediata
      </p>
    </div>
  );
}
