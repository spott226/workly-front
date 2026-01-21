'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type BusinessPublicConfig = {
  public_title: string;
  public_description: string;
  cta_text: string;
  theme_variant: string;
  font_variant: string;
};

const THEMES = [
  { value: 'spa', label: 'Spa / Relajación' },
  { value: 'beauty', label: 'Salón de belleza' },
  { value: 'barber', label: 'Barbería' },
];

const FONTS = [
  { value: 'spa', label: 'Elegante' },
  { value: 'modern', label: 'Moderna' },
  { value: 'classic', label: 'Clásica' },
];

export function BusinessPublicEditor() {
  const [form, setForm] = useState<BusinessPublicConfig>({
    public_title: '',
    public_description: '',
    cta_text: '',
    theme_variant: 'spa',
    font_variant: 'spa',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     LOAD CURRENT CONFIG
  ========================= */
  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<BusinessPublicConfig>(
          '/businesses/me'
        );

        setForm({
          public_title: data.public_title ?? '',
          public_description: data.public_description ?? '',
          cta_text: data.cta_text ?? 'Reservar cita',
          theme_variant: data.theme_variant ?? 'spa',
          font_variant: data.font_variant ?? 'spa',
        });
      } catch {
        setError('No se pudo cargar la configuración');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =========================
     SAVE
  ========================= */
  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await apiFetch('/businesses/public-config', {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      setSaved(true);
    } catch {
      setError('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando configuración…</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* TÍTULO */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Título principal
        </label>
        <input
          type="text"
          value={form.public_title}
          onChange={e =>
            setForm(f => ({ ...f, public_title: e.target.value }))
          }
          className="w-full border rounded px-3 py-2"
          placeholder="Ej. Relajación y bienestar para tu cuerpo"
        />
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Descripción
        </label>
        <textarea
          value={form.public_description}
          onChange={e =>
            setForm(f => ({
              ...f,
              public_description: e.target.value,
            }))
          }
          className="w-full border rounded px-3 py-2 min-h-[100px]"
          placeholder="Describe tu negocio, servicios y experiencia"
        />
      </div>

      {/* CTA */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Texto del botón
        </label>
        <input
          type="text"
          value={form.cta_text}
          onChange={e =>
            setForm(f => ({ ...f, cta_text: e.target.value }))
          }
          className="w-full border rounded px-3 py-2"
          placeholder="Reservar cita"
        />
      </div>

      {/* TEMA */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Estilo visual
        </label>
        <select
          value={form.theme_variant}
          onChange={e =>
            setForm(f => ({ ...f, theme_variant: e.target.value }))
          }
          className="w-full border rounded px-3 py-2"
        >
          {THEMES.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* TIPOGRAFÍA */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Tipografía
        </label>
        <select
          value={form.font_variant}
          onChange={e =>
            setForm(f => ({ ...f, font_variant: e.target.value }))
          }
          className="w-full border rounded px-3 py-2"
        >
          {FONTS.map(f => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* FEEDBACK */}
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}

      {saved && (
        <p className="text-sm text-green-600 font-medium">
          Cambios guardados correctamente
        </p>
      )}

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 rounded bg-black text-white disabled:bg-gray-400"
      >
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  );
}
