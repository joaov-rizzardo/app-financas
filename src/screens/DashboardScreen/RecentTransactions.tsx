import * as React from 'react';
import { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { ChevronRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { colors } from '@/constants/colors';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import type { Transaction, Category } from '@/types/finance';

export interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
  onViewAll: () => void;
}

export function RecentTransactions({
  transactions,
  categories,
  isLoading,
  onViewAll,
}: RecentTransactionsProps) {
  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  const sorted = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.createdAt.localeCompare(a.createdAt);
      }),
    [transactions]
  );

  if (isLoading) {
    return (
      <Card className="mb-3">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="h-11 bg-background-card rounded-xl opacity-40 mb-2"
          />
        ))}
      </Card>
    );
  }

  return (
    <Card className="mb-3">
      {/* Section header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text weight="semibold">Últimos lançamentos</Text>
        <Pressable
          onPress={onViewAll}
          hitSlop={8}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text size="xs" className="text-primary-400">
            Ver todos
          </Text>
          <ChevronRight size={13} color={colors.primary[400]} />
        </Pressable>
      </View>

      {transactions.length === 0 ? (
        <View className="py-6 items-center">
          <Text size="sm" variant="muted">
            Nenhum lançamento neste mês
          </Text>
        </View>
      ) : (
        sorted.map((tx, i) => {
          const category = categoryMap[tx.categoryId];
          const isIncome = tx.type === 'income';

          return (
            <React.Fragment key={tx.id}>
              <View className="flex-row items-center py-2.5 gap-3">
                {category ? (
                  <CategoryBadge
                    icon={category.icon}
                    color={category.color}
                    name=""
                    showLabel={false}
                    size="sm"
                  />
                ) : (
                  <View
                    className="w-7 h-7 rounded-lg items-center justify-center"
                    style={{ backgroundColor: colors.background.card }}
                  >
                    {isIncome ? (
                      <ArrowDownLeft size={13} color={colors.success} />
                    ) : (
                      <ArrowUpRight size={13} color={colors.danger} />
                    )}
                  </View>
                )}

                <View className="flex-1">
                  <Text size="sm" weight="medium" numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text size="xs" variant="muted" className="mt-0.5">
                    {category?.name ?? '—'} · {formatShortDate(tx.date)}
                  </Text>
                </View>

                <Text
                  size="sm"
                  weight="semibold"
                  className={isIncome ? 'text-success' : 'text-text-primary'}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </Text>
              </View>

              {i < sorted.length - 1 && <Separator />}
            </React.Fragment>
          );
        })
      )}
    </Card>
  );
}
