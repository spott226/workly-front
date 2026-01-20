'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';

function formatDate(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ClientCard({
  client,
  business,
}: {
  client: any;
  business: any;
}) {
  const router = useRouter();

  const clientPhone = client?.phone;
  const reviewUrl = business?.google_review_url;

  const canReview =
    !client.review_sent_at &&
    !!clientPhone &&
    !!reviewUrl;

  const [sent, setSent] = useState(false);

  const message = encodeURIComponent(
    `Hola ${client.name} 👋

${business.review_message || 'Gracias por tu visita ✨'}

${reviewUrl}`
  );

  const waLink = `https://wa.me/${clientPhone}?text=${message}`;

  async function sendReview(e: React.MouseEvent) {
    e.stopPropagation();
    window.open(waLink, '_blank');
    await apiFetch(`/clients/${client.id}/review-sent`, { method: 'PATCH' });
    setSent(true);
  }

  return (
    <div
      onClick={() => router.push(`/clients/${client.id}`)}
      className="w-full border rounded-lg bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer hover:bg-gray-50 transition"
    >
      {/* INFO */}
      <div className="min-w-0 space-y-1">
        <p className="font-semibold truncate">{client.name}</p>

        <p className="text-sm text-gray-500">
          Asistió: {client.attended_count} · No asistió: {client.no_show_count}
        </p>

        <p className="text-xs text-gray-400">
          Última visita: {formatDate(client.last_visit_at)}
        </p>

        <p className="text-xs text-gray-400">
          Servicio: {client.last_service_name || '—'}
        </p>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          disabled={!canReview || sent}
          onClick={sendReview}
          className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm transition ${
            canReview && !sent
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {client.review_sent_at || sent ? 'Reseña enviada' : 'Enviar reseña'}
        </button>
      </div>
    </div>
  );
}
