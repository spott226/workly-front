'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import ReviewConfig from '@/components/business/ReviewConfig';

/* =========================
   HELPERS
========================= */

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* =========================
   TYPES
========================= */

type ClientResponse = {
  client: any;
  appointments: any[];
};

type Business = {
  id: string;
  whatsapp_number?: string | null;
  google_review_url?: string | null;
  review_message?: string | null;
};

/* =========================
   PAGE
========================= */

export default function ClientHistoryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [showReviewConfig, setShowReviewConfig] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await apiFetch<ClientResponse>(`/clients/${id}`);
      setClient(res.client);
      setAppointments(res.appointments || []);

      const biz = await apiFetch<Business>('/businesses/me');
      setBusiness(biz);

      setShowReviewConfig(
        !biz.whatsapp_number ||
        !biz.google_review_url ||
        !biz.review_message
      );

      setLoading(false);
    }

    load().catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="p-6 text-gray-500">Cargando historial…</p>;
  }

  if (!client) {
    return <p className="p-6 text-red-500">Cliente no encontrado.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Asistencias: {client.attended_count} · No asistencias:{' '}
            {client.no_show_count}
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Volver
        </button>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard label="Teléfono" value={client.phone || '—'} />
        <InfoCard
          label="Primera visita"
          value={formatDate(client.first_visit_at)}
        />
        <InfoCard
          label="Última visita"
          value={formatDate(client.last_visit_at)}
        />
      </div>

      {/* CONFIGURACIÓN DE RESEÑAS */}
      {business && (
        <div className="border rounded-lg p-4 bg-white">
          {showReviewConfig ? (
            <ReviewConfig
              business={business}
              onSaved={() => setShowReviewConfig(false)}
            />
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Configuración de reseñas por WhatsApp
              </p>
              <button
                onClick={() => setShowReviewConfig(true)}
                className="text-sm underline"
              >
                Editar configuración
              </button>
            </div>
          )}
        </div>
      )}

      {/* HISTORIAL */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="px-4 py-3 border-b font-semibold bg-gray-50">
          Historial de citas
        </div>

        {appointments.length === 0 && (
          <p className="p-4 text-sm text-gray-500">
            Este cliente aún no tiene citas registradas.
          </p>
        )}

        <div className="divide-y">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="p-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium">{a.service_name}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(a.starts_at)} · {formatTime(a.starts_at)}
                </p>
                <p className="text-xs text-gray-400">
                  Atendió: {a.employee_name}
                </p>
              </div>

              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================
   COMPONENTES
========================= */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    ATTENDED: 'bg-green-100 text-green-700',
    NO_SHOW: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-200 text-gray-600',
  };

  const label: any = {
    ATTENDED: 'Asistió',
    NO_SHOW: 'No asistió',
    CANCELLED: 'Cancelada',
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}
