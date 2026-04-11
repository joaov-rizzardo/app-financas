import { useState, useEffect, useCallback } from 'react';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
} from '@/services/categories';
import type { Category, TransactionType } from '@/types/finance';

export function useCategories(type?: TransactionType) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await seedDefaultCategories();
      const data = await listCategories(type);
      setCategories(data);
    } catch {
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async (data: Omit<Category, 'id'>): Promise<Category> => {
      const cat = await createCategory(data);
      setCategories((prev) =>
        type === undefined || cat.type === type ? [...prev, cat] : prev,
      );
      return cat;
    },
    [type],
  );

  const update = useCallback(
    async (id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> => {
      await updateCategory(id, data);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      );
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { categories, loading, error, refetch, create, update, remove };
}
