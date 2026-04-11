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

/** Format a number as compact BRL (e.g. R$ 5,8k). */
export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `R$ ${(Math.abs(value) / 1000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

/** Format ISO date string to short label like "Apr 10". */
export function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

/** Format ISO date to full date like "April 10, 2026". */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
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
