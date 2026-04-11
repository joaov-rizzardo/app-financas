import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
} from '@/services/categories';
import type { Category, TransactionType } from '@/types/finance';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export function useCategories(type?: TransactionType) {
  const queryClient = useQueryClient();

  const { data: allCategories = [], isLoading, error } = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      await seedDefaultCategories();
      const result = await listCategories();
      return result;
    },
  });

  if (error) {
    console.error('[useCategories] query error:', error);
  }

  const categories = type
    ? allCategories.filter((c) => c.type === type)
    : allCategories;

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Category, 'id'>> }) =>
      updateCategory(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });

  return {
    categories,
    isLoading,
    error: error ? 'Erro ao carregar categorias' : null,
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<Omit<Category, 'id'>>) =>
      updateMutation.mutateAsync({ id, data }),
    remove: removeMutation.mutateAsync,
  };
}
