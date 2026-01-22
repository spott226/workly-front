export const BUSINESS_THEMES = {
  spa: {
    label: 'Spa / Relajación',
    page: 'bg-stone-50 text-stone-800',
    hero: 'bg-gradient-to-b from-stone-200 to-stone-50',
    card: 'bg-white rounded-2xl shadow-sm',
    button: 'bg-stone-700 text-white hover:bg-stone-800',
  },

  beauty: {
    label: 'Salón de belleza',
    page: 'bg-white text-neutral-900',
    hero: 'bg-gradient-to-b from-pink-50 to-white',
    card: 'bg-white rounded-2xl shadow-md',
    button: 'bg-pink-600 text-white hover:bg-pink-700',
  },

  barber: {
    label: 'Barbería',
    page: 'bg-neutral-950 text-white',
    hero: 'bg-neutral-900',
    card: 'bg-neutral-900 border border-neutral-800 rounded-lg',
    button: 'bg-white text-black hover:bg-neutral-200',
  },

  dental: {
    label: 'Clínica dental',
    page: 'bg-sky-50 text-slate-900',
    hero: 'bg-white border-b',
    card: 'bg-white rounded-xl shadow-sm border',
    button: 'bg-sky-600 text-white hover:bg-sky-700',
  },

  physio: {
    label: 'Fisioterapia',
    page: 'bg-indigo-50 text-slate-900',
    hero: 'bg-gradient-to-b from-indigo-100 to-indigo-50',
    card: 'bg-white rounded-xl shadow',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },

  holistic: {
    label: 'Centro holístico',
    page: 'bg-emerald-50 text-emerald-900',
    hero: 'bg-gradient-to-b from-emerald-100 to-emerald-50',
    card: 'bg-white rounded-xl shadow-sm',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
} as const;
