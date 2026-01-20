'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { ServiceCard } from './ServiceCard';
import { CreateServiceModal } from './CreateServiceModal';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_min: number;
  price_max: number;
  is_active: boolean;
};

export function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);

  const loadServices = () => {
    apiFetch<Service[]>('/services').then(setServices);
  };

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">
            Servicios
          </h2>
          <p className="text-sm text-gray-500">
            Define los servicios que ofrece tu negocio
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800"
        >
          Agregar servicio
        </button>
      </div>

      {/* LISTA */}
      {services.length === 0 ? (
        <div className="border rounded-lg p-4 text-sm text-gray-500 bg-white">
          Aún no tienes servicios creados.
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onChange={loadServices}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <CreateServiceModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            loadServices();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
