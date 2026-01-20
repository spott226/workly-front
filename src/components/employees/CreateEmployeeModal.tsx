'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export function CreateEmployeeModal({ onClose, onCreated }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      alert('Completa todos los campos');
      return;
    }

    setLoading(true);

    await apiFetch('/employees', {
      method: 'POST',
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        phone,
      }),
    });

    setLoading(false);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-5 sm:p-6 space-y-4">
        <h3 className="text-base sm:text-lg font-semibold">
          Agregar empleado
        </h3>

        <div className="space-y-3">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Nombre"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Apellido"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Teléfono"
            inputMode="tel"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
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
