// Raw, theme-independent color tokens.
// Anything that changes between light and dark belongs in `theme.js` instead —
// this file only holds colors that stay fixed regardless of the active theme.

// Foreground colors used on top of gradient backgrounds. Gradient headers do
// not re-color with the theme, so these stay constant in both modes.
export const ON_GRADIENT = {
  primary: '#ffffff',
  muted: 'rgba(255, 255, 255, 0.85)',
  subtle: 'rgba(255, 255, 255, 0.78)',
  faint: 'rgba(255, 255, 255, 0.75)',
  disabled: 'rgba(255, 255, 255, 0.7)',
  decor: 'rgba(255, 255, 255, 0.08)',
  glass: 'rgba(255, 255, 255, 0.12)',
  glassStrong: 'rgba(255, 255, 255, 0.16)',
  glassBorder: 'rgba(255, 255, 255, 0.28)',
  pill: 'rgba(255, 255, 255, 0.18)',
  pillBorder: 'rgba(255, 255, 255, 0.35)',
  pillSolid: 'rgba(255, 255, 255, 0.85)',
  avatar: 'rgba(255, 255, 255, 0.22)',
  button: 'rgba(255, 255, 255, 0.25)',
  icon: 'rgba(255, 255, 255, 0.7)',
  divider: 'rgba(255, 255, 255, 0.15)',
  track: 'rgba(255, 255, 255, 0.12)',
};

// Neutral UI colors that are identical in both themes.
export const NEUTRAL = {
  dangerIcon: '#ff4444',
  emptyIconMuted: '#ccc',
  grey: '#666',
  lightIcon: '#81b0ff',
  lightTrack: '#767577',
  lightThumb: '#f4f3f4',
};

// Scrims / overlays layered above the app.
export const OVERLAY = {
  backdrop: 'rgba(2, 6, 23, 0.6)',
  scrim: 'rgba(0, 0, 0, 0.4)',
  scrimSoft: 'rgba(0, 0, 0, 0.55)',
  scrimStrong: 'rgba(0, 0, 0, 0.95)',
  closeChip: 'rgba(0, 0, 0, 0.5)',
  dialogBusy: 'rgba(255, 255, 255, 0.5)',
  track: 'rgba(0, 0, 0, 0.22)',
  segment: 'rgba(0, 0, 0, 0.12)',
  hairline: 'rgba(148, 163, 184, 0.3)',
  hairlineSoft: 'rgba(148, 163, 184, 0.16)',
  cancel: 'rgba(148, 163, 184, 0.16)',
  cancelDark: 'rgba(148, 163, 184, 0.22)',
};

/**
 * Background for a dialog's Cancel button. Was repeated as
 * `isDark ? 'rgba(148,163,184,0.22)' : 'rgba(148,163,184,0.16)'` in five
 * separate dialogs.
 */
export const cancelBackground = isDark =>
  isDark ? OVERLAY.cancelDark : OVERLAY.cancel;
