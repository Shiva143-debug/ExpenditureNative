// Date and value helpers. These were copy-pasted into IncomeList, SavingsList,
// ExpensesList, ItemReport and Dashboard.
//
// NOTE: `dateKeyToLocal` parses a bare `YYYY-MM-DD` as *local* midnight, which
// is what the list and report screens need. Code that must keep the old
// `new Date(value)` (UTC) behaviour should not route through here.

export const pad2 = n => String(n).padStart(2, '0');

/**
 * Parses a date into a *local* Date. The API returns `YYYY-MM-DD` strings and
 * `new Date('2024-01-05')` parses as UTC midnight, which shifts the day for
 * users behind UTC. Bare `YYYY-MM-DD` values are therefore split manually.
 */
export const dateKeyToLocal = value => {
  if (!value) {return null;}
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const raw = String(value).trim();
  if (raw.includes('T')) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) {return null;}
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

/** Inverse of `dateKeyToLocal`, producing a local `YYYY-MM-DD` key. */
export const toDateKey = value => {
  const d = dateKeyToLocal(value);
  if (!d) {return '';}
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/**
 * `2024-01-05` -> `05-01-2024`, or '' when unparseable.
 * Used by the income, savings, expense and item-report cards.
 */
export const formatDateKey = value => {
  const d = dateKeyToLocal(value);
  if (!d) {return '';}
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

/** `parseFloat` with a 0 fallback — matches the original Dashboard helper. */
export const toNumber = value => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Strips currency symbols/commas from user input before `parseFloat`. */
export const parseCurrencyValue = value => {
  if (value === undefined || value === null) {return 0;}
  if (typeof value === 'number') {return value;}
  const sanitized = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(sanitized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
