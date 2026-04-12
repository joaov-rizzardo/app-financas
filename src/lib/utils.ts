import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as BRL currency. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(value));
}

export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `R$ ${(Math.abs(value) / 1000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

export function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr + "T00:00:00"));
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr + "T00:00:00"));
}

/** Return the signed prefix for an amount (+/-). */
export function amountSign(value: number): string {
  return value >= 0 ? '+' : '-';
}

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Return a progress percentage (0–100) clamped at 100. */
export function toPercent(current: number, total: number): number {
  if (total === 0) return 0;
  return clamp(Math.round((current / total) * 100), 0, 100);
}

// ─── Credit card invoice utilities ───────────────────────────────────────────

/**
 * Determines which invoice month a purchase date belongs to.
 * If the day of the date is after the closing day, the purchase belongs to
 * the following month's invoice.
 */
export function getInvoiceMonth(date: string, closingDay: number): string {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDate();
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed

  if (day > closingDay) {
    const next = new Date(year, month + 1, 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  }

  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * Returns the due date for a given invoice month.
 * The due date is always in the month following the invoice month.
 */
export function getInvoiceDueDate(invoiceMonth: string, dueDay: number): string {
  const [yearStr, monthStr] = invoiceMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-indexed
  const dueMonth = month === 12 ? 1 : month + 1;
  const dueYear = month === 12 ? year + 1 : year;
  const lastDay = new Date(dueYear, dueMonth, 0).getDate();
  const day = Math.min(dueDay, lastDay);
  return `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Format "2026-04" → "abril 2026" for display in headers. */
export function formatInvoiceMonth(invoiceMonth: string): string {
  const [year, month] = invoiceMonth.split('-');
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d);
}

/** Shift an invoice month by delta months (positive = forward, negative = back). */
export function shiftInvoiceMonth(invoiceMonth: string, delta: number): string {
  const [yearStr, monthStr] = invoiceMonth.split('-');
  const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
