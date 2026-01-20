'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Business = {
  name: string;
  opening_time: string | null;
  closing_time: string | null;
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
    <header className="w-full max-w-3xl mx-auto text-center space-y-2 mb-6 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold truncate">
        {business.name}
      </h1>

      <p className="text-sm sm:text-base text-gray-500">
        Agenda tu cita en línea
      </p>
    </header>
  );
}
