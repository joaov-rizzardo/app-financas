import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import {
  ChevronLeft,
  RefreshCw,
  CreditCard,
  Tag,
  AlertCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { colors } from '@/constants/colors';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import type { Category, RecurringItem, TransactionType } from '@/types/finance';

// ─── Props ────────────────────────────────────────────────────────────────────

interface RecurringItemsScreenProps {
  recurringItems: RecurringItem[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onCancel: (id: string) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FREQUENCY_LABEL: Record<string, string> = {
  monthly: 'Mensal',
  weekly: 'Semanal',
};

function isInstallmentItem(item: RecurringItem): boolean {
  return !!item.installmentTotal && item.installmentTotal > 1;
}

function groupByType(items: RecurringItem[]): Map<TransactionType, RecurringItem[]> {
  const map = new Map<TransactionType, RecurringItem[]>([
    ['expense', []],
    ['income', []],
  ]);
  for (const item of items) {
    map.get(item.type)!.push(item);
  }
  return map;
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
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.background.card, marginRight: 12 }} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ width: '50%', height: 12, borderRadius: 6, backgroundColor: colors.background.card }} />
        <View style={{ width: '30%', height: 10, borderRadius: 5, backgroundColor: colors.background.card }} />
      </View>
      <View style={{ width: 64, height: 12, borderRadius: 6, backgroundColor: colors.background.card }} />
    </Animated.View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ type, count }: { type: TransactionType; count: number }) {
  const isIncome = type === 'income';
  const color = isIncome ? colors.success : colors.danger;
  const Icon = isIncome ? TrendingUp : TrendingDown;
  const label = isIncome ? 'Receitas' : 'Despesas';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 }}>
      <View style={{
        width: 28, height: 28, borderRadius: 9,
        backgroundColor: color + '18',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} color={color} strokeWidth={2} />
      </View>
      <Text size="sm" weight="semibold" style={{ color, flex: 1 }}>{label}</Text>
      <View style={{
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
        backgroundColor: color + '15',
        borderWidth: 1, borderColor: color + '25',
      }}>
        <Text size="xs" weight="semibold" style={{ color }}>{count}</Text>
      </View>
    </View>
  );
}

// ─── Recurring Item Row ───────────────────────────────────────────────────────

