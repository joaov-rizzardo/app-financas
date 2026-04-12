import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCreditCardExpenses,
  createCreditCardExpense,
  updateCreditCardExpense,
  deleteCreditCardExpense,
} from '@/services/creditCardExpenses';
import { createRecurringCardItem } from '@/services/recurringCardItems';
import { RECURRING_CARD_ITEMS_QUERY_KEY } from './useRecurringCardItems';
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
  installmentTotal?: number; // obrigatório quando expenseType === 'installment'
  closingDay: number; // necessário para calcular invoiceMonth
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
      const now = new Date().toISOString();
      const invoiceMonthComputed = getInvoiceMonth(input.date, input.closingDay);

      if (input.expenseType === 'subscription') {
        // Registra a assinatura para gerar nas próximas faturas
        await createRecurringCardItem({
          type: 'subscription',
          amount: input.amount,
          categoryId: input.categoryId,
          description: input.description,
          startInvoiceMonth: invoiceMonthComputed,
          lastGeneratedInvoiceMonth: invoiceMonthComputed,
          createdAt: now,
        });
        // Cria o gasto da fatura atual imediatamente
        await createCreditCardExpense({
          amount: input.amount,
          description: input.description,
          categoryId: input.categoryId,
          date: input.date,
          installmentTotal: 1,
          installmentCurrent: 1,
          invoiceMonth: invoiceMonthComputed,
        });
        return;
      }

      if (input.expenseType === 'installment' && (input.installmentTotal ?? 0) > 1) {
        // amount stored per installment (total / n) — e.g. R$500 in 5x → R$100/month
        const perInstallment = input.amount / input.installmentTotal!;

        // Cria o RecurringCardItem para gerar as parcelas seguintes
        await createRecurringCardItem({
          type: 'installment',
          amount: perInstallment,
          categoryId: input.categoryId,
          description: input.description,
          startInvoiceMonth: invoiceMonthComputed,
          lastGeneratedInvoiceMonth: invoiceMonthComputed,
          installmentTotal: input.installmentTotal,
          installmentCurrent: 1,
          createdAt: now,
        });

        // Cria a primeira parcela imediatamente na fatura correta
        await createCreditCardExpense({
          amount: perInstallment,
          description: input.description,
          categoryId: input.categoryId,
          date: input.date,
          installmentTotal: input.installmentTotal!,
          installmentCurrent: 1,
          invoiceMonth: invoiceMonthComputed,
        });
        return;
      }

      // Compra à vista
      await createCreditCardExpense({
        amount: input.amount,
        description: input.description,
        categoryId: input.categoryId,
        date: input.date,
        installmentTotal: 1,
        installmentCurrent: 1,
        invoiceMonth: invoiceMonthComputed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDIT_CARD_EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RECURRING_CARD_ITEMS_QUERY_KEY });
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
