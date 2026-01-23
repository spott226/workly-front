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
  onSelect: (serviceId: string, durationMinutes: number) => void;
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setServices([]);
    setSelected(null);
    setLoading(true);

    const load = async () => {
      try {
        const res = publicMode && slug
          ? await apiFetch<Service[]>(
              `/services/public?slug=${slug}`,
              { public: true }
            )
          : await apiFetch<Service[]>('/services');

        if (!cancelled) {
          setServices(Array.isArray(res) ? res : []);
        }
      } catch {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [slug, publicMode]);

  return (
    <div className="w-full space-y-3">
      <h3 className="font-semibold text-sm md:text-base">
        Selecciona servicio
      </h3>

      {loading && (
        <p className="text-sm opacity-60">
          Cargando servicios…
        </p>
      )}

      {!loading && services.length === 0 && (
        <p className="text-sm opacity-60">
          No hay servicios disponibles
        </p>
      )}

      <div className="space-y-3">
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSelected(s.id);
              onSelect(s.id, s.duration_minutes);
            }}
            className={`w-full text-left rounded-lg p-4 transition border
              ${
                selected === s.id
                  ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-500/10'
                  : 'border-black/10 hover:border-black/30'
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

            <p className="text-sm opacity-70 mt-1">
              {s.duration_minutes} minutos
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
