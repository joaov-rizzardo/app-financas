import * as React from 'react';
import { View } from 'react-native';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';
import { StatCard, StatRow } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrencyCompact } from '@/lib/utils';

export interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
  isLoading: boolean;
}

function SkeletonCard() {
  return <View className="flex-1 h-[88px] bg-background-surface rounded-2xl border border-border opacity-40" />;
}

export function SummaryCards({ income, expenses, balance, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <StatRow className="mb-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </StatRow>
    );
  }

  const isPositive = balance >= 0;
  const balanceColor = isPositive ? colors.success : colors.danger;
  const balanceClass = isPositive ? 'text-success' : 'text-danger';
  const balanceBg = isPositive ? 'bg-success/10' : 'bg-danger/10';

  return (
    <StatRow className="mb-3">
      {/* Receitas */}
      <StatCard>
        <View className="w-8 h-8 rounded-xl bg-success/10 items-center justify-center mb-2">
          <TrendingUp size={15} color={colors.success} strokeWidth={2} />
        </View>
        <Label className="mb-1">Receitas</Label>
        <Text size="sm" weight="bold" className="text-success">
          {formatCurrencyCompact(income)}
        </Text>
      </StatCard>

      {/* Despesas */}
      <StatCard>
        <View className="w-8 h-8 rounded-xl bg-danger/10 items-center justify-center mb-2">
          <TrendingDown size={15} color={colors.danger} strokeWidth={2} />
        </View>
        <Label className="mb-1">Despesas</Label>
        <Text size="sm" weight="bold" className="text-danger">
          {formatCurrencyCompact(expenses)}
        </Text>
      </StatCard>

      {/* Saldo */}
      <StatCard>
        <View className={`w-8 h-8 rounded-xl items-center justify-center mb-2 ${balanceBg}`}>
          <Wallet size={15} color={balanceColor} strokeWidth={2} />
        </View>
        <Label className="mb-1">Saldo</Label>
        <Text size="sm" weight="bold" className={balanceClass}>
          {formatCurrencyCompact(Math.abs(balance))}
        </Text>
      </StatCard>
    </StatRow>
  );
}
