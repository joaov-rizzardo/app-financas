import * as React from 'react';
import { View, Pressable } from 'react-native';
import { CreditCard, ChevronRight, CalendarClock } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrency, formatDate, formatInvoiceMonth } from '@/lib/utils';

export interface CreditCardInvoiceCardProps {
  total: number;
  dueDate: string; // YYYY-MM-DD
  invoiceMonth: string; // YYYY-MM
  isLoading: boolean;
  onPress: () => void;
}

export function CreditCardInvoiceCard({
  total,
  dueDate,
  invoiceMonth,
  isLoading,
  onPress,
}: CreditCardInvoiceCardProps) {
  if (isLoading) {
    return (
      <View className="h-[76px] bg-background-surface rounded-2xl border border-border opacity-40 mb-3" />
    );
  }

  const monthLabel = formatInvoiceMonth(invoiceMonth); // "abril 2026"
  const dueDateLabel = dueDate ? formatDate(dueDate) : '—';
  const currentMonth = new Date().toISOString().slice(0, 7);
  const invoiceTag = invoiceMonth === currentMonth ? 'Mês atual' : 'Próximo mês';

  return (
    <Pressable onPress={onPress} className="active:opacity-75 mb-3">
      <Card variant="elevated">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center">
            <CreditCard size={18} color={colors.accent.DEFAULT} strokeWidth={1.75} />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Label>{monthLabel}</Label>
              <View className="px-1.5 py-0.5 rounded-md bg-accent/15">
                <Text size="xs" className="text-accent">
                  {invoiceTag}
                </Text>
              </View>
            </View>
            <Text size="lg" weight="bold">
              {formatCurrency(total)}
            </Text>
          </View>

          <ChevronRight size={16} color={colors.text.muted} strokeWidth={2} />
        </View>

        <View className="mt-3 flex-row items-center gap-1.5">
          <CalendarClock size={12} color={colors.text.muted} strokeWidth={1.75} />
          <Text size="xs" variant="muted">
            Vencimento: {dueDateLabel}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
