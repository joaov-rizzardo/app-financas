import * as React from 'react';
import { View } from 'react-native';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrency } from '@/lib/utils';

interface SummaryBarProps {
  income: number;
  expense: number;
}

export function SummaryBar({ income, expense }: SummaryBarProps) {
  const net = income - expense;
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
      <View style={{
        flex: 1, backgroundColor: colors.success + '15', borderRadius: 16,
        padding: 12, borderWidth: 1, borderColor: colors.success + '25',
      }}>
        <Label style={{ color: colors.success, marginBottom: 4 }}>Receitas</Label>
        <Text size="sm" weight="bold" style={{ color: colors.success }}>
          +{formatCurrency(income)}
        </Text>
      </View>
      <View style={{
        flex: 1, backgroundColor: colors.danger + '15', borderRadius: 16,
        padding: 12, borderWidth: 1, borderColor: colors.danger + '25',
      }}>
        <Label style={{ color: colors.danger, marginBottom: 4 }}>Despesas</Label>
        <Text size="sm" weight="bold" style={{ color: colors.danger }}>
          -{formatCurrency(expense)}
        </Text>
      </View>
      <View style={{
        flex: 1, backgroundColor: colors.primary.DEFAULT + '15', borderRadius: 16,
        padding: 12, borderWidth: 1, borderColor: colors.primary.DEFAULT + '25',
      }}>
        <Label style={{ color: colors.primary[400], marginBottom: 4 }}>Saldo</Label>
        <Text size="sm" weight="bold" style={{ color: net >= 0 ? colors.success : colors.danger }}>
          {net >= 0 ? '+' : ''}{formatCurrency(net)}
        </Text>
      </View>
    </View>
  );
}
