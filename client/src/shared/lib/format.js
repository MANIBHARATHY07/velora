import { format, parseISO, isValid } from 'date-fns';

/**
 * @param {number} amount
 * @param {'INR'|'USD'|'EUR'} currency
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

/**
 * @param {string|Date} date
 * @param {string} [fmt]
 * @returns {string}
 */
export function formatDate(date, fmt = 'dd MMM yyyy') {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, fmt) : '—';
}

/**
 * @param {number} value
 * @param {'km'|'miles'} unit
 * @returns {string}
 */
export function formatDistance(value, unit = 'km') {
  const num = unit === 'miles' ? Math.round(value * 0.621371) : value;
  return `${num.toLocaleString('en-IN')} ${unit}`;
}
