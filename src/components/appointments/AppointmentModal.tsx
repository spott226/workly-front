'use client';

import { Appointment } from '@/lib/appointments';
import { AppointmentCard } from './AppointmentCard';

type Props = {
  appointment: Appointment;
  onClose: () => void;
  onChange: () => void;
};

export function AppointmentModal({
  appointment,
  onClose,
  onChange,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-lg p-4 relative">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {/* REUTILIZAMOS TODO */}
        <AppointmentCard
          appointment={appointment}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
