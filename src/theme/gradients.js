// Gradient definitions. Gradients are fixed brand colors and therefore live
// outside the light/dark theme. Import these instead of re-writing the same
// `{colors: [...], start, end}` object in every screen.

const DIAGONAL = {start: {x: 0, y: 0}, end: {x: 1, y: 1}};
const DOWN = {start: {x: 0, y: 0}, end: {x: 0, y: 1}};

const pair = (from, to, coords) => ({colors: [from, to], ...coords});

export const GRADIENTS = {
  brand: pair('#4f46e5', '#7c3aed', DIAGONAL),
  brandDown: pair('#4f46e5', '#7c3aed', DOWN),

  expense: pair('#f43f5e', '#fb7185', DIAGONAL),
  income: pair('#059669', '#34d399', DIAGONAL),
  balance: pair('#4f46e5', '#6366f1', DIAGONAL),
  savings: pair('#0891b2', '#22d3ee', DIAGONAL),
  tax: pair('#d97706', '#f59e0b', DIAGONAL),

  footerLight: pair('#4f46e5', '#7c3aed', DIAGONAL),
  footerDark: pair('#312e81', '#4c1d95', DIAGONAL),
};
