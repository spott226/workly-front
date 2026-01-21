'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_min: number;
};

type Props = {
  onSelect: (serviceId: string) => void;

  // 🔑 SOLO para público
  slug?: string;
  publicMode?: boolean;
};

export function ServiceSelector({
  onSelect,
  slug,
  publicMode = false,
}: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setServices([]);
    setSelected(null);

    // 🌍 PÚBLICO: por slug
    if (publicMode && slug) {
      apiFetch<Service[]>(
        `/public/business/${slug}/services`,
        { public: true }
      )
        .then(setServices)
        .catch(console.error);
      return;
    }

    // 🏢 INTERNO: por sesión (business_id)
    apiFetch<Service[]>('/services')
      .then(setServices)
      .catch(console.error);
  }, [slug, publicMode]);

  return (
    <div className="w-full space-y-3">
      <h3 className="font-semibold text-sm md:text-base">
        Selecciona servicio
      </h3>

      <div className="space-y-3">
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSelected(s.id);
              onSelect(s.id);
            }}
            className={`w-full text-left border rounded-lg p-4 transition ${
              selected === s.id
                ? 'border-black bg-gray-50'
                : 'hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">
                {s.name}
              </span>
              <span className="text-sm font-semibold">
                ${s.price_min}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {s.duration_minutes} minutos
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
