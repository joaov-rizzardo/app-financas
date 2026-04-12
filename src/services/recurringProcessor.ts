import { listRecurringItems, updateRecurringItem, deleteRecurringItem } from './recurringItems';
import { createTransaction } from './transactions';
import { createCreditCardExpense } from './creditCardExpenses';
import { getCreditCardConfig } from './creditCardConfig';
import { getInvoiceMonth } from '@/lib/utils';
import type { RecurringItem } from '@/types/finance';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProcessingProgress {
  total: number;
  processed: number;
  currentDescription: string;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

export interface ProcessingResult {
  generated: number;
  completed: number; // installments that finished and were removed
  errors: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonthKey(): string {
  return new Date().toISOString().substring(0, 7); // YYYY-MM
}

/** True if the item requires a new transaction to be generated right now. */
function needsGeneration(item: RecurringItem): boolean {
  if (!item.lastGeneratedAt) return true;

  const now = new Date();

  if (item.frequency === 'monthly') {
    const lastMonth = item.lastGeneratedAt.substring(0, 7);
    return lastMonth < currentMonthKey();
  }

  if (item.frequency === 'weekly') {
    const lastDate = new Date(item.lastGeneratedAt);
    const daysDiff = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysDiff >= 7;
  }

  return false;
}

/**
 * Builds the ISO date string for the generated transaction.
 * For monthly items: preserves the original day-of-month, capped to the last
 * day of the current month. For weekly items: uses today.
 */
function buildTransactionDate(item: RecurringItem): string {
  const now = new Date();

  if (item.frequency === 'monthly') {
    const originalDay = parseInt(item.startDate.substring(8, 10), 10);
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const day = Math.min(originalDay, lastDayOfMonth);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Weekly: use today
  return now.toISOString().substring(0, 10);
}

/**
 * Returns the installment number that will be generated next.
 * installmentCurrent in the RecurringItem tracks the last generated number,
 * so the next one is always +1.
 */
function nextInstallmentNumber(item: RecurringItem): number {
  return (item.installmentCurrent ?? 0) + 1;
}

/**
 * True if the installment about to be generated is the last one.
 * Uses nextInstallmentNumber so the RecurringItem is deleted after the correct
 * transaction is written — not one cycle too early or too late.
 */
function isLastInstallment(item: RecurringItem): boolean {
  return (
    item.installmentTotal != null &&
    item.installmentCurrent != null &&
    nextInstallmentNumber(item) >= item.installmentTotal
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fast pre-check: returns true if any recurring item needs a transaction. */
export async function hasPendingRecurringItems(): Promise<boolean> {
  const items = await listRecurringItems();
  return items.some(needsGeneration);
}

/**
 * Generates transactions for all pending recurring items and updates their
 * state in Firestore. Calls `onProgress` before each item so the UI can
 * reflect what is happening.
 */
export async function processRecurringItems(
  onProgress?: ProgressCallback,
): Promise<ProcessingResult> {
  const allItems = await listRecurringItems();
  const pending = allItems.filter(needsGeneration);

  const result: ProcessingResult = { generated: 0, completed: 0, errors: [] };

  if (pending.length === 0) return result;

  onProgress?.({ total: pending.length, processed: 0, currentDescription: 'Iniciando...' });

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];

    onProgress?.({
      total: pending.length,
      processed: i,
      currentDescription: item.description,
    });

    try {
      await generateTransactionForItem(item);
      result.generated++;

      const finished = isLastInstallment(item);
      if (finished) {
        await deleteRecurringItem(item.id);
        result.completed++;
      } else {
        await updateRecurringItem(item.id, buildUpdate(item));
      }
    } catch {
      result.errors.push(item.description);
    }
  }

  onProgress?.({
    total: pending.length,
    processed: pending.length,
    currentDescription: 'Concluído',
  });

  return result;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function generateTransactionForItem(item: RecurringItem): Promise<void> {
  if (item.isCreditCard) {
    const config = await getCreditCardConfig();
    const today = new Date().toISOString().substring(0, 10);
    const invoiceMonth = config
      ? getInvoiceMonth(today, config.closingDay)
      : today.substring(0, 7);
    const installmentCurrent = nextInstallmentNumber(item);

    await createCreditCardExpense({
      amount: item.amount,
      description: item.description,
      categoryId: item.categoryId,
      date: today,
      installmentTotal: item.installmentTotal ?? 1,
      installmentCurrent,
      invoiceMonth,
    });
    return;
  }

  const isInstallment = item.installmentTotal != null && item.installmentTotal > 1;

  await createTransaction({
    type: item.type,
    amount: item.amount,
    date: buildTransactionDate(item),
    categoryId: item.categoryId,
    description: item.description,
    isRecurring: !isInstallment,
    recurringId: item.id,
    ...(isInstallment && {
      installmentTotal: item.installmentTotal,
      installmentCurrent: nextInstallmentNumber(item),
    }),
  });
}

/** Builds the Firestore update payload after a successful generation. */
function buildUpdate(item: RecurringItem): Partial<Omit<RecurringItem, 'id'>> {
  const now = new Date().toISOString();

  if (item.installmentCurrent != null) {
    return {
      lastGeneratedAt: now,
      installmentCurrent: item.installmentCurrent + 1,
    };
  }

  return { lastGeneratedAt: now };
}
