'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

type ThemeVariant = 'spa' | 'barber' | 'clinic';
type FontVariant = 'elegant' | 'modern' | 'classic';

export default function PublicPageEditor() {
  const [publicTitle, setPublicTitle] = useState(
    'Relajación y bienestar para tu cuerpo'
  );
  const [publicDescription, setPublicDescription] = useState(
    'Somos un espacio especializado en brindar experiencias de bienestar.'
  );
  const [ctaText, setCtaText] = useState('Reservar cita');

  const [themeVariant, setThemeVariant] =
    useState<ThemeVariant>('spa');
  const [fontVariant, setFontVariant] =
    useState<FontVariant>('elegant');

  function handleSave() {
    // 🔒 FASE SEGURA: aún no guardamos en backend
    console.log({
      publicTitle,
      publicDescription,
      ctaText,
      themeVariant,
      fontVariant,
    });

    alert('Cambios guardados (simulado)');
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">
            Página pública del negocio
          </h1>
          <p className="text-sm text-gray-500">
            Personaliza cómo te ven tus clientes
          </p>
        </div>

        {/* TITULO */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Título principal
          </label>
          <input
            value={publicTitle}
            onChange={(e) => setPublicTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Ej. Relajación y bienestar para tu cuerpo"
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Descripción
          </label>
          <textarea
            value={publicDescription}
            onChange={(e) =>
              setPublicDescription(e.target.value)
            }
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="Describe tu negocio"
          />
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Texto del botón
          </label>
          <input
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Ej. Reservar cita"
          />
        </div>

        {/* ESTILO */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Estilo visual
          </label>
          <div className="flex gap-3">
            {(['spa', 'barber', 'clinic'] as ThemeVariant[]).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setThemeVariant(t)}
                  className={`px-4 py-2 rounded border text-sm ${
                    themeVariant === t
                      ? 'bg-black text-white'
                      : 'bg-white'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              )
            )}
          </div>
        </div>

        {/* TIPOGRAFÍA */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tipografía
          </label>
          <div className="flex gap-3">
            {(['elegant', 'modern', 'classic'] as FontVariant[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFontVariant(f)}
                  className={`px-4 py-2 rounded border text-sm ${
                    fontVariant === f
                      ? 'bg-black text-white'
                      : 'bg-white'
                  }`}
                >
                  {f}
                </button>
              )
            )}
          </div>
        </div>

        {/* PREVIEW */}
        <div className="border rounded p-6 bg-white">
          <p className="text-xs text-gray-400 mb-2">
            Vista previa
          </p>
          <h2 className="text-xl font-semibold">
            {publicTitle}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {publicDescription}
          </p>
          <button className="mt-4 px-4 py-2 bg-black text-white rounded">
            {ctaText}
          </button>
        </div>

        {/* GUARDAR */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded bg-black text-white"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
