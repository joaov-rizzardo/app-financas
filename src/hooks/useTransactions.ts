import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/services/transactions';
import type { Transaction } from '@/types/finance';

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const;

export function useTransactions(month?: string) {
  // month: 'YYYY-MM'
  const queryClient = useQueryClient();

  const from = month ? `${month}-01` : undefined;
  const to   = month ? `${month}-31` : undefined;

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, month ?? 'all'],
    queryFn: () => listTransactions(from && to ? { from, to } : undefined),
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY }),
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
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) =>
      updateMutation.mutateAsync({ id, data }),
    remove: removeMutation.mutateAsync,
  };
}
