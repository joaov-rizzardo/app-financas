import * as React from 'react';
import { useState, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReports } from '@/hooks/useReports';
import { useCategories } from '@/hooks/useCategories';
import { CategoryTransactionsSheet } from '@/components/ui/CategoryTransactionsSheet';
import { formatInvoiceMonth } from '@/lib/utils';
import { PeriodSelector } from './PeriodSelector';
import { SummarySection } from './SummarySection';
import { DonutChartCard } from './DonutChartCard';
import { LineChartCard } from './LineChartCard';
import { HighlightCard } from './HighlightCard';
import { CategoryComparisonCard } from './CategoryComparisonCard';
import type { PeriodMode } from './PeriodSelector';
import type { PeriodRange } from '@/hooks/useReports';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function buildPeriodLabel(mode: PeriodMode, selectedMonth: string): string {
  if (mode === 'month') {
    const s = formatInvoiceMonth(selectedMonth);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  const labels: Record<string, string> = {
    '3m': 'Últimos 3 meses',
    '6m': 'Últimos 6 meses',
    '12m': 'Último ano',
  };
  return labels[mode] ?? '';
}

function buildPeriod(mode: PeriodMode, selectedMonth: string): PeriodRange {
  const now = new Date();

  if (mode === 'month') {
    return { from: `${selectedMonth}-01`, to: `${selectedMonth}-31` };
  }

  const months = mode === '3m' ? 3 : mode === '6m' ? 6 : 12;
  const from = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const fromStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-01`;
  const toStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;
  return { from: fromStr, to: toStr };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ReportsScreen() {
  const [mode, setMode] = useState<PeriodMode>('month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [viewingCategoryId, setViewingCategoryId] = useState<string | null>(null);

  const period = useMemo(() => buildPeriod(mode, selectedMonth), [mode, selectedMonth]);
  const periodLabel = useMemo(() => buildPeriodLabel(mode, selectedMonth), [mode, selectedMonth]);

  const { summary, categoryBreakdown, monthlyStats, highlights, periodTransactions, isLoading } = useReports(period);
  const { categories } = useCategories();

  const viewingCategory = useMemo(
    () => categories.find((c) => c.id === viewingCategoryId) ?? null,
    [categories, viewingCategoryId],
  );

  const viewingTransactions = useMemo(() => {
    if (!viewingCategoryId) return [];
    return periodTransactions.filter((tx) => tx.categoryId === viewingCategoryId);
  }, [viewingCategoryId, periodTransactions]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <PeriodSelector
          mode={mode}
          selectedMonth={selectedMonth}
          onModeChange={setMode}
          onMonthChange={setSelectedMonth}
        />

        <SummarySection summary={summary} isLoading={isLoading} />

        <DonutChartCard
          data={categoryBreakdown}
          isLoading={isLoading}
          onCategoryPress={setViewingCategoryId}
        />

        <LineChartCard data={monthlyStats} isLoading={isLoading} />

        <CategoryComparisonCard />

        <HighlightCard highlights={highlights} />

        <View className="h-2" />
      </ScrollView>

      <CategoryTransactionsSheet
        visible={viewingCategoryId !== null}
        onClose={() => setViewingCategoryId(null)}
        category={viewingCategory}
        transactions={viewingTransactions}
        periodLabel={periodLabel}
      />
    </SafeAreaView>
  );
}
