import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addGoalContribution,
} from '@/services/goals';
import type { Goal } from '@/types/finance';

export const GOALS_QUERY_KEY = ['goals'] as const;

export function useGoals() {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: listGoals,
  });

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Goal, 'id' | 'createdAt'>> }) =>
      updateGoal(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  });

  const contributionMutation = useMutation({
    mutationFn: ({ goalId, amount }: { goalId: string; amount: number }) =>
      addGoalContribution(goalId, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  });

  return {
    goals,
    isLoading,
    error: error ? 'Erro ao carregar metas' : null,
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<Omit<Goal, 'id' | 'createdAt'>>) =>
      updateMutation.mutateAsync({ id, data }),
    remove: removeMutation.mutateAsync,
    addContribution: (goalId: string, amount: number) =>
      contributionMutation.mutateAsync({ goalId, amount }),
    isSaving: createMutation.isPending || updateMutation.isPending,
    isAddingContribution: contributionMutation.isPending,
  };
}
