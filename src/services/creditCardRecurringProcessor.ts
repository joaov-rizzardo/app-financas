import { listRecurringCardItems, updateRecurringCardItem, deleteRecurringCardItem } from './recurringCardItems';
import { createCreditCardExpense } from './creditCardExpenses';
import type { RecurringCardItem } from '@/types/finance';
import type { ProcessingResult, ProgressCallback } from './recurringProcessor';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the current invoice month as YYYY-MM. */
function currentInvoiceMonth(): string {
  return new Date().toISOString().substring(0, 7);
}

/** True if the item has not yet generated an expense for the current invoice month. */
function needsGeneration(item: RecurringCardItem, invoiceMonth: string): boolean {
  if (!item.lastGeneratedInvoiceMonth) return true;
  return item.lastGeneratedInvoiceMonth < invoiceMonth;
}

/** Returns the installment number that will be generated next. */
function nextInstallmentNumber(item: RecurringCardItem): number {
  return (item.installmentCurrent ?? 0) + 1;
}

/**
 * True if the installment about to be generated is the last one.
 * Only applies to installment-type items — subscriptions recur indefinitely.
 */
function isLastInstallment(item: RecurringCardItem): boolean {
  return (
    item.type === 'installment' &&
    item.installmentTotal != null &&
    nextInstallmentNumber(item) >= item.installmentTotal
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fast pre-check: returns true if any card recurring item needs an expense generated. */
export async function hasPendingCardRecurringItems(): Promise<boolean> {
  const items = await listRecurringCardItems();
  const invoiceMonth = currentInvoiceMonth();
  return items.some((item) => needsGeneration(item, invoiceMonth));
}

/**
 * Generates credit card expenses for all pending recurring card items and
 * updates their state in Firestore. Calls `onProgress` before each item so
 * the UI can reflect what is happening.
 */
export async function processCardRecurringItems(
  onProgress?: ProgressCallback,
): Promise<ProcessingResult> {
  const allItems = await listRecurringCardItems();
  const invoiceMonth = currentInvoiceMonth();
  const pending = allItems.filter((item) => needsGeneration(item, invoiceMonth));

  const result: ProcessingResult = { generated: 0, completed: 0, errors: [] };

  if (pending.length === 0) return result;

  onProgress?.({ total: pending.length, processed: 0, currentDescription: 'Iniciando...' });

  const today = new Date().toISOString().substring(0, 10);

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];

    onProgress?.({
      total: pending.length,
      processed: i,
      currentDescription: item.description,
    });

    try {
      const isInstallment = item.type === 'installment';
      const installmentCurrent = nextInstallmentNumber(item);

      await createCreditCardExpense({
        amount: item.amount,
        description: item.description,
        categoryId: item.categoryId,
        date: today,
        invoiceMonth,
        installmentTotal: isInstallment ? (item.installmentTotal ?? 1) : 1,
        installmentCurrent: isInstallment ? installmentCurrent : 1,
      });

      result.generated++;

      const finished = isLastInstallment(item);
      if (finished) {
        await deleteRecurringCardItem(item.id);
        result.completed++;
      } else {
        await updateRecurringCardItem(item.id, {
          lastGeneratedInvoiceMonth: invoiceMonth,
          ...(isInstallment && { installmentCurrent }),
        });
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
