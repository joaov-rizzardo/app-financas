import * as React from 'react';
import { View } from 'react-native';
import { Flame, TrendingUp } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrency, formatInvoiceMonth } from '@/lib/utils';
import type { Highlights } from '@/hooks/useReports';

export interface HighlightCardProps {
  highlights: Highlights;
}

function formatMonthLabel(month: string): string {
  const raw = formatInvoiceMonth(month);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function HighlightCard({ highlights }: HighlightCardProps) {
  const { mostExpensive, mostSaved } = highlights;

  if (!mostExpensive && !mostSaved) return null;

  return (
    <Card className="mb-4">
      <Label className="mb-3">Destaques (últimos 6 meses)</Label>

      <View className="flex-row gap-3">
        {mostExpensive && (
          <View className="flex-1 bg-danger/10 rounded-xl p-3 border border-danger/20">
            <View className="flex-row items-center gap-1.5 mb-2">
              <Flame size={14} color={colors.danger} />
              <Text size="xs" weight="semibold" className="text-danger">Mais gasto</Text>
            </View>
            <Text size="sm" weight="bold" className="text-text-primary mb-0.5">
              {formatMonthLabel(mostExpensive.month)}
            </Text>
            <Text size="xs" variant="muted">
              {formatCurrency(mostExpensive.expense)}
            </Text>
          </View>
        )}

        {mostSaved && (
          <View className="flex-1 bg-success/10 rounded-xl p-3 border border-success/20">
            <View className="flex-row items-center gap-1.5 mb-2">
              <TrendingUp size={14} color={colors.success} />
              <Text size="xs" weight="semibold" className="text-success">Mais economizou</Text>
            </View>
            <Text size="sm" weight="bold" className="text-text-primary mb-0.5">
              {formatMonthLabel(mostSaved.month)}
            </Text>
            <Text size="xs" variant="muted">
              saldo {formatCurrency(mostSaved.balance)}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
