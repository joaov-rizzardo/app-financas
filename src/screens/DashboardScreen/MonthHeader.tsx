import * as React from 'react';
import { View, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight, Tags } from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatInvoiceMonth } from '@/lib/utils';

export interface MonthHeaderProps {
  month: string; // YYYY-MM
  onPrev: () => void;
  onNext: () => void;
  onCategories?: () => void;
}

export function MonthHeader({ month, onPrev, onNext, onCategories }: MonthHeaderProps) {
  const raw = formatInvoiceMonth(month); // "abril 2026"
  const label = raw.charAt(0).toUpperCase() + raw.slice(1); // "Abril 2026"

  return (
    <View className="pt-6 pb-4 gap-3">
      <View className="flex-row items-center justify-between">
        <Text size="xl" weight="bold" className="text-text-primary">
          Início
        </Text>
        <Pressable
          onPress={onCategories}
          hitSlop={8}
          className="w-9 h-9 rounded-xl bg-background-surface border border-border items-center justify-center active:opacity-60"
        >
          <Tags size={18} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={onPrev}
          hitSlop={8}
          className="w-9 h-9 rounded-xl bg-background-surface border border-border items-center justify-center active:opacity-60"
        >
          <ChevronLeft size={18} color={colors.text.secondary} strokeWidth={2} />
        </Pressable>

        <View className="items-center">
          <Label>Resumo mensal</Label>
          <Text size="lg" weight="bold" className="mt-0.5">
            {label}
          </Text>
        </View>

        <Pressable
          onPress={onNext}
          hitSlop={8}
          className="w-9 h-9 rounded-xl bg-background-surface border border-border items-center justify-center active:opacity-60"
        >
          <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}
