import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { listTransactions } from '@/services/transactions';
import { useCategories } from './useCategories';
import { colors } from '@/constants/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PeriodRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

export interface PeriodSummary {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number; // 0–100
}

export interface CategoryStat {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  pct: number;
}

export interface MonthStat {
  month: string;   // YYYY-MM
  label: string;   // short label, e.g. "Abr"
  income: number;
  expense: number;
  balance: number;
}

export interface Highlights {
  mostExpensive: MonthStat | null;
  mostSaved: MonthStat | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SHORT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getLast6Months(): { from: string; to: string; months: string[] } {
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return {
    from: `${months[0]}-01`,
    to: `${months[months.length - 1]}-31`,
    months,
  };
}

const FALLBACK_COLORS = [
  colors.primary.DEFAULT,
  colors.accent.DEFAULT,
  colors.success,
  colors.warning,
  colors.danger,
  colors.info,
  colors.text.muted,
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReports(period: PeriodRange) {
  const { categories } = useCategories();

  const { from: from6m, to: to6m, months: months6m } = useMemo(getLast6Months, []);

  const { data: periodTx = [], isLoading: loadingPeriod } = useQuery({
    queryKey: ['reports', 'period', period.from, period.to],
    queryFn: () => listTransactions({ from: period.from, to: period.to }),
  });

  const { data: trendTx = [], isLoading: loadingTrend } = useQuery({
    queryKey: ['reports', 'trend6m', from6m, to6m],
    queryFn: () => listTransactions({ from: from6m, to: to6m }),
  });

  // ── Summary for selected period ───────────────────────────────────────────
  const summary = useMemo((): PeriodSummary => {
    let income = 0;
    let expense = 0;
    for (const tx of periodTx) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }
    const balance = income - expense;
    const savingsRate = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;
    return { income, expense, balance, savingsRate };
  }, [periodTx]);

  // ── Category breakdown for selected period ────────────────────────────────
  const categoryBreakdown = useMemo((): CategoryStat[] => {
    const map: Record<string, number> = {};
    for (const tx of periodTx) {
      if (tx.type === 'expense') {
        map[tx.categoryId] = (map[tx.categoryId] ?? 0) + tx.amount;
      }
    }
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .map(([categoryId, amount], idx) => {
        const cat = categories.find((c) => c.id === categoryId);
        return {
          categoryId,
          name: cat?.name ?? 'Outros',
          color: cat?.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
          amount,
          pct: total > 0 ? Math.round((amount / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [periodTx, categories]);

  // ── 6-month trend ─────────────────────────────────────────────────────────
  const monthlyStats = useMemo((): MonthStat[] => {
    return months6m.map((month) => {
      const txs = trendTx.filter((tx) => tx.date.startsWith(month));
      let income = 0, expense = 0;
      for (const tx of txs) {
        if (tx.type === 'income') income += tx.amount;
        else expense += tx.amount;
      }
      const [, monthStr] = month.split('-');
      return {
        month,
        label: SHORT_MONTHS[parseInt(monthStr, 10) - 1],
        income,
        expense,
        balance: income - expense,
      };
    });
  }, [trendTx, months6m]);

  // ── Highlights ────────────────────────────────────────────────────────────
  const highlights = useMemo((): Highlights => {
    const withData = monthlyStats.filter((m) => m.income > 0 || m.expense > 0);
    if (withData.length === 0) return { mostExpensive: null, mostSaved: null };

    const mostExpensive = withData.reduce((a, b) => (a.expense > b.expense ? a : b));
    const mostSaved = withData.reduce((a, b) => (a.balance > b.balance ? a : b));

    return { mostExpensive, mostSaved };
  }, [monthlyStats]);

  return {
    summary,
    categoryBreakdown,
    monthlyStats,
    highlights,
    isLoading: loadingPeriod || loadingTrend,
  };
}
