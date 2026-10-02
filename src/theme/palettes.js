import {withAlphaChannels} from './colorUtils';

// Single source of truth for every screen-level palette. Previously each file
// declared its own `light`/`dark` object, which made the same colors drift and
// repeated ~250 lines of literals across the app.
//
// Per-screen accent identities are intentionally preserved.

const mode = theme => (theme === 'dark' ? 'dark' : 'light');

// ---------------------------------------------------------------------------
// List screen palettes (expense / income / savings)
// ---------------------------------------------------------------------------
// These three screens shared an identical shape; only the accent and the dark
// tints differed, so the shared parts are declared once.

const LIST_BASE = {
  light: {
    background: ['#f6f7f9', '#eef0f3'],
    cardShadow: '#0f172a14',
    listBackground: '#f6f7f9',
    emptyIcon: '#9ca3af',
    cardBorder: 'rgba(15, 23, 42, 0.07)',
    textPrimary: '#0f172a',
    textSecondary: '#52617a',
    cardBackground: '#ffffff',
    pickerBackground: '#ffffff',
  },
  dark: {
    background: ['#0b0f0d', '#070a09'],
    cardShadow: '#00000055',
    listBackground: '#0b0f0d',
    emptyIcon: '#4b5563',
    cardBorder: 'rgba(148, 163, 184, 0.14)',
  },
};

const LIST_ACCENTS = {
  expense: {
    light: {accent: '#e11d48', accentSoft: '#f43f5e'},
    dark: {accent: '#f43f5e', accentSoft: '#fb7185'},
    tints: {
      dark: {
        textPrimary: '#f3e8ea',
        textSecondary: '#b0898f',
        cardBackground: '#161011',
        pickerBackground: '#1a1012',
      },
    },
  },
  income: {
    light: {accent: '#0f9d58', accentSoft: '#3aa76d'},
    dark: {accent: '#34d399', accentSoft: '#5eead4'},
    tints: {
      dark: {
        textPrimary: '#e6f4ec',
        textSecondary: '#8aa399',
        cardBackground: '#121a16',
        pickerBackground: '#0e2018',
        // The edit dialog used its own, slightly greener surface.
        dialogBackground: '#10231b',
      },
    },
  },
  savings: {
    light: {accent: '#0d9488', accentSoft: '#14b8a6'},
    dark: {accent: '#2dd4bf', accentSoft: '#5eead4'},
    tints: {
      dark: {
        textPrimary: '#e8f3f2',
        textSecondary: '#7fa3a0',
        cardBackground: '#10191c',
        pickerBackground: '#0e1a1c',
      },
    },
  },
};

const buildListPalette = (theme, config) => {
  const m = mode(theme);
  const accents = config[m];
  const tints = (config.tints && config.tints[m]) || {};
  const palette = {
    ...LIST_BASE[m],
    ...tints,
    ...accents,
    iconBackground: alpha => withAlphaChannels(accents.accent, alpha),
  };
  // Edit dialogs reuse the card surface unless the screen defined its own.
  palette.dialogBackground = palette.dialogBackground || palette.cardBackground;
  return palette;
};

const buildPair = key => ({
  light: buildListPalette('light', LIST_ACCENTS[key]),
  dark: buildListPalette('dark', LIST_ACCENTS[key]),
});

// `itemReport` intentionally aliases `expense` — the two screens were already
// byte-identical.
export const listPalettes = {
  expense: buildPair('expense'),
  itemReport: buildPair('expense'),
  income: buildPair('income'),
  savings: buildPair('savings'),
};

export const getListPalette = (theme, name) => listPalettes[name][mode(theme)];

// Header gradient for the list screens.
export const LIST_HEADER_GRADIENTS = {
  expense: ['#fb7185', '#e11d48', '#9f1239'],
  income: ['#10b981', '#059669', '#047857'],
  savingsDark: ['#0f172a', '#0e7490'],
};

// ---------------------------------------------------------------------------
// Form palettes (Expense / Source / Saving)
// ---------------------------------------------------------------------------

