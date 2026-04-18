import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '@/services/budgets';
import type { Budget } from '@/types/finance';

export const BUDGETS_QUERY_KEY = ['budgets'] as const;

export function useBudgets(month?: string) {
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading, error } = useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, month ?? 'all'],
    queryFn: () => listBudgets(month),
  });

  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Budget, 'id'>> }) =>
      updateBudget(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY }),
  });

  return {
    budgets,
    isLoading,
    error: error ? 'Erro ao carregar orçamentos' : null,
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<Omit<Budget, 'id'>>) =>
      updateMutation.mutateAsync({ id, data }),
    remove: removeMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}
