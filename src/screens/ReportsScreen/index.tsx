import * as React from 'react';
import { useState, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReports } from '@/hooks/useReports';
import { PeriodSelector } from './PeriodSelector';
import { SummarySection } from './SummarySection';
import { DonutChartCard } from './DonutChartCard';
import { BarChartCard } from './BarChartCard';
import { LineChartCard } from './LineChartCard';
import { HighlightCard } from './HighlightCard';
import type { PeriodMode } from './PeriodSelector';
import type { PeriodRange } from '@/hooks/useReports';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
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

  const period = useMemo(() => buildPeriod(mode, selectedMonth), [mode, selectedMonth]);

  const { summary, categoryBreakdown, monthlyStats, highlights, isLoading } = useReports(period);

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

        <DonutChartCard data={categoryBreakdown} isLoading={isLoading} />

        <BarChartCard data={monthlyStats} isLoading={isLoading} />

        <LineChartCard data={monthlyStats} isLoading={isLoading} />

        <HighlightCard highlights={highlights} />

        <View className="h-2" />
      </ScrollView>
    </SafeAreaView>
  );
}
