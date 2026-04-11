import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react-native';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { DotBadge } from '@/components/ui/Badge';
import { colors } from '@/constants/colors';
import { formatCurrency, formatCurrencyCompact, toPercent } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MonthData {
  month: string;
  income: number;
  expense: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  pct: number;
  color: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MONTHLY_DATA: MonthData[] = [
  { month: 'Jan', income: 5800, expense: 3900 },
  { month: 'Fev', income: 5800, expense: 3200 },
  { month: 'Mar', income: 7000, expense: 4100 },
  { month: 'Abr', income: 7000, expense: 3240 },
];

const CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { name: 'Moradia', amount: 1500, pct: 46, color: colors.info },
  { name: 'Alimentação', amount: 680, pct: 21, color: colors.warning },
  { name: 'Lazer', amount: 390, pct: 12, color: colors.danger },
  { name: 'Transporte', amount: 220, pct: 7, color: colors.accent.DEFAULT },
  { name: 'Saúde', amount: 150, pct: 5, color: colors.success },
  { name: 'Outros', amount: 300, pct: 9, color: colors.text.muted },
];

const MAX_BAR = Math.max(...MONTHLY_DATA.flatMap((d) => [d.income, d.expense]));
const BAR_MAX_HEIGHT = 100;

const CURRENT = MONTHLY_DATA[MONTHLY_DATA.length - 1];
const PREVIOUS = MONTHLY_DATA[MONTHLY_DATA.length - 2];
const INCOME_CHANGE = toPercent(CURRENT.income - PREVIOUS.income, PREVIOUS.income);
const EXPENSE_CHANGE = toPercent(CURRENT.expense - PREVIOUS.expense, PREVIOUS.expense);

// ─── Components ───────────────────────────────────────────────────────────────

function KpiRow() {
  return (
    <View className="flex-row gap-3 mb-4">
      <View className="flex-1 bg-success/10 rounded-2xl p-4 border border-success/20">
        <View className="flex-row items-center justify-between mb-2">
          <ArrowUpRight size={16} color={colors.success} />
          <Text size="xs" weight="semibold" className="text-success">
            +{INCOME_CHANGE}%
          </Text>
        </View>
        <Label className="text-success mb-1">Receitas</Label>
        <Text size="xl" weight="bold" className="text-success">
          {formatCurrency(CURRENT.income)}
        </Text>
      </View>

      <View className="flex-1 bg-danger/10 rounded-2xl p-4 border border-danger/20">
        <View className="flex-row items-center justify-between mb-2">
          <ArrowDownRight size={16} color={colors.danger} />
          <Text size="xs" weight="semibold" className="text-danger">
            +{EXPENSE_CHANGE}%
          </Text>
        </View>
        <Label className="text-danger mb-1">Despesas</Label>
        <Text size="xl" weight="bold" className="text-danger">
          {formatCurrency(CURRENT.expense)}
        </Text>
      </View>
    </View>
  );
}

function NetSavingsCard() {
  const net = CURRENT.income - CURRENT.expense;
  const savingsRate = toPercent(net, CURRENT.income);
  return (
    <Card variant="elevated" className="mb-4">
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-8 h-8 rounded-xl bg-primary/15 items-center justify-center">
          <TrendingUp size={15} color={colors.primary.DEFAULT} />
        </View>
        <Text weight="semibold">Poupança líquida</Text>
      </View>
      <Text size="3xl" weight="bold" className="text-primary-400 mb-1">
        {formatCurrency(net)}
      </Text>
      <Text size="sm" variant="muted">
        {savingsRate}% de taxa de poupança este mês
      </Text>
      <View className="h-1.5 bg-background-card rounded-full overflow-hidden mt-3">
        <View
          style={{
            width: `${savingsRate}%`,
            height: '100%',
            backgroundColor: colors.primary.DEFAULT,
            borderRadius: 999,
          }}
        />
      </View>
    </Card>
  );
}

function BarChartCard() {
  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row justify-between items-center">
          <Text weight="semibold">Receitas vs Despesas</Text>
          <View className="flex-row gap-3">
            <DotBadge label="Receitas" color={colors.success} />
            <DotBadge label="Despesas" color={colors.danger} />
          </View>
        </View>
      </CardHeader>
      <CardContent>
        <View className="flex-row items-end gap-1" style={{ height: BAR_MAX_HEIGHT + 24 }}>
          {MONTHLY_DATA.map((d) => {
            const incomeH = Math.round((d.income / MAX_BAR) * BAR_MAX_HEIGHT);
            const expenseH = Math.round((d.expense / MAX_BAR) * BAR_MAX_HEIGHT);
            return (
              <View key={d.month} className="flex-1 items-center">
                <Text size="xs" variant="muted" className="mb-1">
                  {formatCurrencyCompact(d.income)}
                </Text>
                <View className="flex-row gap-1 items-end">
                  <View
                    style={{
                      width: 14,
                      height: incomeH,
                      backgroundColor: colors.success,
                      borderRadius: 4,
                    }}
                  />
                  <View
                    style={{
                      width: 14,
                      height: expenseH,
                      backgroundColor: colors.danger,
                      borderRadius: 4,
                      opacity: 0.8,
                    }}
                  />
                </View>
                <Text size="xs" variant="muted" className="mt-2">
                  {d.month}
                </Text>
              </View>
            );
          })}
        </View>
      </CardContent>
    </Card>
  );
}

function CategoryBreakdownCard() {
  return (
    <Card>
      <CardHeader>
        <View className="flex-row justify-between items-baseline">
          <Text weight="semibold">Despesas por categoria</Text>
          <Text size="xs" variant="muted">Abril 2026</Text>
        </View>
      </CardHeader>
      <CardContent>
        {CATEGORY_BREAKDOWN.map((cat, i) => (
          <View key={cat.name}>
            <View className="py-2.5">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      backgroundColor: cat.color,
                    }}
                  />
                  <Text size="sm" weight="medium">{cat.name}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text size="xs" variant="muted">{cat.pct}%</Text>
                  <Text size="sm" weight="semibold">{formatCurrency(cat.amount)}</Text>
                </View>
              </View>
              <View className="h-1.5 bg-background-card rounded-full overflow-hidden">
                <View
                  style={{
                    width: `${cat.pct}%`,
                    height: '100%',
                    backgroundColor: cat.color,
                    borderRadius: 999,
                    opacity: 0.85,
                  }}
                />
              </View>
            </View>
            {i < CATEGORY_BREAKDOWN.length - 1 && <Separator />}
          </View>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ReportsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-6 pb-5">
          <Label>Últimos 4 meses</Label>
          <Text size="2xl" weight="bold" className="mt-0.5">
            Relatórios
          </Text>
        </View>

        <KpiRow />
        <NetSavingsCard />
        <BarChartCard />
        <CategoryBreakdownCard />
      </ScrollView>
    </SafeAreaView>
  );
}
