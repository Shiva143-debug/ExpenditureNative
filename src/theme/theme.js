// Base light/dark semantic colors. Raw brand colors, gradients and per-screen
// accents live in `colors.js`, `gradients.js` and `palettes.js` respectively.

export const lightColors = {
  primary: '#2563eb',
  primaryDark: '#1e40af',
  primarySoft: 'rgba(37, 99, 235, 0.12)',
  background: '#f5f7fb',
  surface: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  cardBackground: '#ffffff',
  cardAccent: '#334155',
  cardBorder: 'rgba(15, 23, 42, 0.08)',
  cardShadow: '#e2e8f01a',
  emptyIcon: '#64748b',
  header: '#f1f5f9',
  inputBackground: '#ffffff',
  inputBorder: '#ccc',
  inputPlaceholder: '#666',
  tabActive: '#2563eb',
  tabInactive: '#64748b',
  danger: '#dc2626',
  success: '#16a34a',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const darkColors = {
  primary: '#38bdf8',
  primaryDark: '#0284c7',
  primarySoft: 'rgba(56, 189, 248, 0.22)',
  background: '#0f172a',
  surface: '#000000',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  cardBackground: 'rgba(255, 255, 255, 0.1)',
  cardAccent: '#e2e8f0',
  cardBorder: 'rgba(148, 163, 184, 0.16)',
  cardShadow: '#e0d9d955',
  emptyIcon: '#475569',
  header: 'rgba(35, 35, 35, 0.19)',
  inputBackground: '#1e1e1e',
  inputBorder: '#555',
  inputPlaceholder: '#ccc',
  tabActive: '#38bdf8',
  tabInactive: '#94a3b8',
  danger: '#dc2626',
  success: '#22c55e',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const themes = {
  light: lightColors,
  dark: darkColors,
};

/**
 * Builds the palette used by the simple list screens (categories, products,
 * sources, tax, balance) from a shared accent config.
 * Pass `SCREEN_ACCENTS.categories` as the second argument.
 */
export const buildScreenPalette = (theme, accentConfig) => {
  const colors = themes[theme] || themes.light;
  const {accent, accentSoft, iconGlow, cardBorder} = accentConfig;
  return {
    header: colors.header,
    background: colors.background,
    accent,
    accentSoft,
    surface: colors.surface,
    cardShadow: colors.cardShadow,
    iconGlow,
    emptyIcon: colors.emptyIcon,
    cardBackground: colors.cardBackground,
    cardAccent: colors.cardAccent,
    cardBorder: cardBorder || colors.cardBorder,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
  };
};
