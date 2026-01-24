'use client';

import { useState } from 'react';
import { DateTime } from 'luxon';
import {
  Appointment,
  confirmAppointment,
  attendAppointment,
  noShowAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from '@/lib/appointments';
import { DateTimeSelector } from '@/components/booking/DateTimeSelector';

type Props = {
  appointment: Appointment;
  onChange: () => void;
};

/* ===========================
   Helpers fecha / hora MX
=========================== */

const toMX = (iso: string) =>
  DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Mexico_City');

const formatTime = (iso: string) => toMX(iso).toFormat('hh:mm a');
const formatDate = (iso: string) => toMX(iso).toFormat('dd LLL yyyy');

/* ===========================
   COLORES POR ESTADO
=========================== */

const STATUS_STYLES: Record<
  string,
  { badge: string; border: string }
> = {
  PENDING: {
    badge: 'bg-yellow-100 text-yellow-800',
    border: 'border-yellow-300',
  },
  CONFIRMED: {
    badge: 'bg-blue-100 text-blue-800',
    border: 'border-blue-300',
  },
  ATTENDED: {
    badge: 'bg-emerald-100 text-emerald-800',
    border: 'border-emerald-300',
  },
  NO_SHOW: {
    badge: 'bg-red-100 text-red-800',
    border: 'border-red-300',
  },
  CANCELLED: {
    badge: 'bg-gray-100 text-gray-700',
    border: 'border-gray-300',
  },
  RESCHEDULED: {
    badge: 'bg-purple-100 text-purple-800',
    border: 'border-purple-300',
  },
};

export function AppointmentCard({ appointment, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newStartISO, setNewStartISO] = useState<string | null>(null);

  const statusStyle =
    STATUS_STYLES[appointment.status] ??
    STATUS_STYLES.PENDING;

  async function handle(action: () => Promise<any>) {
    try {
      setLoading(true);
      setError(null);
      await action();
      onChange();
    } catch (e: any) {
      setError(e?.message || 'Error al actualizar la cita');
    } finally {
      setLoading(false);
    }
  }

  /* ===========================
     WHATSAPP
  =========================== */

  function openWhatsapp(message: string) {
    const phone = appointment.phone?.replace(/\D/g, '');
    if (!phone) return;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  }

  function sendConfirmWhatsapp() {
    openWhatsapp(
      `Hola ${appointment.client_name}, te confirmamos tu cita el ${formatDate(
        appointment.starts_at
      )} a las ${formatTime(appointment.starts_at)}. 🙌`
    );
  }

  function sendRescheduleWhatsapp(newISO: string) {
    openWhatsapp(
      `Hola ${appointment.client_name}, tu cita fue reagendada para el ${formatDate(
        newISO
      )} a las ${formatTime(newISO)}. 🙌`
    );
  }

  return (
    <div
      className={`w-full border rounded-lg bg-white p-4 sm:p-5 space-y-4 ${statusStyle.border}`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        {/* Info */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">
              {appointment.client_name}
            </p>

            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.badge}`}
            >
              {appointment.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 truncate">
            {appointment.service_name} · {appointment.employee_name}
          </p>

          <p className="text-sm">📞 {appointment.phone}</p>

          <p className="text-sm text-gray-600">
            📅 {formatDate(appointment.starts_at)} · ⏰{' '}
            {formatTime(appointment.starts_at)} –{' '}
            {formatTime(appointment.ends_at)}
          </p>

          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {/* CONFIRMAR */}
          {appointment.status === 'PENDING' && (
            <button
              disabled={loading}
              onClick={() => {
                sendConfirmWhatsapp();
                handle(() => confirmAppointment(appointment.id));
              }}
              className="px-4 py-2 text-sm border rounded-md disabled:opacity-50"
            >
              Confirmar y enviar WhatsApp
            </button>
          )}

          {/* ASISTENCIA */}
          {appointment.status === 'CONFIRMED' && (
            <>
              <button
                disabled={loading}
                onClick={() => handle(() => attendAppointment(appointment.id))}
                className="px-4 py-2 text-sm border rounded-md"
              >
                Asistió
              </button>

              <button
                disabled={loading}
                onClick={() => handle(() => noShowAppointment(appointment.id))}
                className="px-4 py-2 text-sm border rounded-md"
              >
                No asistió
              </button>
            </>
          )}

          {/* REAGENDAR / CANCELAR */}
          {['PENDING', 'CONFIRMED'].includes(appointment.status) && (
            <>
              <button
                onClick={() => setShowReschedule(true)}
                className="px-4 py-2 text-sm border rounded-md"
              >
                Reagendar
              </button>

              <button
                onClick={() =>
                  handle(() => cancelAppointment(appointment.id))
                }
                className="px-4 py-2 text-sm border rounded-md text-red-600"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* REAGENDAR */}
      {showReschedule && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <p className="text-sm font-medium">
            Selecciona nueva fecha y hora
          </p>

          <DateTimeSelector onSelect={(iso) => setNewStartISO(iso)} />

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              disabled={!newStartISO || loading}
              onClick={() => {
                sendRescheduleWhatsapp(newStartISO!);

                handle(async () => {
                  await rescheduleAppointment(
                    appointment.id,
                    newStartISO!
                  );
                  setShowReschedule(false);
                  setNewStartISO(null);
                });
              }}
              className="px-4 py-2 text-sm bg-black text-white rounded-md disabled:bg-gray-300"
            >
              Confirmar y enviar WhatsApp
            </button>

            <button
              onClick={() => {
                setShowReschedule(false);
                setNewStartISO(null);
              }}
              className="px-4 py-2 text-sm border rounded-md"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
