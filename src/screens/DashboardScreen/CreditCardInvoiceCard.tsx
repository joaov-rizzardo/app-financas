import * as React from 'react';
import { View, Pressable } from 'react-native';
import { CreditCard, ChevronRight, CalendarClock } from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrency, formatCurrencyCompact, formatDate, formatInvoiceMonth, toPercent } from '@/lib/utils';

export interface CreditCardInvoiceCardProps {
  total: number;
  dueDate: string; // YYYY-MM-DD
  invoiceMonth: string; // YYYY-MM
  isLoading: boolean;
  onPress: () => void;
  limit?: number;
}

export function CreditCardInvoiceCard({
  total,
  dueDate,
  invoiceMonth,
  isLoading,
  onPress,
  limit,
}: CreditCardInvoiceCardProps) {
  if (isLoading) {
    return (
      <View className="h-[128px] bg-background-surface rounded-2xl border border-border opacity-40 mb-3" />
    );
  }

  const monthLabel = formatInvoiceMonth(invoiceMonth);
  const dueDateLabel = dueDate ? formatDate(dueDate) : '—';

  const usagePct = limit ? toPercent(total, limit) : 0;
  const usageColor =
    usagePct >= 80 ? colors.danger : usagePct >= 50 ? colors.warning : colors.accent.DEFAULT;

  return (
    <Pressable onPress={onPress} className="active:opacity-75 mb-3">
      <View
        style={{
          backgroundColor: colors.background.elevated,
          borderColor: colors.accent.DEFAULT + '38',
          borderWidth: 1,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Accent top strip */}
        <View style={{ height: 3, backgroundColor: colors.accent.DEFAULT, opacity: 0.65 }} />

        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2.5">
              <View
                className="w-9 h-9 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.accent.DEFAULT + '20' }}
              >
                <CreditCard size={17} color={colors.accent.DEFAULT} strokeWidth={1.75} />
              </View>
              <View>
                <Label>Fatura do Cartão</Label>
                <Text size="sm" weight="medium" className="mt-0.5">
                  {monthLabel}
                </Text>
              </View>
            </View>

            <View
              className="px-2 py-1 rounded-lg"
              style={{ backgroundColor: colors.accent.DEFAULT + '18' }}
            >
              <Text size="xs" className="text-accent font-medium">
                Fatura aberta
              </Text>
            </View>
          </View>

          {/* Amount */}
          <Text size="2xl" weight="bold" className="mb-3">
            {formatCurrency(total)}
          </Text>

          {/* Limit usage bar */}
          {!!limit && (
            <View className="mb-3">
              <View className="h-1.5 bg-background-card rounded-full overflow-hidden mb-1.5">
                <View
                  style={{
                    width: `${usagePct}%`,
                    height: '100%',
                    backgroundColor: usageColor,
                    borderRadius: 999,
                  }}
                />
              </View>
              <View className="flex-row justify-between">
                <Text size="xs" variant="muted">
                  {usagePct}% utilizado
                </Text>
                <Text size="xs" variant="muted">
                  Limite: {formatCurrencyCompact(limit)}
                </Text>
              </View>
            </View>
          )}

          {/* Footer */}
          <View
            className="flex-row items-center justify-between pt-3"
            style={{ borderTopWidth: 1, borderTopColor: colors.border.DEFAULT }}
          >
            <View className="flex-row items-center gap-1.5">
              <CalendarClock size={13} color={colors.text.muted} strokeWidth={1.75} />
              <Text size="xs" variant="muted">
                Vencimento: {dueDateLabel}
              </Text>
            </View>
            <ChevronRight size={15} color={colors.text.muted} strokeWidth={2} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
