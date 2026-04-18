import * as React from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Modal,
  Pressable,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil, Plus, PiggyBank, Trash2 } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { colors } from '@/constants/colors';
import { formatCurrency, formatInvoiceMonth, toPercent } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import type { Budget, Category } from '@/types/finance';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getBudgetStatus(spent: number, limit: number): {
  pct: number;
  barColor: string;
  labelColor: string;
} {
  const pct = toPercent(spent, limit);
  if (spent > limit) {
    return { pct: 100, barColor: colors.danger, labelColor: 'text-danger' };
  }
  if (pct >= 90) {
    return { pct, barColor: colors.danger, labelColor: 'text-danger' };
  }
  if (pct >= 70) {
    return { pct, barColor: colors.warning, labelColor: 'text-warning' };
  }
  return { pct, barColor: colors.success, labelColor: 'text-success' };
}

function displayToCents(text: string): number {
  const digits = text.replace(/\D/g, '');
  return parseInt(digits || '0', 10);
}

function centsToDisplay(cents: number): string {
  if (cents === 0) return '';
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Budget Sheet Modal ────────────────────────────────────────────────────────

const SHEET_HEIGHT = 390;

interface BudgetModalProps {
  visible: boolean;
  category: Category | null;
  existing: Budget | null;
  isSaving: boolean;
  onSave: (amount: number) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function BudgetModal({ visible, category, existing, isSaving, onSave, onDelete, onClose }: BudgetModalProps) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [rawCents, setRawCents] = useState(0);

  useEffect(() => {
    if (visible) {
      setRawCents(existing ? Math.round(existing.amount * 100) : 0);
      translateY.setValue(SHEET_HEIGHT);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 280, friction: 26, useNativeDriver: true }),
      ]).start();
    } else {
      translateY.setValue(SHEET_HEIGHT);
      opacity.setValue(0);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={isSaving ? undefined : onClose}
    >
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', opacity }}>
        {/* Backdrop tap to dismiss */}
        <Pressable style={{ flex: 1 }} onPress={isSaving ? undefined : onClose} />

        {/* Sheet */}
        <Animated.View
          style={{
            backgroundColor: colors.background.elevated,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.border.DEFAULT,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
            transform: [{ translateY }],
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border.DEFAULT,
              alignSelf: 'center',
              marginBottom: 22,
            }}
          />

          {/* Category header */}
          {category && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <CategoryBadge
                icon={category.icon}
                color={category.color}
                name=""
                showLabel={false}
                size="lg"
              />
              <View>
                <Label style={{ marginBottom: 2 }}>
                  {existing ? 'Editar orçamento' : 'Definir orçamento'}
                </Label>
                <Text size="lg" weight="bold">{category.name}</Text>
              </View>
            </View>
          )}

          {/* Amount input */}
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border.DEFAULT,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text
              size="xl"
              weight="semibold"
              variant="muted"
              style={{ marginRight: 6 }}
            >
              R$
            </Text>
            <TextInput
              value={centsToDisplay(rawCents)}
              onChangeText={(t) => setRawCents(displayToCents(t))}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor={colors.text.muted}
              autoFocus
              style={{
                flex: 1,
                fontSize: 28,
                fontWeight: '700',
                color: colors.text.primary,
              }}
            />
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: existing && onDelete ? 12 : 0 }}>
            <Button
              variant="secondary"
              label="Cancelar"
              size="md"
              onPress={onClose}
              disabled={isSaving}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Salvar"
              size="md"
              onPress={() => rawCents > 0 && onSave(rawCents / 100)}
              disabled={rawCents === 0 || isSaving}
              loading={isSaving}
              style={{ flex: 1 }}
            />
          </View>

          {/* Delete — only when editing an existing budget */}
          {existing && onDelete && (
            <Pressable
              onPress={onDelete}
              disabled={isSaving}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                opacity: isSaving ? 0.4 : 1,
              }}
              className="active:opacity-50"
            >
              <Trash2 size={14} color={colors.danger} strokeWidth={2} />
              <Text size="sm" weight="semibold" style={{ color: colors.danger }}>
                Excluir orçamento
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MonthSummary({
  totalSpent,
  totalBudgeted,
  onTrack,
  overBudget,
}: {
  totalSpent: number;
  totalBudgeted: number;
  onTrack: number;
  overBudget: number;
}) {
  return (
    <View className="flex-row gap-3 mb-5">
      <View className="flex-1 bg-background-surface rounded-2xl p-4 border border-border">
        <Label className="mb-1">Total gasto</Label>
        <Text size="xl" weight="bold">{formatCurrency(totalSpent)}</Text>
        <Text size="xs" variant="muted" className="mt-1">
          de {formatCurrency(totalBudgeted)} orçado
        </Text>
      </View>
      <View className="gap-2">
        <View className="bg-success/10 rounded-xl px-3 py-2 border border-success/20">
          <Text size="xs" weight="semibold" className="text-success">
            {onTrack} no limite
          </Text>
        </View>
        <View className="bg-danger/10 rounded-xl px-3 py-2 border border-danger/20">
          <Text size="xs" weight="semibold" className="text-danger">
            {overBudget} acima
          </Text>
        </View>
      </View>
    </View>
  );
}

