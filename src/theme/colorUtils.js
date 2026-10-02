// Small color helpers shared by the palette factory and the few screens that
// need translucent variants of a brand color.

/** `#e11d48` -> `225, 29, 72`. Returns null for non-hex input. */
export const hexToRgb = hex => {
  if (typeof hex !== 'string') {return null;}
  const value = hex.trim().replace('#', '');
  if (value.length !== 6) {return null;}
  const int = parseInt(value, 16);
  if (Number.isNaN(int)) {return null;}
  // eslint-disable-next-line no-bitwise
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
};

/** Builds `rgba(r, g, b, alpha)` from a hex color. */
export const withAlphaChannels = (hex, alpha) => {
  const rgb = hexToRgb(hex);
  if (!rgb) {return hex;}
  return `rgba(${rgb}, ${alpha})`;
};

/** Appends an alpha channel to a hex color: `#e11d48` + `0.35` -> `#e11d4859`. */
export const withAlpha = (hex, alpha) => {
  if (typeof hex !== 'string') {return hex;}
  const normalized = hex.trim();
  if (!normalized.startsWith('#')) {return normalized;}
  if (normalized.length === 9) {return normalized;}
  if (normalized.length !== 7) {return normalized;}
  const alphaHex = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${normalized}${alphaHex}`;
};
