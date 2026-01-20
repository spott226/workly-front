export type Role = 'OWNER' | 'STAFF';
export type Plan = 'BASIC' | 'PRO' | 'ENTERPRISE';

export const mockUser = {
  role: 'OWNER' as Role,
  plan: 'PRO' as Plan,
  businessName: 'Mi Negocio'
};
