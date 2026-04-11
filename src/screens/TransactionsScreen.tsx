import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Animated,
  PanResponder,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Tag,
  AlertCircle,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Chip } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { colors } from '@/constants/colors';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import type { Category, Transaction, TransactionType } from '@/types/finance';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'income' | 'expense';

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

interface TransactionsScreenProps {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  month: string; // 'YYYY-MM'
  onMonthChange: (month: string) => void;
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
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
    const key = tx.date;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity, flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.background.card, marginRight: 12 }} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ width: '55%', height: 12, borderRadius: 6, backgroundColor: colors.background.card }} />
        <View style={{ width: '35%', height: 10, borderRadius: 5, backgroundColor: colors.background.card }} />
      </View>
      <View style={{ width: 60, height: 12, borderRadius: 6, backgroundColor: colors.background.card }} />
    </Animated.View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ width: 70, height: 10, borderRadius: 5, backgroundColor: colors.background.elevated, marginBottom: 10, marginLeft: 4 }} />
      <Card>
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <SkeletonRow />
            {i < 3 && <Separator />}
          </React.Fragment>
        ))}
      </Card>
    </View>
  );
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────

function SummaryBar({ income, expense }: { income: number; expense: number }) {
  const net = income - expense;
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
      <View style={{ flex: 1, backgroundColor: colors.success + '15', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.success + '25' }}>
        <Label style={{ color: colors.success, marginBottom: 4 }}>Receitas</Label>
        <Text size="sm" weight="bold" style={{ color: colors.success }}>
          +{formatCurrency(income)}
        </Text>
      </View>
      <View style={{ flex: 1, backgroundColor: colors.danger + '15', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.danger + '25' }}>
        <Label style={{ color: colors.danger, marginBottom: 4 }}>Despesas</Label>
        <Text size="sm" weight="bold" style={{ color: colors.danger }}>
          -{formatCurrency(expense)}
        </Text>
      </View>
      <View style={{ flex: 1, backgroundColor: colors.primary.DEFAULT + '15', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.primary.DEFAULT + '25' }}>
        <Label style={{ color: colors.primary[400], marginBottom: 4 }}>Saldo</Label>
        <Text size="sm" weight="bold" style={{ color: net >= 0 ? colors.success : colors.danger }}>
          {net >= 0 ? '+' : ''}{formatCurrency(net)}
        </Text>
      </View>
    </View>
  );
}

// ─── Swipeable Row ────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 72;
const DELETE_ZONE_WIDTH = 80;

function SwipeableTransactionRow({
  tx,
  category,
  isLast,
  onEdit,
  onDeleteRequest,
}: {
  tx: Transaction;
  category: Category | undefined;
  isLast: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const Icon = category
    ? (Icons as unknown as Record<string, React.ElementType>)[category.icon] ?? Icons.Tag
    : Tag;
  const iconColor = category?.color ?? colors.text.muted;
  const isIncome = tx.type === 'income';

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) {
          translateX.setValue(Math.max(g.dx, -DELETE_ZONE_WIDTH - 10));
        } else if (g.dx > 0) {
          translateX.setValue(Math.min(g.dx, 0));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          // snap open then trigger delete
          Animated.spring(translateX, { toValue: -DELETE_ZONE_WIDTH, useNativeDriver: true, tension: 200, friction: 20 }).start(() => {
            onDeleteRequest();
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 200, friction: 20 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  return (
    <>
      <View style={{ overflow: 'hidden' }}>
        {/* Delete background */}
        <View style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: DELETE_ZONE_WIDTH,
          backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
          borderRadius: 4,
        }}>
          <Trash2 size={20} color="#fff" strokeWidth={2} />
        </View>

        {/* Swipeable content */}
        <Animated.View style={{ transform: [{ translateX }], backgroundColor: colors.background.surface }}>
          <Pressable
            onPress={onEdit}
            className="active:opacity-75"
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
            {...panResponder.panHandlers}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: iconColor + '18',
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}>
              <Icon size={17} color={iconColor} strokeWidth={1.75} />
            </View>
            <View style={{ flex: 1 }}>
              <Text size="sm" weight="medium">
                {tx.description || category?.name || '—'}
              </Text>
              <Text size="xs" variant="muted" style={{ marginTop: 2 }}>
                {category?.name ?? 'Sem categoria'}
                {tx.installmentTotal && tx.installmentTotal > 1
                  ? ` · ${tx.installmentCurrent}/${tx.installmentTotal}x`
                  : ''}
                {tx.isRecurring ? ' · recorrente' : ''}
              </Text>
            </View>
            <Text
              size="sm"
              weight="semibold"
              style={{ color: isIncome ? colors.success : colors.text.primary }}
            >
              {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
      {!isLast && <Separator />}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
      <View style={{
        width: 64, height: 64, borderRadius: 20,
        backgroundColor: colors.background.elevated,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        borderWidth: 1, borderColor: colors.border.DEFAULT,
      }}>
        <Tag size={28} color={colors.text.muted} strokeWidth={1.5} />
      </View>
      <Text variant="muted" style={{ marginBottom: 4, textAlign: 'center' }}>
        Nenhum lançamento neste mês
      </Text>
      <Pressable onPress={onAdd} className="active:opacity-70" style={{ marginTop: 10 }}>
        <Text size="sm" style={{ color: colors.primary[400] }}>+ Adicionar lançamento</Text>
      </Pressable>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function TransactionsScreen({
  transactions,
  categories,
  isLoading,
  error,
  month,
  onMonthChange,
  onAdd,
  onEdit,
  onDelete,
}: TransactionsScreenProps) {
  const [filter, setFilter] = React.useState<FilterType>('all');
  const { confirm, dialogProps } = useConfirmDialog();

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
    });
    if (confirmed) {
      try {
        await onDelete(tx.id);
      } catch {
        Alert.alert('Erro', 'Não foi possível excluir o lançamento.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
        <View>
          <Label>Lançamentos</Label>
          {/* Month selector */}
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
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </View>

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