function RecurringItemRow({
  item,
  category,
  isLast,
  onCancelRequest,
}: {
  item: RecurringItem;
  category: Category | undefined;
  isLast: boolean;
  onCancelRequest: () => void;
}) {
  const Icon = category
    ? (Icons as unknown as Record<string, React.ElementType>)[category.icon] ?? Icons.Tag
    : Tag;
  const iconColor = category?.color ?? colors.text.muted;
  const isIncome = item.type === 'income';
  const amountColor = isIncome ? colors.success : colors.text.primary;

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
        {/* Icon */}
        <View style={{
          width: 44, height: 44, borderRadius: 14,
          backgroundColor: iconColor + '18',
          alignItems: 'center', justifyContent: 'center', marginRight: 12,
        }}>
          <Icon size={18} color={iconColor} strokeWidth={1.75} />
        </View>

        {/* Content */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text size="sm" weight="semibold" numberOfLines={1}>
            {item.description || category?.name || '—'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {isInstallmentItem(item) ? (
              /* Installment badge */
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
                backgroundColor: colors.warning + '18',
                borderWidth: 1, borderColor: colors.warning + '30',
              }}>
                <Layers size={10} color={colors.warning} strokeWidth={2} />
                <Text size="xs" style={{ color: colors.warning }}>
                  {item.installmentCurrent ?? 1}/{item.installmentTotal}x
                </Text>
              </View>
            ) : (
              /* Frequency badge */
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
                backgroundColor: colors.primary.DEFAULT + '18',
                borderWidth: 1, borderColor: colors.primary.DEFAULT + '30',
              }}>
                <RefreshCw size={10} color={colors.primary[400]} strokeWidth={2} />
                <Text size="xs" style={{ color: colors.primary[400] }}>
                  {FREQUENCY_LABEL[item.frequency] ?? item.frequency}
                </Text>
              </View>
            )}
            {/* Start date */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Calendar size={10} color={colors.text.muted} strokeWidth={1.75} />
              <Text size="xs" variant="muted">
                desde {formatShortDate(item.startDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount + cancel */}
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Text size="sm" weight="bold" style={{ color: amountColor }}>
            {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          <Pressable
            onPress={onCancelRequest}
            className="active:opacity-70"
            style={{
              width: 28, height: 28, borderRadius: 9,
              backgroundColor: colors.danger + '15',
              borderWidth: 1, borderColor: colors.danger + '30',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trash2 size={13} color={colors.danger} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
      {!isLast && <Separator />}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 64 }}>
      <View style={{
        width: 72, height: 72, borderRadius: 22,
        backgroundColor: colors.primary.DEFAULT + '15',
        alignItems: 'center', justifyContent: 'center', marginBottom: 18,
        borderWidth: 1, borderColor: colors.primary.DEFAULT + '25',
      }}>
        <RefreshCw size={30} color={colors.primary[400]} strokeWidth={1.5} />
      </View>
      <Text weight="semibold" style={{ marginBottom: 6, textAlign: 'center' }}>
        Nenhum item recorrente
      </Text>
      <Text size="sm" variant="muted" style={{ textAlign: 'center', maxWidth: 260, lineHeight: 20 }}>
        Ao criar um lançamento como recorrente, ele aparecerá aqui para gerenciamento.
      </Text>
    </View>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner({ total, recurringCount, installmentCount }: {
  total: number;
  recurringCount: number;
  installmentCount: number;
}) {
  return (
    <View style={{
      borderRadius: 20, padding: 20, marginBottom: 20,
      backgroundColor: colors.primary.DEFAULT + '12',
      borderWidth: 1, borderColor: colors.primary.DEFAULT + '25',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: colors.primary.DEFAULT + '25',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <RefreshCw size={18} color={colors.primary[400]} strokeWidth={2} />
        </View>
        <View>
          <Text size="base" weight="bold">{total} {total === 1 ? 'item ativo' : 'itens ativos'}</Text>
          <Text size="xs" variant="muted">configurados para geração automática</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: colors.primary.DEFAULT + '12', borderRadius: 12, padding: 10,
          borderWidth: 1, borderColor: colors.primary.DEFAULT + '20',
        }}>
          <RefreshCw size={13} color={colors.primary[400]} strokeWidth={2} />
          <Text size="xs" style={{ color: colors.primary[400] }}>
            {recurringCount} {recurringCount === 1 ? 'recorrente' : 'recorrentes'}
          </Text>
        </View>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: colors.warning + '12', borderRadius: 12, padding: 10,
          borderWidth: 1, borderColor: colors.warning + '20',
        }}>
          <Layers size={13} color={colors.warning} strokeWidth={2} />
          <Text size="xs" style={{ color: colors.warning }}>
            {installmentCount} {installmentCount === 1 ? 'parcelado' : 'parcelados'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function RecurringItemsScreen({
  recurringItems,
  categories,
  isLoading,
  error,
  onBack,
  onCancel,
}: RecurringItemsScreenProps) {
  const { confirm, dialogProps } = useConfirmDialog();

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const handleCancelRequest = async (item: RecurringItem) => {
    const cat = getCategoryById(item.categoryId);
    const confirmed = await confirm({
      title: 'Cancelar recorrência?',
      message: `"${item.description || cat?.name || 'Item'}" não irá mais gerar lançamentos automaticamente.`,
      confirmLabel: 'Cancelar recorrência',
      cancelLabel: 'Manter',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await onCancel(item.id);
      } catch {
        Alert.alert('Erro', 'Não foi possível cancelar a recorrência.');
      }
    }
  };

  const grouped = groupByType(recurringItems);
  const incomeItems = grouped.get('income')!;
  const expenseItems = grouped.get('expense')!;
  const total = recurringItems.length;
  const installmentCount = recurringItems.filter(isInstallmentItem).length;
  const recurringCount = total - installmentCount;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
      }}>
        <Pressable
          onPress={onBack}
          className="active:opacity-70"
          style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: colors.background.elevated,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12, borderWidth: 1, borderColor: colors.border.DEFAULT,
          }}
        >
          <ChevronLeft size={20} color={colors.text.primary} strokeWidth={2} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text size="xl" weight="bold">Recorrentes</Text>
          <Text size="xs" variant="muted">Lançamentos e parcelamentos automáticos</Text>
        </View>
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

        {/* Loading skeleton */}
        {isLoading && (
          <Card style={{ marginBottom: 12 }}>
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <SkeletonRow />
                {i < 3 && <Separator />}
              </React.Fragment>
            ))}
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && total === 0 && <EmptyState />}

        {/* Hero banner */}
        {!isLoading && total > 0 && (
          <HeroBanner
            total={total}
            recurringCount={recurringCount}
            installmentCount={installmentCount}
          />
        )}

        {/* Expense section */}
        {!isLoading && expenseItems.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <SectionHeader type="expense" count={expenseItems.length} />
            <Card>
              {expenseItems.map((item, i) => (
                <RecurringItemRow
                  key={item.id}
                  item={item}
                  category={getCategoryById(item.categoryId)}
                  isLast={i === expenseItems.length - 1}
                  onCancelRequest={() => handleCancelRequest(item)}
                />
              ))}
            </Card>
          </View>
        )}

        {/* Income section */}
        {!isLoading && incomeItems.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <SectionHeader type="income" count={incomeItems.length} />
            <Card>
              {incomeItems.map((item, i) => (
                <RecurringItemRow
                  key={item.id}
                  item={item}
                  category={getCategoryById(item.categoryId)}
                  isLast={i === incomeItems.length - 1}
                  onCancelRequest={() => handleCancelRequest(item)}
                />
              ))}
            </Card>
          </View>
        )}

        {/* Info note */}
        {!isLoading && total > 0 && (
          <View style={{
            flexDirection: 'row', alignItems: 'flex-start', gap: 10,
            backgroundColor: colors.info + '10', borderRadius: 14,
            borderWidth: 1, borderColor: colors.info + '20',
            padding: 14, marginTop: 4,
          }}>
            <CreditCard size={16} color={colors.info} strokeWidth={1.75} style={{ marginTop: 1 }} />
            <Text size="xs" style={{ color: colors.info + 'cc', flex: 1, lineHeight: 18 }}>
              Cancelar uma recorrência remove apenas o modelo. Os lançamentos já gerados continuam no histórico.
            </Text>
          </View>
        )}
      </ScrollView>

      <ConfirmDialog {...dialogProps} />
    </SafeAreaView>
  );
}
