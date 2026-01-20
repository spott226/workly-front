'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export function CreateServiceModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    duration_minutes: '',
    price_min: '',
    price_max: '',
  });

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.duration_minutes ||
      !form.price_min ||
      !form.price_max
    ) {
      alert('Completa todos los campos');
      return;
    }

    setLoading(true);

    await apiFetch('/services', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name,
        duration_minutes: Number(form.duration_minutes),
        price_min: Number(form.price_min),
        price_max: Number(form.price_max),
        active: true,
      }),
    });

    setLoading(false);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-5 sm:p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-semibold">
          Crear servicio
        </h2>

        <div className="space-y-3">
          <input
            placeholder="Nombre"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Duración (min)"
            type="number"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({ ...form, duration_minutes: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Precio mínimo"
              type="number"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={form.price_min}
              onChange={(e) =>
                setForm({ ...form, price_min: e.target.value })
              }
            />

            <input
              placeholder="Precio máximo"
              type="number"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={form.price_max}
              onChange={(e) =>
                setForm({ ...form, price_max: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border rounded-md text-sm"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 rounded-md bg-black text-white text-sm disabled:opacity-50"
          >
            {loading ? 'Creando…' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}
