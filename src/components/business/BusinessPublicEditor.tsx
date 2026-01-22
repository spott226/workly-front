'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { BUSINESS_THEMES } from '@/styles/businessThemes';
import { FONT_PRESETS } from '@/styles/fontPresets';

type BusinessPublicConfig = {
  public_title: string;
  public_description: string;
  cta_text: string;
  theme_variant: keyof typeof BUSINESS_THEMES;
  font_variant: keyof typeof FONT_PRESETS;
};

export function BusinessPublicEditor() {
  const [form, setForm] = useState<BusinessPublicConfig>({
    public_title: '',
    public_description: '',
    cta_text: '',
    theme_variant: 'spa',
    font_variant: 'elegant',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<BusinessPublicConfig>('/businesses/me')
      .then(data =>
        setForm({
          public_title: data.public_title ?? '',
          public_description: data.public_description ?? '',
          cta_text: data.cta_text ?? 'Reservar cita',
          theme_variant: data.theme_variant ?? 'spa',
          font_variant: data.font_variant ?? 'elegant',
        })
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await apiFetch('/businesses/public-config', {
      method: 'PUT',
      body: JSON.stringify(form),
    });
    setSaved(true);
    setSaving(false);
  }

  if (loading) return <p>Cargando…</p>;

  return (
    <div className="space-y-6 max-w-xl">
      <input
        className="w-full border px-3 py-2 rounded"
        placeholder="Título público"
        value={form.public_title}
        onChange={e => setForm(f => ({ ...f, public_title: e.target.value }))}
      />

      <textarea
        className="w-full border px-3 py-2 rounded"
        placeholder="Descripción"
        value={form.public_description}
        onChange={e => setForm(f => ({ ...f, public_description: e.target.value }))}
      />

      <input
        className="w-full border px-3 py-2 rounded"
        placeholder="Texto botón"
        value={form.cta_text}
        onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))}
      />

      <select
        className="w-full border px-3 py-2 rounded"
        value={form.theme_variant}
        onChange={e =>
          setForm(f => ({ ...f, theme_variant: e.target.value as any }))
        }
      >
        {Object.entries(BUSINESS_THEMES).map(([key, t]) => (
          <option key={key} value={key}>{t.label}</option>
        ))}
      </select>

      <select
        className="w-full border px-3 py-2 rounded"
        value={form.font_variant}
        onChange={e =>
          setForm(f => ({ ...f, font_variant: e.target.value as any }))
        }
      >
        {Object.entries(FONT_PRESETS).map(([key, f]) => (
          <option key={key} value={key}>{f.label}</option>
        ))}
      </select>

      <button
        onClick={handleSave}
        className="bg-black text-white px-6 py-2 rounded"
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>

      {saved && <p className="text-green-600">Guardado</p>}
    </div>
  );
}
