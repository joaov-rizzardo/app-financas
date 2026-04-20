import * as React from 'react';
import { View } from 'react-native';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrencyCompact, formatCurrency } from '@/lib/utils';
import type { PeriodSummary } from '@/hooks/useReports';

export interface SummarySectionProps {
  summary: PeriodSummary;
  isLoading: boolean;
}

function SkeletonBox({ className }: { className?: string }) {
  return <View className={`bg-background-surface rounded-xl opacity-40 ${className}`} />;
}

export function SummarySection({ summary, isLoading }: SummarySectionProps) {
  if (isLoading) {
    return (
      <View className="mb-4">
        <View className="flex-row gap-3 mb-3">
          <SkeletonBox className="flex-1 h-24" />
          <SkeletonBox className="flex-1 h-24" />
        </View>
        <View className="flex-row gap-3 mb-3">
          <SkeletonBox className="flex-1 h-24" />
          <SkeletonBox className="flex-1 h-24" />
        </View>
      </View>
    );
  }

  const { income, expense, balance, savingsRate } = summary;
  const balancePositive = balance >= 0;

  return (
    <View className="mb-4">
      <View className="flex-row gap-3 mb-3">
        {/* Receitas */}
        <View className="flex-1 bg-success/10 rounded-2xl p-4 border border-success/20">
          <View className="w-8 h-8 rounded-xl bg-success/20 items-center justify-center mb-2">
            <TrendingUp size={15} color={colors.success} />
          </View>
          <Label className="text-success mb-1">Receitas</Label>
          <Text size="xl" weight="bold" className="text-success">
            {formatCurrencyCompact(income)}
          </Text>
        </View>

        {/* Despesas */}
        <View className="flex-1 bg-danger/10 rounded-2xl p-4 border border-danger/20">
          <View className="w-8 h-8 rounded-xl bg-danger/20 items-center justify-center mb-2">
            <TrendingDown size={15} color={colors.danger} />
          </View>
          <Label className="text-danger mb-1">Despesas</Label>
          <Text size="xl" weight="bold" className="text-danger">
            {formatCurrencyCompact(expense)}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        {/* Saldo */}
        <View
          className={`flex-1 rounded-2xl p-4 border ${
            balancePositive
              ? 'bg-background-elevated border-border'
              : 'bg-danger/10 border-danger/20'
          }`}
        >
          <View
            className={`w-8 h-8 rounded-xl items-center justify-center mb-2 ${
              balancePositive ? 'bg-primary/15' : 'bg-danger/20'
            }`}
          >
            <Wallet size={15} color={balancePositive ? colors.primary.DEFAULT : colors.danger} />
          </View>
          <Label className={balancePositive ? 'text-text-muted mb-1' : 'text-danger mb-1'}>Saldo</Label>
          <Text
            size="xl"
            weight="bold"
            className={balancePositive ? 'text-primary-400' : 'text-danger'}
          >
            {formatCurrencyCompact(Math.abs(balance))}
          </Text>
        </View>

        {/* Taxa de poupança */}
        <Card variant="elevated" className="flex-1 p-4">
          <View className="w-8 h-8 rounded-xl bg-accent/15 items-center justify-center mb-2">
            <PiggyBank size={15} color={colors.accent.DEFAULT} />
          </View>
          <Label className="mb-1">Poupança</Label>
          <Text size="xl" weight="bold" className="text-accent">
            {savingsRate}%
          </Text>
          <View className="h-1 bg-background-card rounded-full overflow-hidden mt-2">
            <View
              style={{
                width: `${Math.min(savingsRate, 100)}%`,
                height: '100%',
                backgroundColor: colors.accent.DEFAULT,
                borderRadius: 999,
              }}
            />
          </View>
        </Card>
      </View>
    </View>
  );
}
