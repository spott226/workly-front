'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

export default function ReviewConfig({
  business,
  onSaved,
}: {
  business: any;
  onSaved?: () => void;
}) {
  const [whatsapp, setWhatsapp] = useState(business.whatsapp_number || '');
  const [reviewUrl, setReviewUrl] = useState(business.google_review_url || '');
  const [message, setMessage] = useState(business.review_message || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);

    await apiFetch('/businesses/me', {
      method: 'PATCH',
      body: JSON.stringify({
        whatsapp_number: whatsapp,
        google_review_url: reviewUrl,
        review_message: message,
      }),
    });

    setSaving(false);
    onSaved?.();
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 bg-white p-4 sm:p-6 rounded-lg border">
      <h3 className="font-semibold text-sm sm:text-base">
        Reseñas por WhatsApp
      </h3>

      <input
        placeholder="WhatsApp del negocio"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      <input
        placeholder="URL de reseña Google"
        value={reviewUrl}
        onChange={(e) => setReviewUrl(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      <textarea
        placeholder="Mensaje que se enviará al cliente"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2 text-sm rounded-md bg-black text-white disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  );
}
