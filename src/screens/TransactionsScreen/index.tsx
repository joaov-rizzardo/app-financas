import * as React from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Trash2 } from 'lucide-react-native';
import { useMonthSwipe } from '@/hooks/useMonthSwipe';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Chip } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { colors } from '@/constants/colors';
import { formatShortDate } from '@/lib/utils';
import type { Category, Transaction, TransactionType } from '@/types/finance';
import { SummaryBar } from './SummaryBar';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { SwipeableTransactionRow } from './SwipeableTransactionRow';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterType = 'all' | TransactionType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'income', label: 'Receitas' },
  { key: 'expense', label: 'Despesas' },
];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TransactionsScreenProps {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  month: string; // 'YYYY-MM'
  recurringCount: number;
  onMonthChange: (month: string) => void;
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onViewRecurring: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMonth(month: string): { year: number; m: number } {
  const [y, m] = month.split('-').map(Number);
  return { year: y, m };
}

function shiftMonth(month: string, delta: number): string {
  let { year, m } = parseMonth(month);
  m += delta;
  if (m > 12) { m = 1; year++; }
  if (m < 1) { m = 12; year--; }
  return `${year}-${String(m).padStart(2, '0')}`;
}

function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (!map.has(tx.date)) map.set(tx.date, []);
    map.get(tx.date)!.push(tx);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, txs]) => [
      date,
      txs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ] as [string, Transaction[]]);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function TransactionsScreen({
  transactions,
  categories,
  isLoading,
  error,
  month,
  recurringCount,
  onMonthChange,
  onAdd,
  onEdit,
  onDelete,
  onViewRecurring,
}: TransactionsScreenProps) {
  const [filter, setFilter] = React.useState<FilterType>('all');
  const { confirm, dialogProps, setLoading, close } = useConfirmDialog();
  const swipeHandlers = useMonthSwipe(
    () => onMonthChange(shiftMonth(month, -1)),
    () => onMonthChange(shiftMonth(month, 1)),
  );

  const { year, m } = parseMonth(month);
  const monthLabel = `${MONTH_NAMES[m - 1]} ${year}`;

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);
  const grouped = groupByDate(filtered);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const handleDeleteRequest = async (tx: Transaction) => {
    const cat = getCategoryById(tx.categoryId);
    const confirmed = await confirm({
      title: 'Excluir lançamento?',
      message: `"${tx.description || cat?.name || 'Lançamento'}" será removido permanentemente.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      icon: <Trash2 size={26} color={colors.danger} strokeWidth={1.75} />,
    });
    if (confirmed) {
      try {
        setLoading(true);
        await onDelete(tx.id);
        close();
      } catch {
        close();
        Alert.alert('Erro', 'Não foi possível excluir o lançamento.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16,
      }} {...swipeHandlers}>
        <View>
          <Label>Lançamentos</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Pressable
              onPress={() => onMonthChange(shiftMonth(month, -1))}
              className="active:opacity-60"
              style={{ padding: 4 }}
            >
              <ChevronLeft size={18} color={colors.text.secondary} strokeWidth={2} />
            </Pressable>
            <Text size="2xl" weight="bold">{monthLabel}</Text>
            <Pressable
              onPress={() => onMonthChange(shiftMonth(month, 1))}
              className="active:opacity-60"
              style={{ padding: 4 }}
            >
              <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
        <Pressable
          onPress={onAdd}
          className="active:opacity-80"
          style={{
            width: 44, height: 44, borderRadius: 14,
            backgroundColor: colors.primary.DEFAULT,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: colors.primary.DEFAULT,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
          }}
        >
          <Plus size={22} color="#fff" strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Error banner */}
        {error && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: colors.danger + '18', borderRadius: 12,
            borderWidth: 1, borderColor: colors.danger + '30',
            padding: 14, marginBottom: 16,
          }}>
            <AlertCircle size={18} color={colors.danger} strokeWidth={1.75} />
            <Text size="sm" style={{ color: colors.danger, flex: 1 }}>{error}</Text>
          </View>
        )}

        {/* Summary */}
        {!isLoading && !error && (
          <SummaryBar income={totalIncome} expense={totalExpense} />
        )}

        {/* Filters */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </View>

        {/* Recurring shortcut */}
        <Pressable
          onPress={onViewRecurring}
          className="active:opacity-75"
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: colors.primary.DEFAULT + '10',
            borderRadius: 14, borderWidth: 1,
            borderColor: colors.primary.DEFAULT + '25',
            paddingHorizontal: 14, paddingVertical: 11,
            marginBottom: 16,
          }}
        >
          <View style={{
            width: 30, height: 30, borderRadius: 9,
            backgroundColor: colors.primary.DEFAULT + '20',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={14} color={colors.primary[400]} strokeWidth={2} />
          </View>
          <Text size="sm" weight="medium" style={{ flex: 1, color: colors.primary[400] }}>
            Recorrentes e parcelados
          </Text>
          {recurringCount > 0 && (
            <View style={{
              paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
              backgroundColor: colors.primary.DEFAULT + '25',
            }}>
              <Text size="xs" weight="bold" style={{ color: colors.primary[400] }}>
                {recurringCount}
              </Text>
            </View>
          )}
          <ChevronRight size={16} color={colors.primary[400]} strokeWidth={2} />
        </Pressable>

        {/* Loading */}
        {isLoading && (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        )}

        {/* Empty */}
        {!isLoading && !error && transactions.length === 0 && (
          <EmptyState onAdd={onAdd} />
        )}

        {/* Grouped list */}
        {!isLoading && grouped.map(([date, txs]) => (
          <View key={date} style={{ marginBottom: 12 }}>
            <Label style={{ marginBottom: 8, paddingLeft: 4 }}>{formatShortDate(date)}</Label>
            <Card>
              {txs.map((tx, i) => (
                <SwipeableTransactionRow
                  key={tx.id}
                  tx={tx}
                  category={getCategoryById(tx.categoryId)}
                  isLast={i === txs.length - 1}
                  onEdit={() => onEdit(tx)}
                  onDeleteRequest={() => handleDeleteRequest(tx)}
                />
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>

      <ConfirmDialog {...dialogProps} />
    </SafeAreaView>
  );
}
