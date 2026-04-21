import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { listTransactions } from '@/services/transactions';
import { useCategories } from './useCategories';

const SHORT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export interface CategoryMonthPoint {
  month: string;
  label: string;
  amount: number;
}

export interface CategoryLineStat {
  categoryId: string;
  name: string;
  color: string;
  points: CategoryMonthPoint[];
}

function buildMonthRange(count: number): { months: string[]; from: string; to: string } {
  const now = new Date();
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return {
    months,
    from: `${months[0]}-01`,
    to: `${months[months.length - 1]}-31`,
  };
}

export function useCategoryTrend(categoryIds: string[], periodMonths: 3 | 6 | 12) {
  const { categories } = useCategories();

  const { months, from, to } = useMemo(() => buildMonthRange(periodMonths), [periodMonths]);

  // No type filter in Firestore — adding type == X alongside date range + orderBy(date)
  // requires a composite index. Filter by expense in JS instead (same pattern as useReports).
  const { data: allTransactions = [], isLoading, isError } = useQuery({
    queryKey: ['categoryTrend', from, to],
    queryFn: () => listTransactions({ from, to }),
    placeholderData: keepPreviousData,
  });

  const transactions = useMemo(
    () => allTransactions.filter((tx) => tx.type === 'expense'),
    [allTransactions],
  );

  const lines = useMemo((): CategoryLineStat[] => {
    return categoryIds.map((catId) => {
      const cat = categories.find((c) => c.id === catId);
      const points = months.map((month) => {
        const [, monthStr] = month.split('-');
        const amount = transactions
          .filter((tx) => tx.categoryId === catId && tx.date.startsWith(month))
          .reduce((sum, tx) => sum + tx.amount, 0);
        return {
          month,
          label: SHORT_MONTHS[parseInt(monthStr, 10) - 1],
          amount,
        };
      });
      return {
        categoryId: catId,
        name: cat?.name ?? 'Desconhecida',
        color: cat?.color ?? '#7c3aed',
        points,
      };
    });
  }, [categoryIds, months, transactions, categories]);

  const monthLabels = useMemo(() => {
    return months.map((month) => {
      const [, monthStr] = month.split('-');
      return { month, label: SHORT_MONTHS[parseInt(monthStr, 10) - 1] };
    });
  }, [months]);

  return { lines, monthLabels, isLoading, isError };
}
