import * as React from 'react';
import { View } from 'react-native';
import { PiggyBank } from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrency, toPercent } from '@/lib/utils';

export interface SavingsRateCardProps {
  income: number;
  expenses: number;
  isLoading: boolean;
}

export function SavingsRateCard({ income, expenses, isLoading }: SavingsRateCardProps) {
  if (isLoading) {
    return (
      <View className="h-[84px] bg-background-surface rounded-2xl border border-border opacity-40 mb-3" />
    );
  }

  const saved = income - expenses;
  const rate = income > 0 ? toPercent(Math.max(saved, 0), income) : 0;

  const rateColor =
    rate >= 20 ? colors.success : rate >= 10 ? colors.warning : colors.danger;
  const rateClass =
    rate >= 20 ? 'text-success' : rate >= 10 ? 'text-warning' : 'text-danger';

  return (
    <View
      className="rounded-2xl p-4 mb-3 border"
      style={{
        backgroundColor: colors.background.elevated,
        borderColor: colors.primary.DEFAULT + '30',
      }}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2.5">
          <View
            className="w-8 h-8 rounded-xl items-center justify-center"
            style={{ backgroundColor: colors.primary.DEFAULT + '20' }}
          >
            <PiggyBank size={15} color={colors.primary[400]} strokeWidth={2} />
          </View>
          <Text size="sm" weight="semibold">
            Taxa de poupança
          </Text>
        </View>
        <Text size="xl" weight="bold" className={rateClass}>
          {rate}%
        </Text>
      </View>

      {/* Progress bar */}
      <View className="h-2 bg-background-card rounded-full overflow-hidden mb-2">
        <View
          style={{
            width: `${rate}%`,
            height: '100%',
            backgroundColor: rateColor,
            borderRadius: 999,
          }}
        />
      </View>

      {/* Footer */}
      <View className="flex-row justify-between">
        <Text size="xs" variant="muted">
          {saved > 0
            ? `Economizado: ${formatCurrency(saved)}`
            : 'Nenhum valor economizado'}
        </Text>
        {income > 0 && (
          <Text size="xs" variant="muted">
            de {formatCurrency(income)}
          </Text>
        )}
      </View>
    </View>
  );
}
