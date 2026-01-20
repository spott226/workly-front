import { apiFetch } from './apiFetch';

/* ===========================
   CLIENTES
=========================== */

export async function fetchClients() {
  const res = await apiFetch<{ data: any[] }>('/clients');
  return res.data;
}

export async function fetchClientStats() {
  const res = await apiFetch<{
    data: {
      today: { attended: number; no_show: number };
      week: { attended: number; no_show: number };
      month: { attended: number; no_show: number };
    };
  }>('/clients/stats');

  return res.data;
}
