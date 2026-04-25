import * as React from 'react';
import { View } from 'react-native';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';
import { StatCard, StatRow } from '@/components/ui/Card';
import { Label, Text } from '@/components/ui/Text';
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
      <View className="mb-4">
        <View className="h-[106px] bg-background-surface rounded-2xl border border-border opacity-40 mb-3" />
        <StatRow>
          <SkeletonCard />
          <SkeletonCard />
        </StatRow>
      </View>
    );
  }

  const isPositive = balance >= 0;

  return (
    <View className="mb-4">
      {/* Balance — full-width hero card */}
      <View
        className="rounded-2xl px-5 py-4 mb-3"
        style={{
          backgroundColor: colors.primary.DEFAULT + '1a',
          borderWidth: 1,
          borderColor: colors.primary.DEFAULT + '55',
        }}
      >
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-2">
            <View
              className="w-9 h-9 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.primary.DEFAULT + '28' }}
            >
              <Wallet size={17} color={colors.primary[400]} strokeWidth={2} />
            </View>
            <Label style={{ color: colors.primary[400] + 'cc' }}>Saldo</Label>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: (isPositive ? colors.success : colors.danger) + '22' }}
          >
            <Text size="xs" weight="semibold" style={{ color: isPositive ? colors.success : colors.danger }}>
              {isPositive ? '↑ positivo' : '↓ negativo'}
            </Text>
          </View>
        </View>
        <Text
          weight="bold"
          style={{ fontSize: 28, lineHeight: 34, color: colors.primary[400], letterSpacing: -0.5 }}
        >
          {!isPositive ? '− ' : ''}{formatCurrencyCompact(Math.abs(balance))}
        </Text>
      </View>

      {/* Income & Expenses */}
      <StatRow>
        <StatCard
          style={{
            backgroundColor: colors.success + '1a',
            borderColor: colors.success + '45',
          }}
        >
          <View
            className="w-8 h-8 rounded-xl items-center justify-center mb-2"
            style={{ backgroundColor: colors.success + '28' }}
          >
            <TrendingUp size={15} color={colors.success} strokeWidth={2} />
          </View>
          <Label className="mb-1" style={{ color: colors.success + 'cc' }}>Receitas</Label>
          <Text size="sm" weight="bold" className="text-success">
            {formatCurrencyCompact(income)}
          </Text>
        </StatCard>

        <StatCard
          style={{
            backgroundColor: colors.danger + '1a',
            borderColor: colors.danger + '45',
          }}
        >
          <View
            className="w-8 h-8 rounded-xl items-center justify-center mb-2"
            style={{ backgroundColor: colors.danger + '28' }}
          >
            <TrendingDown size={15} color={colors.danger} strokeWidth={2} />
          </View>
          <Label className="mb-1" style={{ color: colors.danger + 'cc' }}>Despesas</Label>
          <Text size="sm" weight="bold" className="text-danger">
            {formatCurrencyCompact(expenses)}
          </Text>
        </StatCard>
      </StatRow>
    </View>
  );
}
