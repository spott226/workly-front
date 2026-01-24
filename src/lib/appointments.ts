import { apiFetch } from './apiFetch';

export type Appointment = {
  id: string;

  // 🔥 CLAVE PARA STAFF AVAILABILITY
  employee_id: string;

  client_name: string;
  service_name: string;
  employee_name: string;
  phone: string;
  starts_at: string;
  ends_at: string;

  status: 'PENDING' | 'CONFIRMED' | 'ATTENDED' | 'NO_SHOW' | 'CANCELLED';
};


/* ======================
   LISTAR CITAS
====================== */

export const getAppointments = (): Promise<Appointment[]> =>
  apiFetch('/appointments');


/* ======================
   ACCIONES
====================== */
export const confirmAppointment = (id: string) =>
  apiFetch(`/appointments/${id}/confirm`, { method: 'PATCH' });

export const attendAppointment = (id: string) =>
  apiFetch(`/appointments/${id}/attend`, { method: 'PATCH' });

export const noShowAppointment = (id: string) =>
  apiFetch(`/appointments/${id}/no-show`, { method: 'PATCH' });

export const cancelAppointment = (id: string) =>
  apiFetch(`/appointments/${id}/cancel`, { method: 'PATCH' });

export const rescheduleAppointment = (id: string, startISO: string) =>
  apiFetch(`/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ startISO }),
  });
