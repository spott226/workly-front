import { apiFetch } from './apiFetch';

export type Staff = {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

export async function getStaff(): Promise<Staff[]> {
  return apiFetch('/staff');
}

export async function createStaff(payload: {
  email: string;
  password: string;
}) {
  return apiFetch('/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deactivateStaff(id: string) {
  return apiFetch(`/staff/${id}/deactivate`, {
    method: 'PATCH',
  });
}

export async function activateStaff(id: string) {
  return apiFetch(`/staff/${id}/activate`, {
    method: 'PATCH',
  });
}
