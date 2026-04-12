import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listRecurringCardItems,
  createRecurringCardItem,
  updateRecurringCardItem,
  deleteRecurringCardItem,
} from '@/services/recurringCardItems';
import type { RecurringCardItem, RecurringCardType } from '@/types/finance';

export const RECURRING_CARD_ITEMS_QUERY_KEY = ['recurringCardItems'] as const;

export function useRecurringCardItems(type?: RecurringCardType) {
  const queryClient = useQueryClient();

  const queryKey = type
    ? [...RECURRING_CARD_ITEMS_QUERY_KEY, type]
    : RECURRING_CARD_ITEMS_QUERY_KEY;

  const { data: items = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => listRecurringCardItems(type),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<RecurringCardItem, 'id'>) => createRecurringCardItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_CARD_ITEMS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<RecurringCardItem, 'id'>> }) =>
      updateRecurringCardItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_CARD_ITEMS_QUERY_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteRecurringCardItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_CARD_ITEMS_QUERY_KEY });
    },
  });

  return {
    items,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}
