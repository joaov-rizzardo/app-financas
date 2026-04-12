import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCreditCardExpenses,
  createCreditCardExpense,
  updateCreditCardExpense,
  deleteCreditCardExpense,
} from '@/services/creditCardExpenses';
import { createRecurringItem } from '@/services/recurringItems';
import type { CreditCardExpense } from '@/types/finance';
import { getInvoiceMonth } from '@/lib/utils';

export const CREDIT_CARD_EXPENSES_QUERY_KEY = ['creditCardExpenses'] as const;

export type ExpenseType = 'single' | 'installment' | 'subscription';

export interface CreateExpenseInput {
  amount: number;
  description: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  expenseType: ExpenseType;
  installmentTotal?: number; // required when expenseType === 'installment'
  closingDay: number; // needed to compute invoiceMonth
}

export function useCreditCardExpenses(invoiceMonth?: string) {
  const queryClient = useQueryClient();

  const queryKey = invoiceMonth
    ? [...CREDIT_CARD_EXPENSES_QUERY_KEY, invoiceMonth]
    : CREDIT_CARD_EXPENSES_QUERY_KEY;

  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => listCreditCardExpenses(invoiceMonth),
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const today = new Date().toISOString().substring(0, 10);

      if (input.expenseType === 'subscription') {
        // Monthly recurring subscription on the credit card
        await createRecurringItem({
          type: 'expense',
          amount: input.amount,
          categoryId: input.categoryId,
          description: input.description,
          frequency: 'monthly',
          startDate: today,
          lastGeneratedAt: new Date().toISOString(),
          isCreditCard: true,
        });
        return;
      }

      if (input.expenseType === 'installment' && (input.installmentTotal ?? 0) > 1) {
        // Create a RecurringItem so the processor generates one expense per invoice month
        await createRecurringItem({
          type: 'expense',
          amount: input.amount,
          categoryId: input.categoryId,
          description: input.description,
          frequency: 'monthly',
          startDate: today,
          lastGeneratedAt: new Date().toISOString(),
          installmentTotal: input.installmentTotal,
          installmentCurrent: 1,
          isCreditCard: true,
        });

        // Also create the first installment immediately for the current invoice
        const computed = getInvoiceMonth(input.date, input.closingDay);
        await createCreditCardExpense({
          amount: input.amount,
          description: input.description,
          categoryId: input.categoryId,
          date: input.date,
          installmentTotal: input.installmentTotal!,
          installmentCurrent: 1,
          invoiceMonth: computed,
        });
        return;
      }

      // Single one-time purchase
      const computed = getInvoiceMonth(input.date, input.closingDay);
      await createCreditCardExpense({
        amount: input.amount,
        description: input.description,
        categoryId: input.categoryId,
        date: input.date,
        installmentTotal: 1,
        installmentCurrent: 1,
        invoiceMonth: computed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDIT_CARD_EXPENSES_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<CreditCardExpense, 'id'>> }) =>
      updateCreditCardExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDIT_CARD_EXPENSES_QUERY_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteCreditCardExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDIT_CARD_EXPENSES_QUERY_KEY });
    },
  });

  return {
    expenses,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}
