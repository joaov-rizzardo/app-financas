import * as React from 'react';
import { View } from 'react-native';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrencyCompact } from '@/lib/utils';
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
        <View
          className="flex-1 rounded-2xl p-4 border"
          style={{ backgroundColor: colors.success + '1a', borderColor: colors.success + '45' }}
        >
          <View
            className="w-8 h-8 rounded-xl items-center justify-center mb-2"
            style={{ backgroundColor: colors.success + '28' }}
          >
            <TrendingUp size={15} color={colors.success} />
          </View>
          <Label className="mb-1" style={{ color: colors.success + 'cc' }}>Receitas</Label>
          <Text size="xl" weight="bold" className="text-success">
            {formatCurrencyCompact(income)}
          </Text>
        </View>

        {/* Despesas */}
        <View
          className="flex-1 rounded-2xl p-4 border"
          style={{ backgroundColor: colors.danger + '1a', borderColor: colors.danger + '45' }}
        >
          <View
            className="w-8 h-8 rounded-xl items-center justify-center mb-2"
            style={{ backgroundColor: colors.danger + '28' }}
          >
            <TrendingDown size={15} color={colors.danger} />
          </View>
          <Label className="mb-1" style={{ color: colors.danger + 'cc' }}>Despesas</Label>
          <Text size="xl" weight="bold" className="text-danger">
            {formatCurrencyCompact(expense)}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        {/* Saldo */}
        <View
          className="flex-1 rounded-2xl p-4 border"
          style={{
            backgroundColor: colors.primary.DEFAULT + '1a',
            borderColor: colors.primary.DEFAULT + '45',
          }}
        >
          <View
            className="w-8 h-8 rounded-xl items-center justify-center mb-2"
            style={{ backgroundColor: colors.primary.DEFAULT + '28' }}
          >
            <Wallet size={15} color={colors.primary[400]} />
          </View>
          <Label className="mb-1" style={{ color: colors.primary[400] + 'cc' }}>Saldo</Label>
          <Text size="xl" weight="bold" className="text-primary-400">
            {!balancePositive ? '− ' : ''}{formatCurrencyCompact(Math.abs(balance))}
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
