import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/services/transactions';
import { RECURRING_ITEMS_QUERY_KEY, useRecurringItems } from './useRecurringItems';
import type { Transaction, Frequency } from '@/types/finance';

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const;

export function useTransactions(month?: string) {

  const recurringItems = useRecurringItems()
  // month: 'YYYY-MM'
  const queryClient = useQueryClient();

  const from = month ? `${month}-01` : undefined;
  const to   = month ? `${month}-31` : undefined;

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, month ?? 'all'],
    queryFn: () => listTransactions(from && to ? { from, to } : undefined),
  });

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      frequency,
    }: {
      data: Omit<Transaction, 'id' | 'createdAt'>;
      frequency?: Frequency;
    }) => {
      let recurringId: string | undefined;

      if (data.isRecurring && frequency) {
        recurringId = await recurringItems.create({
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          description: data.description,
          frequency,
          startDate: data.date,
          lastGeneratedAt: new Date().toISOString(),
        });
      } else if (data.installmentTotal && data.installmentTotal > 1) {
        recurringId = await recurringItems.create({
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          description: data.description,
          frequency: 'monthly',
          startDate: data.date,
          lastGeneratedAt: new Date().toISOString(),
          installmentTotal: data.installmentTotal,
          installmentCurrent: 1,
        });
      }

      return createTransaction(recurringId ? { ...data, recurringId } : data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RECURRING_ITEMS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Transaction, 'id' | 'createdAt'>> }) =>
      updateTransaction(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY }),
  });

  return {
    transactions,
    isLoading,
    error: error ? 'Erro ao carregar lançamentos' : null,
    create: (data: Omit<Transaction, 'id' | 'createdAt'>, frequency?: Frequency) =>
      createMutation.mutateAsync({ data, frequency }),
    update: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) =>
      updateMutation.mutateAsync({ id, data }),
    remove: removeMutation.mutateAsync,
  };
}
