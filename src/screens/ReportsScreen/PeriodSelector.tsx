import * as React from 'react';
import { View, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatInvoiceMonth, shiftInvoiceMonth } from '@/lib/utils';

export type PeriodMode = 'month' | '3m' | '6m' | '12m';

export interface PeriodSelectorProps {
  mode: PeriodMode;
  selectedMonth: string; // YYYY-MM — used when mode === 'month'
  onModeChange: (mode: PeriodMode) => void;
  onMonthChange: (month: string) => void;
}

const MODES: { key: PeriodMode; label: string }[] = [
  { key: 'month', label: 'Mês' },
  { key: '3m', label: '3 meses' },
  { key: '6m', label: '6 meses' },
  { key: '12m', label: '12 meses' },
];

export function PeriodSelector({ mode, selectedMonth, onModeChange, onMonthChange }: PeriodSelectorProps) {
  const monthLabel = (() => {
    const raw = formatInvoiceMonth(selectedMonth);
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  return (
    <View className="pt-6 pb-4">
      <Label className="mb-3">Período de análise</Label>

      {/* Mode tabs */}
      <View className="flex-row bg-background-surface border border-border rounded-2xl p-1 mb-4">
        {MODES.map(({ key, label }) => {
          const active = mode === key;
          return (
            <Pressable
              key={key}
              onPress={() => onModeChange(key)}
              className={`flex-1 py-2 rounded-xl items-center ${active ? 'bg-primary' : ''}`}
            >
              <Text
                size="xs"
                weight={active ? 'semibold' : 'normal'}
                className={active ? 'text-white' : 'text-text-secondary'}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Month navigator — only visible in 'month' mode */}
      {mode === 'month' && (
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => onMonthChange(shiftInvoiceMonth(selectedMonth, -1))}
            hitSlop={8}
            className="w-9 h-9 rounded-xl bg-background-surface border border-border items-center justify-center active:opacity-60"
          >
            <ChevronLeft size={18} color={colors.text.secondary} strokeWidth={2} />
          </Pressable>

          <Text size="lg" weight="bold">{monthLabel}</Text>

          <Pressable
            onPress={() => onMonthChange(shiftInvoiceMonth(selectedMonth, 1))}
            hitSlop={8}
            className="w-9 h-9 rounded-xl bg-background-surface border border-border items-center justify-center active:opacity-60"
          >
            <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2} />
          </Pressable>
        </View>
      )}

      {mode !== 'month' && (
        <View className="items-center">
          <Text size="sm" variant="muted">
            {mode === '3m' ? 'Últimos 3 meses' : mode === '6m' ? 'Últimos 6 meses' : 'Últimos 12 meses'}
          </Text>
        </View>
      )}
    </View>
  );
}
