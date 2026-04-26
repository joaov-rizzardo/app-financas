import * as React from 'react';
import { useRef, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Modal,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import * as Icons from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Separator } from '@/components/ui/Separator';
import { colors } from '@/constants/colors';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import type { Transaction, Category } from '@/types/finance';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryTransactionsSheetProps {
  visible: boolean;
  onClose: () => void;
  category: Category | null;
  transactions: Transaction[];
  periodLabel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SHEET_ANIM_OFFSET = 520;

function groupByDate(txs: Transaction[]): Array<{ date: string; items: Transaction[] }> {
  const sorted = [...txs].sort((a, b) => b.date.localeCompare(a.date));
  const groups: Record<string, Transaction[]> = {};
  for (const tx of sorted) {
    groups[tx.date] = groups[tx.date] ?? [];
    groups[tx.date].push(tx);
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

interface TransactionRowProps {
  tx: Transaction;
  accentColor: string;
  CategoryIcon: React.ElementType;
  isLast: boolean;
}

function TransactionRow({ tx, accentColor, CategoryIcon, isLast }: TransactionRowProps) {
  const isIncome = tx.type === 'income';
  const hasInstallments = (tx.installmentTotal ?? 0) > 1;

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: accentColor + '1a',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <CategoryIcon size={14} color={accentColor} strokeWidth={1.75} />
        </View>

        <View style={{ flex: 1 }}>
          <Text size="sm" weight="medium" numberOfLines={1}>
            {tx.description || '—'}
          </Text>
          {hasInstallments ? (
            <Text size="xs" variant="muted" style={{ marginTop: 1 }}>
              parcela {tx.installmentCurrent}/{tx.installmentTotal}
            </Text>
          ) : tx.isRecurring ? (
            <Text size="xs" variant="muted" style={{ marginTop: 1 }}>
              recorrente
            </Text>
          ) : null}
        </View>

        <Text
          size="sm"
          weight="semibold"
          style={{ color: isIncome ? colors.success : colors.text.primary }}
        >
          {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
        </Text>
      </View>
      {!isLast && <Separator />}
    </>
  );
}

// ─── Sheet ────────────────────────────────────────────────────────────────────

export function CategoryTransactionsSheet({
  visible,
  onClose,
  category,
  transactions,
  periodLabel,
}: CategoryTransactionsSheetProps) {
  const translateY = useRef(new Animated.Value(SHEET_ANIM_OFFSET)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_ANIM_OFFSET);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 280, friction: 26, useNativeDriver: true }),
      ]).start();
    } else {
      translateY.setValue(SHEET_ANIM_OFFSET);
      opacity.setValue(0);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => groupByDate(transactions), [transactions]);
  const total = useMemo(() => transactions.reduce((s, tx) => s + tx.amount, 0), [transactions]);
  const accentColor = category?.color ?? colors.primary.DEFAULT;

  const CategoryIcon = category
    ? ((Icons as unknown as Record<string, React.ElementType>)[category.icon] ?? Icons.Tag)
    : Icons.Tag;

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', opacity }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <Animated.View
          style={{
            backgroundColor: colors.background.elevated,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.border.DEFAULT,
            maxHeight: '82%',
            transform: [{ translateY }],
          }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
            {/* Handle */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border.DEFAULT,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />

            {/* Category info row */}
            {category && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <CategoryBadge
                  icon={category.icon}
                  color={category.color}
                  name=""
                  showLabel={false}
                  size="lg"
                />
                <View style={{ flex: 1 }}>
                  <Text size="lg" weight="bold">{category.name}</Text>
                  {periodLabel ? (
                    <Label style={{ marginTop: 2 }}>{periodLabel}</Label>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text size="lg" weight="bold" style={{ color: accentColor }}>
                    {formatCurrency(total)}
                  </Text>
                  <Text size="xs" variant="muted" style={{ marginTop: 1 }}>
                    {transactions.length}{' '}
                    {transactions.length === 1 ? 'lançamento' : 'lançamentos'}
                  </Text>
                </View>
              </View>
            )}

            {/* Colored accent separator */}
            <View style={{ height: 1, backgroundColor: accentColor + '35' }} />
          </View>

          {/* Transaction list */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 2,
              paddingBottom: Platform.OS === 'ios' ? 44 : 32,
            }}
            showsVerticalScrollIndicator={false}
          >
            {groups.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: accentColor + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CategoryIcon size={22} color={accentColor} strokeWidth={1.5} />
                </View>
                <Text size="sm" variant="muted" style={{ textAlign: 'center', marginTop: 2 }}>
                  Nenhum lançamento neste período
                </Text>
              </View>
            ) : (
              groups.map(({ date, items }) => (
                <View key={date}>
                  {/* Date header */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingTop: 14,
                      paddingBottom: 6,
                    }}
                  >
                    <Text size="xs" weight="semibold" variant="muted">
                      {formatShortDate(date)}
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border.DEFAULT }} />
                  </View>

                  {/* Rows */}
                  {items.map((tx, idx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      accentColor={accentColor}
                      CategoryIcon={CategoryIcon}
                      isLast={idx === items.length - 1}
                    />
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
