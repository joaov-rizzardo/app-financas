import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listRecurringItems,
  createRecurringItem,
  updateRecurringItem,
  deleteRecurringItem,
} from '@/services/recurringItems';
import type { RecurringItem, TransactionType } from '@/types/finance';

export const RECURRING_ITEMS_QUERY_KEY = ['recurringItems'] as const;

export function useRecurringItems(type?: TransactionType) {
  const queryClient = useQueryClient();

  const { data: recurringItems = [], isLoading, error } = useQuery({
    queryKey: [...RECURRING_ITEMS_QUERY_KEY, type ?? 'all'],
    queryFn: () => listRecurringItems(type),
  });

  const createMutation = useMutation({
    mutationFn: createRecurringItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_ITEMS_QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<RecurringItem, 'id'>> }) =>
      updateRecurringItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_ITEMS_QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteRecurringItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_ITEMS_QUERY_KEY }),
  });

  return {
    recurringItems,
    isLoading,
    error: error ? 'Erro ao carregar itens recorrentes' : null,
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<Omit<RecurringItem, 'id'>>) =>
      updateMutation.mutateAsync({ id, data }),
    remove: removeMutation.mutateAsync,
  };
}
