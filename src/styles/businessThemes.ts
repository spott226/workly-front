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
   THEMES (CORRECTO)
========================= */

export const BUSINESS_THEMES = {
  spa: {
    label: 'Spa / Relajación',
    page: 'bg-[#F6FBF9] text-stone-800',
    hero: 'bg-gradient-to-b from-[#E6F3EE] to-transparent',
    card: `bg-white ${TOKENS.radius.lg} ${TOKENS.shadow.soft} ${TOKENS.spacing.card}`,
    button:
      'bg-stone-800 text-white hover:bg-stone-900 transition-all',
  },

  holistic: {
    label: 'Centro Holístico',
    page: 'bg-[#0F1E17] text-[#EAF5EE]',
    hero: 'bg-gradient-to-b from-[#13261E] to-transparent',
    card: `bg-[#162B22] border border-[#1F3A2F] ${TOKENS.radius.lg} ${TOKENS.shadow.medium} ${TOKENS.spacing.card}`,
    button:
      'bg-emerald-600 text-white hover:bg-emerald-500 transition-all',
  },

  beauty: {
    label: 'Salón de Belleza',
    page: 'bg-[#FFF7FA] text-[#3A1F2D]',
    hero: 'bg-gradient-to-b from-[#FCE7F3] to-transparent',
    card: `bg-white ${TOKENS.radius.lg} ${TOKENS.shadow.medium} ${TOKENS.spacing.card}`,
    button:
      'bg-pink-600 text-white hover:bg-pink-500 transition-all',
  },

  clinic: {
    label: 'Clínica / Consultorio',
    page: 'bg-[#F8FAFC] text-slate-900',
    hero: 'bg-gradient-to-b from-[#E2E8F0] to-transparent',
    card: `bg-white ${TOKENS.radius.md} ${TOKENS.shadow.soft} ${TOKENS.spacing.card}`,
    button:
      'bg-sky-600 text-white hover:bg-sky-500 transition-all',
  },

  barber: {
    label: 'Barbería',
    page: 'bg-black text-white',
    hero: 'bg-gradient-to-b from-neutral-900 to-black',
    card: `bg-neutral-900 border border-neutral-800 ${TOKENS.radius.md} ${TOKENS.shadow.luxury} ${TOKENS.spacing.card}`,
    button:
      'bg-white text-black hover:bg-neutral-200 transition-all',
  },
} as const;

/* =========================
   DERIVED TYPE (CLAVE)
========================= */

export type BusinessThemeKey = keyof typeof BUSINESS_THEMES;
