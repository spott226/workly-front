import { TOKENS } from './designTokens';

/* =========================
   TYPES
========================= */

export type BusinessTheme = {
  label: string;
  page: string;
  hero: string;
  card: string;
  button: string;
};

/* =========================
   THEMES (AJUSTE VISUAL – ADIÓS BLANCO BETA)
========================= */

export const BUSINESS_THEMES = {
  spa: {
    label: 'Spa / Relajación',
    page: 'bg-[#F4FAF7] text-stone-800',
    hero: 'bg-gradient-to-b from-[#E2F2EC] to-[#F4FAF7]',
    card: `bg-[#F9FDFC] ${TOKENS.radius.lg} ${TOKENS.shadow.soft} ${TOKENS.spacing.card}`,
    button:
      'bg-emerald-700 text-white hover:bg-emerald-800 transition-all',
  },

  holistic: {
    label: 'Centro Holístico',
    page: 'bg-[#0E1C16] text-[#EAF5EE]',
    hero: 'bg-gradient-to-b from-[#142820] to-[#0E1C16]',
    card: `bg-[#162B22] ${TOKENS.radius.lg} ${TOKENS.shadow.medium} ${TOKENS.spacing.card}`,
    button:
      'bg-emerald-600 text-white hover:bg-emerald-500 transition-all',
  },

  beauty: {
    label: 'Salón de Belleza',
    page: 'bg-[#FDF4F8] text-[#3A1F2D]',
    hero: 'bg-gradient-to-b from-[#FCE7F3] to-[#FDF4F8]',
    card: `bg-[#FFF9FB] ${TOKENS.radius.lg} ${TOKENS.shadow.medium} ${TOKENS.spacing.card}`,
    button:
      'bg-pink-600 text-white hover:bg-pink-500 transition-all',
  },

  clinic: {
    label: 'Clínica / Consultorio',
    page: 'bg-[#F5F7FA] text-slate-900',
    hero: 'bg-gradient-to-b from-[#E2E8F0] to-[#F5F7FA]',
    card: `bg-[#FFFFFF]/90 backdrop-blur ${TOKENS.radius.md} ${TOKENS.shadow.soft} ${TOKENS.spacing.card}`,
    button:
      'bg-sky-600 text-white hover:bg-sky-500 transition-all',
  },

  barber: {
    label: 'Barbería',
    page: 'bg-black text-white',
    hero: 'bg-gradient-to-b from-neutral-900 to-black',
    card: `bg-neutral-900 ${TOKENS.radius.md} ${TOKENS.shadow.luxury} ${TOKENS.spacing.card}`,
    button:
      'bg-white text-black hover:bg-neutral-200 transition-all',
  },
} as const;

export type BusinessThemeKey = keyof typeof BUSINESS_THEMES;
