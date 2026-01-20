import { apiFetch } from './apiFetch';

export type User = {
  id: string;
  email: string;
  role: 'OWNER' | 'STAFF';
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
};

export async function getMe(): Promise<User> {
  return apiFetch('/users/me');
}