interface BudgetCardProps {
  category: Category;
  budget: Budget;
  spent: number;
  onEdit: () => void;
}

function BudgetCard({ category, budget, spent, onEdit }: BudgetCardProps) {
  const { pct, barColor, labelColor } = getBudgetStatus(spent, budget.amount);
  const remaining = budget.amount - spent;
  const isOver = spent > budget.amount;

  return (
    <Card className="mb-3">
      <View className="flex-row items-center gap-3 mb-3">
        <CategoryBadge
          icon={category.icon}
          color={category.color}
          name=""
          showLabel={false}
          size="md"
        />
        <View className="flex-1">
          <Text size="sm" weight="semibold">{category.name}</Text>
          <Text size="xs" variant="muted">
            {isOver
              ? `${formatCurrency(Math.abs(remaining))} acima do limite`
              : `${formatCurrency(remaining)} restante`}
          </Text>
        </View>
        <Pressable
          onPress={onEdit}
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: colors.background.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="active:opacity-60"
        >
          <Pencil size={13} color={colors.text.muted} strokeWidth={1.75} />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View className="h-2 bg-background-card rounded-full overflow-hidden mb-2">
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: 999,
          }}
        />
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center">
        <Text size="xs" variant="muted">{formatCurrency(spent)} gasto</Text>
        <Text size="xs" weight="semibold" className={labelColor}>
          {isOver ? `+${formatCurrency(spent - budget.amount)}` : `${pct}%`}
        </Text>
        <Text size="xs" variant="muted">{formatCurrency(budget.amount)} limite</Text>
      </View>
    </Card>
  );
}

interface NoBudgetCardProps {
  category: Category;
  spent: number;
  onAdd: () => void;
}

