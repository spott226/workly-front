'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Stats = {
  today: { attended: number; no_show: number };
  week: { attended: number; no_show: number };
  month: { attended: number; no_show: number };
};

export default function ClientStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const res = await apiFetch<{ data: Stats }>('/clients/stats');
      setStats(res.data);
    }

    load().catch(console.error);
  }, []);

  if (!stats) {
    return (
      <p className="text-sm text-gray-500 mb-6">
        Cargando métricas…
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Box title="Hoy" {...stats.today} />
      <Box title="Semana" {...stats.week} />
      <Box title="Mes" {...stats.month} />
    </div>
  );
}

function Box({
  title,
  attended,
  no_show,
}: {
  title: string;
  attended: number;
  no_show: number;
}) {
  return (
    <div className="w-full border rounded-lg bg-white p-4 space-y-1">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="font-semibold text-sm sm:text-base">
        Asistieron: {attended}
      </p>

      <p className="text-sm text-gray-500">
        No asistieron: {no_show}
      </p>
    </div>
  );
}