export const formPalettes = {
  dark: {
    background: '#0f172a',
    fieldBackground: '#1e293b',
    fieldBorder: '#475569',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    placeholder: '#64748b',
    primary: '#38bdf8',
    danger: '#f87171',
    glassOverlay: 'rgba(2, 6, 23, 0.6)',
    glassContainer: 'rgba(30, 41, 59, 0.95)',
    glassBorder: 'rgba(148, 163, 184, 0.35)',
  },
  light: {
    background: '#f5f7fb',
    fieldBackground: '#ffffff',
    fieldBorder: '#cbd5e1',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    placeholder: '#94a3b8',
    primary: '#2563eb',
    danger: '#dc2626',
    glassOverlay: 'rgba(2, 6, 23, 0.6)',
    glassContainer: 'rgba(255, 255, 255, 0.98)',
    glassBorder: 'rgba(15, 23, 42, 0.12)',
  },
};

export const getFormPalette = theme => formPalettes[mode(theme)];

// ---------------------------------------------------------------------------
// Add (tabbed entry) screen
// ---------------------------------------------------------------------------

export const addPalettes = {
  dark: {
    background: '#0f172a',
    headerGradient: ['#1d4ed8', '#7c3aed'],
    headerTitle: '#f8fafc',
    headerSubtitle: 'rgba(226, 232, 240, 0.78)',
    tabContainerBackground: 'rgba(15, 23, 42, 0.92)',
    tabContainerBorder: 'rgba(148, 163, 184, 0.32)',
    tabInactive: 'rgba(148, 163, 184, 0.14)',
    tabInactiveText: '#94a3b8',
    tabInactiveIcon: '#94a3b8',
    expenseGradient: ['#ef4444', '#dc2626'],
    incomeGradient: ['#22c55e', '#16a34a'],
    savingGradient: ['#0ea5e9', '#14b8a6'],
    savingButtonGradient: ['#4CAF50', '#2E7D32'],
    savingClearGradient: ['#64748b', '#475569'],
    savingBorder: '#475569',
    savingText: '#e2e8f0',
  },
  light: {
    background: '#f5f7fb',
    headerGradient: ['#2563eb', '#7c3aed'],
    headerTitle: '#ffffff',
    headerSubtitle: 'rgba(255, 255, 255, 0.85)',
    tabContainerBackground: '#ffffff',
    tabContainerBorder: 'rgba(37, 99, 235, 0.16)',
    tabInactive: 'rgba(37, 99, 235, 0.1)',
    tabInactiveText: '#64748b',
    tabInactiveIcon: '#64748b',
    expenseGradient: ['#fb7185', '#f97316'],
    incomeGradient: ['#34d399', '#16a34a'],
    savingGradient: ['#14b8a6', '#0ea5e9'],
    savingButtonGradient: ['#4CAF50', '#2E7D32'],
    savingClearGradient: ['#64748b', '#475569'],
    savingBorder: '#cbd5e1',
    savingText: '#0f172a',
  },
};

export const getAddPalette = theme => addPalettes[mode(theme)];

// ---------------------------------------------------------------------------
// Transaction reports
// ---------------------------------------------------------------------------

