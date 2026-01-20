'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type BusinessHours = {
  opening_time: string;
  closing_time: string;
};

export function BusinessHoursConfig() {
  const [hours, setHours] = useState<BusinessHours>({
    opening_time: '',
    closing_time: '',
  });

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<any>('/businesses/me')
      .then((data) => {
        setHours({
          opening_time: data.opening_time ?? '',
          closing_time: data.closing_time ?? '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await apiFetch('/businesses/me', {
      method: 'PATCH',
      body: JSON.stringify({
        opening_time: hours.opening_time || null,
        closing_time: hours.closing_time || null,
      }),
    });
    setSaving(false);
    setOpen(false);
  };

  if (loading) return null;

  return (
    <div className="w-full border rounded-lg bg-white p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Horario del negocio</p>
        <button
          onClick={() => setOpen(!open)}
          className="text-sm underline"
        >
          {open ? 'Cerrar' : 'Editar'}
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs text-gray-500">
              Hora de apertura
            </label>
            <input
              type="time"
              value={hours.opening_time}
              onChange={(e) =>
                setHours({ ...hours, opening_time: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">
              Hora de cierre
            </label>
            <input
              type="time"
              value={hours.closing_time}
              onChange={(e) =>
                setHours({ ...hours, closing_time: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 text-sm rounded-md bg-black text-white disabled:opacity-50"
            >
              Guardar horario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
