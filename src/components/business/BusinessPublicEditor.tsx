'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import {
  BUSINESS_THEMES,
  type BusinessThemeKey,
} from '@/styles/businessThemes';
import {
  FONT_PRESETS,
  type FontKey,
} from '@/styles/fontPresets';

/* =========================
   TYPES
========================= */

type BusinessPublicConfig = {
  public_title: string;
  public_description: string;
  cta_text: string;
  theme_variant: BusinessThemeKey;
  font_variant: FontKey;
};

/* =========================
   ENTRIES TIPADAS
========================= */

const themeEntries = Object.entries(BUSINESS_THEMES) as [
  BusinessThemeKey,
  (typeof BUSINESS_THEMES)[BusinessThemeKey]
][];

const fontEntries = Object.entries(FONT_PRESETS) as [
  FontKey,
  (typeof FONT_PRESETS)[FontKey]
][];

/* =========================
   COMPONENT
========================= */

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

  /* =========================
     LOAD
  ========================= */

  useEffect(() => {
    apiFetch<BusinessPublicConfig>('/businesses/me')
      .then((data) => {
        setForm({
          public_title: data.public_title ?? '',
          public_description: data.public_description ?? '',
          cta_text: data.cta_text ?? 'Reservar cita',
          theme_variant: data.theme_variant ?? 'spa',
          font_variant: data.font_variant ?? 'elegant',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     SAVE
  ========================= */

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

  if (loading) return <p className="text-sm">Cargando…</p>;

  const activeTheme = BUSINESS_THEMES[form.theme_variant];
  const activeFont = FONT_PRESETS[form.font_variant];

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6 max-w-xl">
      {/* TITLE */}
      <input
        className="w-full border px-3 py-2 rounded"
        placeholder="Título público"
        value={form.public_title}
        maxLength={50}
        onChange={(e) =>
          setForm((f) => ({ ...f, public_title: e.target.value }))
        }
      />

      {/* DESCRIPTION */}
      <textarea
        className="w-full border px-3 py-2 rounded"
        placeholder="Descripción larga"
        value={form.public_description}
        onChange={(e) =>
          setForm((f) => ({ ...f, public_description: e.target.value }))
        }
      />

      {/* CTA */}
      <input
        className="w-full border px-3 py-2 rounded"
        placeholder="Texto del botón"
        value={form.cta_text}
        maxLength={18}
        onChange={(e) =>
          setForm((f) => ({ ...f, cta_text: e.target.value }))
        }
      />

      {/* THEME SELECT */}
      <select
        className="w-full border px-3 py-2 rounded"
        value={form.theme_variant}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            theme_variant: e.target.value as BusinessThemeKey,
          }))
        }
      >
        {themeEntries.map(([key, theme]) => (
          <option key={key} value={key}>
            {theme.label}
          </option>
        ))}
      </select>

      {/* THEME PREVIEW */}
      <div className="rounded-xl overflow-hidden border border-black/10">
        <div
          className={`p-4 text-sm ${activeTheme.page} ${activeFont.className}`}
        >
          <div
            className={`mb-3 p-3 rounded-lg ${activeTheme.hero}`}
          >
            <p className="font-semibold">Vista previa</p>
            <p className="text-xs opacity-80">
              Así se verá tu página pública
            </p>
          </div>

          <div className={`${activeTheme.card} mb-3`}>
            <p className="text-sm font-medium">
              Card de contenido
            </p>
            <p className="text-xs opacity-70">
              Servicios, empleados, formularios
            </p>
          </div>

          <button
            type="button"
            className={`w-full py-2 rounded-lg text-sm ${activeTheme.button}`}
          >
            Botón principal
          </button>
        </div>
      </div>

      {/* FONT SELECT */}
      <select
        className="w-full border px-3 py-2 rounded"
        value={form.font_variant}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            font_variant: e.target.value as FontKey,
          }))
        }
      >
        {fontEntries.map(([key, font]) => (
          <option key={key} value={key}>
            {font.label}
          </option>
        ))}
      </select>

      {/* SAVE */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-60"
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>

      {saved && (
        <p className="text-green-600 text-sm font-medium">
          Guardado correctamente
        </p>
      )}
    </div>
  );
}
