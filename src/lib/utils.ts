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
