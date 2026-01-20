'use client';

import { useEffect, useState } from 'react';

import ClientStats from '@/components/clients/ClientStats';
import ClientList from '@/components/clients/ClientList';
import ReviewConfig from '@/components/business/ReviewConfig';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiFetch } from '@/lib/apiFetch';

/* =========================
   TYPES
========================= */

type Business = {
  id: string;
  whatsapp_number?: string | null;
  google_review_url?: string | null;
  review_message?: string | null;
};

/* =========================
   PAGE
========================= */

export default function ClientsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [showReviewConfig, setShowReviewConfig] = useState(false);

  useEffect(() => {
    async function load() {
      const biz = await apiFetch<Business>('/businesses/me');
      setBusiness(biz);

      setShowReviewConfig(
        !biz.whatsapp_number ||
        !biz.google_review_url ||
        !biz.review_message
      );
    }

    load().catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      {/* CONFIGURACIÓN DE RESEÑAS (DEL NEGOCIO) */}
      {business && (
        <div className="mb-6 border rounded p-4 bg-white">
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

      {/* LO EXISTENTE (SIN CAMBIOS) */}
      <ClientStats />
      <ClientList />
    </DashboardLayout>
  );
}
