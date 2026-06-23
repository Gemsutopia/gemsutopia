import { format, formatDistance, formatRelative, parseISO } from 'date-fns';

// Currency formatting
export function formatCurrency(
  amount: number | string,
  currency = 'CAD',
  locale = 'en-CA'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

// Short currency (no decimals for whole numbers)
export function formatCurrencyShort(amount: number | string, currency = 'CAD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '$0';
  }

  const hasDecimals = numAmount % 1 !== 0;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

// Date formatting
export function formatDate(
  date: Date | string,
  formatString = 'MMMM d, yyyy'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatString);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'MMMM d, yyyy h:mm a');
}

export function formatDateShort(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy');
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatRelative(d, new Date());
}

// Number formatting
export function formatNumber(
  num: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-CA', options).format(num);
}

export function formatPercent(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`;
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-CA', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

// Order number formatting
export function formatOrderNumber(orderId: string): string {
  return `#${orderId.slice(-8).toUpperCase()}`;
}

// Phone formatting
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

// Truncate text
export function truncate(text: string, length: number, suffix = '...'): string {
  if (text.length <= length) return text;
  return text.slice(0, length - suffix.length) + suffix;
}

// Capitalize first letter
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Title case
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
