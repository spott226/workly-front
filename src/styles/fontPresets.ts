export const FONT_PRESETS = {
  elegant: {
    label: 'Elegante',
    className: 'font-serif',
  },
  modern: {
    label: 'Moderna',
    className: 'font-sans',
  },
  minimal: {
    label: 'Minimal',
    className: 'font-light',
  },
} as const;

export type FontKey = keyof typeof FONT_PRESETS;
