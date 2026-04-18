import * as React from 'react';
import { useState, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useBudgets } from '@/hooks/useBudgets';
import { useCreditCardConfig } from '@/hooks/useCreditCardConfig';
import { useCreditCardExpenses } from '@/hooks/useCreditCardExpenses';
import { getInvoiceMonth, getInvoiceDueDate, shiftInvoiceMonth } from '@/lib/utils';
import type { TabParamList } from '@/types/navigation';
import { MonthHeader } from './MonthHeader';
import { SummaryCards } from './SummaryCards';
import { SavingsRateCard } from './SavingsRateCard';
import { BudgetSummaryCard } from './BudgetSummaryCard';
import { RecentTransactions } from './RecentTransactions';
import { CreditCardInvoiceCard } from './CreditCardInvoiceCard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { transactions, isLoading: loadingTx } = useTransactions(selectedMonth);
  const { categories, isLoading: loadingCategories } = useCategories();
  const { budgets, isLoading: loadingBudgets } = useBudgets(selectedMonth);
  const { config, isLoading: loadingConfig } = useCreditCardConfig();

  const selectedInvoiceMonth = useMemo(() => {
    if (!config) return selectedMonth;
    // Use the last day of the selected month to get the invoice that closes in that month
    const [year, month] = selectedMonth.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const lastDayStr = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
    return getInvoiceMonth(lastDayStr, config.closingDay);
  }, [config, selectedMonth]);

  const { expenses: cardExpenses, isLoading: loadingCard } =
    useCreditCardExpenses(selectedInvoiceMonth);

  // ── Derived ───────────────────────────────────────────────────────────────
  const { income, expenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const tx of transactions) {
      if (tx.type === 'income') income += tx.amount;
      else expenses += tx.amount;
    }
    return { income, expenses };
  }, [transactions]);

  const balance = income - expenses;

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [transactions],
  );

  const budgetStats = useMemo(() => {
    const spentByCategory: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        spentByCategory[tx.categoryId] =
          (spentByCategory[tx.categoryId] ?? 0) + tx.amount;
      }
    }
    let onTrack = 0;
    let overBudget = 0;
    for (const budget of budgets) {
      const spent = spentByCategory[budget.categoryId] ?? 0;
      if (spent > budget.amount) overBudget++;
      else onTrack++;
    }
    return { totalBudgets: budgets.length, onTrack, overBudget };
  }, [transactions, budgets]);

  const cardInvoiceTotal = useMemo(
    () => cardExpenses.reduce((sum, e) => sum + e.amount, 0),
    [cardExpenses],
  );

  const cardDueDate = useMemo(() => {
    if (!config) return '';
    return getInvoiceDueDate(selectedInvoiceMonth, config.dueDay);
  }, [config, selectedInvoiceMonth]);

  // ── Loading flags ─────────────────────────────────────────────────────────
  const isDataLoading = loadingTx || loadingCategories;
  const isBudgetLoading = isDataLoading || loadingBudgets;
  const isCardLoading = loadingConfig || loadingCard;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <MonthHeader
          month={selectedMonth}
          onPrev={() => setSelectedMonth((m) => shiftInvoiceMonth(m, -1))}
          onNext={() => setSelectedMonth((m) => shiftInvoiceMonth(m, 1))}
        />

        <SummaryCards
          income={income}
          expenses={expenses}
          balance={balance}
          isLoading={isDataLoading}
        />

        <SavingsRateCard
          income={income}
          expenses={expenses}
          isLoading={isDataLoading}
        />

        <BudgetSummaryCard
          {...budgetStats}
          isLoading={isBudgetLoading}
          onPress={() => navigation.navigate('Orçamentos')}
        />

        <RecentTransactions
          transactions={recentTransactions}
          categories={categories}
          isLoading={isDataLoading}
          onViewAll={() => navigation.navigate('Lançamentos')}
        />

        {(config || isCardLoading) && (
          <CreditCardInvoiceCard
            total={cardInvoiceTotal}
            dueDate={cardDueDate}
            invoiceMonth={selectedInvoiceMonth}
            isLoading={isCardLoading}
            onPress={() => navigation.navigate('Cartão')}
          />
        )}

        {/* Bottom spacer for last card shadow */}
        <View className="h-2" />
      </ScrollView>
    </SafeAreaView>
  );
}