function NoBudgetCard({ category, spent, onAdd }: NoBudgetCardProps) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-center gap-3">
        <CategoryBadge
          icon={category.icon}
          color={category.color}
          name=""
          showLabel={false}
          size="md"
        />
        <View className="flex-1">
          <Text size="sm" weight="semibold">{category.name}</Text>
          <Text size="xs" variant="muted">
            {spent > 0 ? `${formatCurrency(spent)} gasto este mês` : 'Sem gastos este mês'}
          </Text>
        </View>
        <Pressable
          onPress={onAdd}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primary.DEFAULT + '60',
            backgroundColor: colors.primary.DEFAULT + '10',
          }}
          className="active:opacity-70"
        >
          <Plus size={12} color={colors.primary.DEFAULT} strokeWidth={2.5} />
          <Text size="xs" weight="semibold" style={{ color: colors.primary.DEFAULT }}>
            Definir
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function BudgetsScreen() {
  const month = getCurrentMonth();

  const { categories: expenseCategories, isLoading: loadingCategories } = useCategories('expense');
  const { transactions, isLoading: loadingTransactions } = useTransactions(month);
  const { budgets, isLoading: loadingBudgets, create, update, remove, isSaving } = useBudgets(month);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { confirm, dialogProps, setLoading: setDialogLoading, close: closeDialog } = useConfirmDialog();

  const isLoading = loadingCategories || loadingTransactions || loadingBudgets;

  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        map[tx.categoryId] = (map[tx.categoryId] ?? 0) + tx.amount;
      }
    }
    return map;
  }, [transactions]);

  const budgetByCategory = useMemo(() => {
    const map: Record<string, Budget> = {};
    for (const b of budgets) {
      map[b.categoryId] = b;
    }
    return map;
  }, [budgets]);

  const { withBudget, withoutBudget } = useMemo(() => {
    const with_ = expenseCategories
      .filter((c) => budgetByCategory[c.id])
      .sort((a, b) => {
        const ratioA = (spentByCategory[a.id] ?? 0) / (budgetByCategory[a.id]?.amount ?? 1);
        const ratioB = (spentByCategory[b.id] ?? 0) / (budgetByCategory[b.id]?.amount ?? 1);
        return ratioB - ratioA;
      });
    const without_ = expenseCategories.filter((c) => !budgetByCategory[c.id]);
    return { withBudget: with_, withoutBudget: without_ };
  }, [expenseCategories, budgetByCategory, spentByCategory]);

  const summary = useMemo(() => {
    const totalBudgeted = withBudget.reduce(
      (s, c) => s + (budgetByCategory[c.id]?.amount ?? 0),
      0,
    );
    const totalSpent = withBudget.reduce(
      (s, c) => s + (spentByCategory[c.id] ?? 0),
      0,
    );
    const overBudget = withBudget.filter(
      (c) => (spentByCategory[c.id] ?? 0) > (budgetByCategory[c.id]?.amount ?? 0),
    ).length;
    return { totalBudgeted, totalSpent, onTrack: withBudget.length - overBudget, overBudget };
  }, [withBudget, budgetByCategory, spentByCategory]);

  const existingBudget = selectedCategory ? (budgetByCategory[selectedCategory.id] ?? null) : null;

  const monthLabel = (() => {
    const s = formatInvoiceMonth(month);
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();

  const handleDelete = async () => {
    if (!existingBudget) return;
    const confirmed = await confirm({
      title: 'Excluir orçamento',
      message: `Remover o limite definido para ${selectedCategory?.name ?? 'esta categoria'}?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
      icon: <Trash2 size={24} color={colors.danger} strokeWidth={1.75} />,
    });
    if (!confirmed) return;
    setDialogLoading(true);
    try {
      await remove(existingBudget.id);
      closeDialog();
      setSelectedCategory(null);
    } catch (e) {
      console.error('[BudgetsScreen] delete error:', e);
      closeDialog();
    }
  };

  const handleSave = async (amount: number) => {
    if (!selectedCategory) return;
    try {
      if (existingBudget) {
        await update(existingBudget.id, { amount });
      } else {
        await create({ categoryId: selectedCategory.id, amount, month });
      }
      setSelectedCategory(null);
    } catch (e) {
      console.error('[BudgetsScreen] save error:', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-6 pb-5">
          <Label>{monthLabel}</Label>
          <Text size="2xl" weight="bold" className="mt-0.5">
            Orçamentos
          </Text>
        </View>

        {isLoading ? (
          /* Skeleton */
          <>
            <View className="h-20 bg-background-surface rounded-2xl mb-5 border border-border opacity-40" />
            {[1, 2, 3].map((i) => (
              <View key={i} className="h-24 bg-background-surface rounded-2xl mb-3 border border-border opacity-40" />
            ))}
          </>
        ) : expenseCategories.length === 0 ? (
          /* Empty state */
          <View className="items-center py-20">
            <PiggyBank size={52} color={colors.text.muted} strokeWidth={1.5} />
            <Text size="lg" weight="semibold" className="mt-5">
              Nenhuma categoria
            </Text>
            <Text size="sm" variant="muted" className="mt-2 text-center">
              Adicione categorias de despesa para{'\n'}definir orçamentos mensais.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary — only when at least one budget is set */}
            {withBudget.length > 0 && (
              <MonthSummary
                totalSpent={summary.totalSpent}
                totalBudgeted={summary.totalBudgeted}
                onTrack={summary.onTrack}
                overBudget={summary.overBudget}
              />
            )}

            {/* Categories with budget */}
            {withBudget.length > 0 && (
              <>
                <Label className="mb-3">Com orçamento</Label>
                {withBudget.map((category) => (
                  <BudgetCard
                    key={category.id}
                    category={category}
                    budget={budgetByCategory[category.id]}
                    spent={spentByCategory[category.id] ?? 0}
                    onEdit={() => setSelectedCategory(category)}
                  />
                ))}
              </>
            )}

            {/* Categories without budget */}
            {withoutBudget.length > 0 && (
              <>
                <Label className={withBudget.length > 0 ? 'mt-5 mb-3' : 'mb-3'}>
                  Sem orçamento
                </Label>
                {withoutBudget.map((category) => (
                  <NoBudgetCard
                    key={category.id}
                    category={category}
                    spent={spentByCategory[category.id] ?? 0}
                    onAdd={() => setSelectedCategory(category)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <BudgetModal
        visible={selectedCategory !== null}
        category={selectedCategory}
        existing={existingBudget}
        isSaving={isSaving}
        onSave={handleSave}
        onDelete={existingBudget ? handleDelete : undefined}
        onClose={() => setSelectedCategory(null)}
      />

      <ConfirmDialog {...dialogProps} />
    </SafeAreaView>
  );
}
