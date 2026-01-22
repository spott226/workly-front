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
   BUSINESS THEMES – PRO EDITION
========================= */

export const BUSINESS_THEMES = {
  spa: {
    label: 'Spa natural',
    page: 'bg-[#F4FAF7] text-stone-800',
    hero: 'bg-gradient-to-b from-[#E2F2EC] to-[#F4FAF7]',
    card: `bg-[#F9FDFC] ${TOKENS.radius.lg} ${TOKENS.shadow.soft} ${TOKENS.spacing.card}`,
    button:
      'bg-emerald-700 text-white hover:bg-emerald-800 transition-all',
  },

  holistic: {
    label: 'Holístico profundo',
    page: 'bg-[#0E1C16] text-[#EAF5EE]',
    hero: 'bg-gradient-to-b from-[#142820] to-[#0E1C16]',
    card: `bg-[#162B22] ${TOKENS.radius.lg} ${TOKENS.shadow.medium} ${TOKENS.spacing.card}`,
    button:
      'bg-emerald-600 text-white hover:bg-emerald-500 transition-all',
  },

  beauty: {
    label: 'Beauty glam',
    page: 'bg-[#FDF4F8] text-[#3A1F2D]',
    hero: 'bg-gradient-to-b from-[#FCE7F3] to-[#FDF4F8]',
    card: `bg-[#FFF9FB] ${TOKENS.radius.lg} ${TOKENS.shadow.medium} ${TOKENS.spacing.card}`,
    button:
      'bg-pink-600 text-white hover:bg-pink-500 transition-all',
  },

  clinic: {
    label: 'Clínico moderno',
    page: 'bg-[#F5F7FA] text-slate-900',
    hero: 'bg-gradient-to-b from-[#E2E8F0] to-[#F5F7FA]',
    card: `bg-white/90 backdrop-blur ${TOKENS.radius.md} ${TOKENS.shadow.soft} ${TOKENS.spacing.card}`,
    button:
      'bg-sky-600 text-white hover:bg-sky-500 transition-all',
  },

  barber: {
    label: 'Barber dark',
    page: 'bg-black text-white',
    hero: 'bg-gradient-to-b from-neutral-900 to-black',
    card: `bg-neutral-900 ${TOKENS.radius.md} ${TOKENS.shadow.luxury} ${TOKENS.spacing.card}`,
    button:
      'bg-white text-black hover:bg-neutral-200 transition-all',
  },

  luxuryDark: {
    label: 'Luxury dark',
    page: 'bg-[#0B0B0C] text-[#EDEDED]',
    hero: 'bg-gradient-to-b from-[#1A1A1C] to-[#0B0B0C]',
    card: `bg-[#141416] ${TOKENS.radius.lg} ${TOKENS.shadow.luxury} ${TOKENS.spacing.card}`,
    button:
      'bg-[#C9A24D] text-black hover:bg-[#D4B15F] transition-all',
  },

  editorialWhite: {
    label: 'Editorial premium',
    page: 'bg-[#FAFAFA] text-neutral-900',
    hero: 'bg-gradient-to-b from-white to-[#FAFAFA]',
    card: `bg-white ${TOKENS.radius.lg} shadow-md ${TOKENS.spacing.card}`,
    button:
      'bg-black text-white hover:bg-neutral-800 transition-all',
  },

  warmSand: {
    label: 'Warm sand spa',
    page: 'bg-[#FBF6EF] text-[#3B2F2F]',
    hero: 'bg-gradient-to-b from-[#F3E8D8] to-[#FBF6EF]',
    card: `bg-[#FFFDF9] ${TOKENS.radius.lg} ${TOKENS.shadow.soft} ${TOKENS.spacing.card}`,
    button:
      'bg-[#B08968] text-white hover:bg-[#9C7557] transition-all',
  },

  neoBlack: {
    label: 'Neo black',
    page: 'bg-[#050505] text-[#E5E5E5]',
    hero: 'bg-gradient-to-b from-[#111111] to-[#050505]',
    card: `bg-[#0F0F0F] ${TOKENS.radius.md} ${TOKENS.shadow.luxury} ${TOKENS.spacing.card}`,
    button:
      'bg-white text-black hover:bg-neutral-200 transition-all',
  },
} as const;

export type BusinessThemeKey = keyof typeof BUSINESS_THEMES;
