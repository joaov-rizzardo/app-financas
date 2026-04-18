import * as React from 'react';
import { View, Pressable } from 'react-native';
import { PieChart, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { toPercent } from '@/lib/utils';

export interface BudgetSummaryCardProps {
  totalBudgets: number;
  onTrack: number;
  overBudget: number;
  isLoading: boolean;
  onPress: () => void;
}

export function BudgetSummaryCard({
  totalBudgets,
  onTrack,
  overBudget,
  isLoading,
  onPress,
}: BudgetSummaryCardProps) {
  if (isLoading) {
    return (
      <View className="h-16 bg-background-surface rounded-2xl border border-border opacity-40 mb-3" />
    );
  }

  if (totalBudgets === 0) return null;

  const onTrackPct = toPercent(onTrack, totalBudgets);
  const barColor = overBudget > 0 ? colors.danger : colors.success;

  return (
    <Pressable onPress={onPress} className="active:opacity-75 mb-3">
      <Card>
        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
            <PieChart size={16} color={colors.primary[400]} strokeWidth={1.75} />
          </View>

          <View className="flex-1">
            <Label className="mb-1.5">Orçamentos do mês</Label>
            <View className="flex-row">
              <View className="flex-row items-center gap-1 flex-1">
                <CheckCircle2 size={12} color={colors.success} strokeWidth={2.5} />
                <Text size="xs" variant="secondary">
                  {onTrack} no limite
                </Text>
              </View>
              {overBudget > 0 && (
                <View className="flex-row items-center gap-1 flex-1">
                  <AlertCircle size={12} color={colors.danger} strokeWidth={2.5} />
                  <Text size="xs" className="text-danger">
                    {overBudget} {overBudget === 1 ? 'estouro' : 'estouros'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <ChevronRight size={16} color={colors.text.muted} strokeWidth={2} />
        </View>

        {/* Barra de progresso proporcional */}
        <View className="mt-3 h-1.5 bg-background-card rounded-full overflow-hidden">
          <View
            style={{
              width: `${onTrackPct}%`,
              height: '100%',
              backgroundColor: barColor,
              borderRadius: 999,
            }}
          />
        </View>
      </Card>
    </Pressable>
  );
}
