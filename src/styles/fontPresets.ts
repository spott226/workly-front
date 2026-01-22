export const FONT_PRESETS = {
  elegant: {
    label: 'Elegante clásica',
    className: 'font-serif tracking-wide',
  },

  modern: {
    label: 'Moderna limpia',
    className: 'font-sans tracking-normal',
  },

  minimal: {
    label: 'Minimal suave',
    className: 'font-light tracking-wide',
  },

  luxury: {
    label: 'Luxury editorial',
    className:
      'font-serif font-semibold tracking-widest leading-snug',
  },

  wellness: {
    label: 'Wellness soft',
    className:
      'font-sans font-light tracking-wide leading-relaxed',
  },

  beauty: {
    label: 'Beauty bold',
    className:
      'font-sans font-semibold tracking-tight',
  },

  clinical: {
    label: 'Clínica profesional',
    className:
      'font-sans font-medium tracking-normal leading-tight',
  },

  masculine: {
    label: 'Masculina dark',
    className:
      'font-sans font-bold tracking-wide uppercase',
  },
} as const;

export type FontKey = keyof typeof FONT_PRESETS;