export const reportsPalettes = {
  dark: {
    background: '#0f172a',
    headerGradient: ['#0f172a', '#1e293b'],
    headerAccent: '#38bdf8',
    searchBackground: 'rgba(148, 163, 184, 0.16)',
    searchBorder: 'rgba(148, 163, 184, 0.28)',
    searchPlaceholder: '#94a3b8',
    iconColor: '#38bdf8',
    summaryGradients: [
      ['#f97316', '#fb7185'],
      ['#22d3ee', '#0284c7'],
      ['#34d399', '#059669'],
      ['#a855f7', '#6366f1'],
    ],
    summaryText: '#f8fafc',
    cardGradients: [
      ['#1f2937', '#111827'],
      ['#1e293b', '#0f172a'],
      ['#1d4ed8', '#1e293b'],
      ['#0f172a', '#0b1120'],
    ],
    cardBorder: 'rgba(148, 163, 184, 0.16)',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    chipBackground: 'rgba(56, 189, 248, 0.12)',
    chipText: '#bae6fd',
    downloadGradient: ['#38bdf8', '#0ea5e9'],
    emptyIcon: '#38bdf8',
  },
  light: {
    background: '#f5f7fb',
    headerGradient: ['#2563eb', '#7c3aed'],
    headerAccent: '#1d4ed8',
    searchBackground: 'rgba(255, 255, 255, 0.95)',
    searchBorder: 'rgba(59, 130, 246, 0.2)',
    searchPlaceholder: '#64748b',
    iconColor: '#2563eb',
    summaryGradients: [
      ['#f97316', '#fb923c'],
      ['#0ea5e9', '#38bdf8'],
      ['#22c55e', '#4ade80'],
      ['#6366f1', '#8b5cf6'],
    ],
    summaryText: '#ffffff',
    cardGradients: [
      ['#ffffff', '#f8fafc'],
      ['#fff7ed', '#ffedd5'],
      ['#ecfeff', '#cffafe'],
      ['#ede9fe', '#ddd6fe'],
    ],
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    chipBackground: 'rgba(99, 102, 241, 0.12)',
    chipText: '#4338ca',
    downloadGradient: ['#2563eb', '#7c3aed'],
    emptyIcon: '#2563eb',
  },
};

export const getReportsPalette = theme => reportsPalettes[mode(theme)];

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const dashboardPalettes = {
  dark: {
    headerAccent: '#38bdf8',
    searchBackground: 'rgba(148, 163, 184, 0.16)',
    cardBorder: 'rgba(148, 163, 184, 0.16)',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    summaryGradients: [
      ['#f97316', '#fb7185'],
      ['#22d3ee', '#0284c7'],
      ['#34d399', '#059669'],
      ['#a855f7', '#6366f1'],
    ],
    summaryText: '#f8fafc',
    background: '#0f172a',
  },
  light: {
    headerAccent: '#1d4ed8',
    searchBackground: 'rgba(255, 255, 255, 0.6)',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    glassBorder: 'rgba(99, 102, 241, 0.18)',
    glassBg: 'rgba(255, 255, 255, 0.6)',
    quickActionBg: 'rgba(255, 255, 255, 0.65)',
    quickActionBorder: 'rgba(99, 102, 241, 0.22)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    summaryGradients: [
      ['#f97316', '#fb7185'],
      ['#22d3ee', '#0284c7'],
      ['#34d399', '#059669'],
      ['#a855f7', '#6366f1'],
    ],
    summaryText: '#f8fafc',
    background: '#f5f7fb',
  },
};

export const getDashboardPalette = theme => dashboardPalettes[mode(theme)];

// ---------------------------------------------------------------------------
// App header
// ---------------------------------------------------------------------------

export const headerPalettes = {
  light: {
    icon: '#64B5F6',
    gradient: ['#E3F2FD', '#feffffff'],
    strong: '#1E3A8A',
    soft: '#2563EB',
    tagline: '#64748B',
  },
  dark: {
    icon: '#1b1b1dff',
    gradient: ['#0d0d0eff', '#37373bff'],
    strong: '#818CF8',
    soft: '#38BDF8',
    tagline: '#94A3B8',
  },
};

export const getHeaderPalette = theme => headerPalettes[mode(theme)];

// ---------------------------------------------------------------------------
// Screen accent configs, consumed by `buildScreenPalette`
// ---------------------------------------------------------------------------

export const SCREEN_ACCENTS = {
  categories: {accent: '#ea580c', accentSoft: '#fed7aa', iconGlow: 'rgba(249, 115, 22, 0.35)'},
  balance: {accent: '#ea580c', accentSoft: '#fed7aa', iconGlow: 'rgba(249, 115, 22, 0.35)'},
  products: {accent: '#7c3aed', accentSoft: '#ddd6fe', iconGlow: 'rgba(139, 92, 246, 0.35)'},
  sources: {accent: '#059669', accentSoft: '#a7f3d0', iconGlow: 'rgba(52, 211, 153, 0.35)'},
  tax: {accent: '#6366f1', accentSoft: '#c7d2fe', iconGlow: 'rgba(99, 102, 241, 0.35)'},
};
