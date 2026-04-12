import * as React from 'react';
import { ScrollView, View, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import {
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Tag,
  AlertCircle,
  Calendar,
  RefreshCw,
  Lock,
  CheckCircle,
} from 'lucide-react-native';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { colors } from '@/constants/colors';
import {
  formatCurrency,
  formatShortDate,
  formatDate,
  toPercent,
  formatInvoiceMonth,
  shiftInvoiceMonth,
  getInvoiceDueDate,
} from '@/lib/utils';
import type { CreditCardExpense, CreditCardConfig, Category } from '@/types/finance';
import type { CreditCardInvoicePayment } from '@/services/creditCardInvoices';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CreditCardScreenProps {
  expenses: CreditCardExpense[];
  categories: Category[];
  config: CreditCardConfig | null;
  isLoading: boolean;
  invoiceMonth: string;
  recurringCount: number;
  payment: CreditCardInvoicePayment | null;
  onMonthChange: (month: string) => void;
  onAdd: () => void;
  onSettings: () => void;
  onViewRecurring: () => void;
  onClose: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByDate(expenses: CreditCardExpense[]): [string, CreditCardExpense[]][] {
  const map = new Map<string, CreditCardExpense[]>();
  for (const exp of expenses) {
    const list = map.get(exp.date) ?? [];
    list.push(exp);
    map.set(exp.date, list);
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  const opacity = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      {/* Card widget skeleton */}
      <View
        style={{
          height: 172, borderRadius: 24, marginBottom: 16,
          backgroundColor: colors.primary[900],
        }}
      />
      {/* Summary skeleton */}
      <View
        style={{
          height: 120, borderRadius: 16, marginBottom: 16,
          backgroundColor: colors.background.surface,
          borderWidth: 1, borderColor: colors.border.DEFAULT,
        }}
      />
      {/* List skeleton */}
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            height: 62, borderRadius: 12, marginBottom: 8,
            backgroundColor: colors.background.surface,
            borderWidth: 1, borderColor: colors.border.DEFAULT,
          }}
        />
      ))}
    </Animated.View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="items-center py-12">
      <View
        style={{
          width: 64, height: 64, borderRadius: 20,
          backgroundColor: colors.background.elevated,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 1, borderColor: colors.border.DEFAULT,
          marginBottom: 14,
        }}
      >
        <CreditCard size={28} color={colors.text.muted} />
      </View>
      <Text weight="semibold" className="mb-1">Nenhum gasto nesta fatura</Text>
      <Text size="sm" variant="muted" className="mb-6 text-center">
        Adicione um gasto para começar a rastrear sua fatura
      </Text>
      <Pressable
        onPress={onAdd}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: colors.primary.DEFAULT,
          paddingHorizontal: 20, paddingVertical: 12,
          borderRadius: 14,
        }}
        className="active:opacity-85"
      >
        <Plus size={16} color="#fff" />
        <Text size="sm" weight="semibold" className="text-white">Adicionar gasto</Text>
      </Pressable>
    </View>
  );
}

// ─── No Config Banner ─────────────────────────────────────────────────────────

function NoConfigBanner({ onSettings }: { onSettings: () => void }) {
  return (
    <Pressable
      onPress={onSettings}
      style={{
        backgroundColor: colors.primary.DEFAULT + '12',
        borderRadius: 16, borderWidth: 1,
        borderColor: colors.primary.DEFAULT + '35',
        padding: 16, marginBottom: 16,
        flexDirection: 'row', gap: 12, alignItems: 'center',
      }}
      className="active:opacity-70"
    >
      <View
        style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: colors.primary.DEFAULT + '25',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <CreditCard size={20} color={colors.primary[400]} />
      </View>
      <View className="flex-1">
        <Text size="sm" weight="semibold" className="text-primary-400">
          Configure seu cartão
        </Text>
        <Text size="xs" variant="muted" className="mt-0.5">
          Defina o dia de fechamento e vencimento da fatura
        </Text>
      </View>
      <ChevronRight size={16} color={colors.primary[400]} />
    </Pressable>
  );
}

// ─── Card Widget ──────────────────────────────────────────────────────────────

function CreditCardWidget({
  invoiceTotal,
  dueDate,
  config,
  closedAt,
}: {
  invoiceTotal: number;
  dueDate: string | null;
  config: CreditCardConfig | null;
  closedAt?: string | null;
}) {
  const limit = config?.limit ? config.limit / 100 : null;
  const usagePct = limit ? toPercent(invoiceTotal, limit) : 0;
  const usageColor =
    usagePct > 80 ? colors.danger : usagePct > 50 ? colors.warning : colors.success;

  return (
    <View
      style={{
        backgroundColor: colors.primary[700],
        borderRadius: 24, padding: 24, marginBottom: 16,
        borderWidth: 1, borderColor: closedAt ? colors.success + '60' : colors.primary[600],
      }}
    >
      <View className="flex-row justify-between items-start mb-8">
        <View>
          <Text
            size="xs" weight="semibold" tracking="widest"
            className="uppercase text-primary-300 mb-1"
          >
            Cartão de crédito
          </Text>
          <Text size="lg" weight="semibold" className="text-white tracking-widest">
            ••••  ••••  ••••  ••••
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {closedAt && (
            <View
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: colors.success + '20',
                borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
                borderWidth: 1, borderColor: colors.success + '40',
              }}
            >
              <Lock size={11} color={colors.success} />
              <Text size="xs" weight="semibold" style={{ color: colors.success }}>
                Fatura fechada
              </Text>
            </View>
          )}
          <View
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: colors.primary[600],
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CreditCard size={22} color={colors.primary[200]} />
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-end mb-5">
        <View>
          <Label className="text-primary-300 mb-1">Fatura atual</Label>
          <Text size="2xl" weight="bold" className="text-white">
            {formatCurrency(invoiceTotal)}
          </Text>
        </View>
        {closedAt ? (
          <View className="items-end">
            <Label className="text-primary-300 mb-1">Fechada em</Label>
            <Text size="sm" weight="semibold" className="text-white">
              {formatShortDate(closedAt.substring(0, 10))}
            </Text>
          </View>
        ) : dueDate ? (
          <View className="items-end">
            <Label className="text-primary-300 mb-1">Vencimento</Label>
            <Text size="sm" weight="semibold" className="text-white">
              {formatShortDate(dueDate)}
            </Text>
          </View>
        ) : null}
      </View>

      {limit !== null && (
        <View>
          <View className="flex-row justify-between mb-1.5">
            <Label className="text-primary-300">Limite utilizado</Label>
            <Text size="xs" weight="semibold" style={{ color: usageColor }}>
              {usagePct}% de {formatCurrency(limit)}
            </Text>
          </View>
          <View
            style={{
              height: 4, backgroundColor: colors.primary[900] + '80',
              borderRadius: 999, overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${usagePct}%`, height: '100%',
                backgroundColor: usageColor, borderRadius: 999,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function InvoiceSummary({
  invoiceTotal,
  config,
  invoiceMonth,
  closedAt,
}: {
  invoiceTotal: number;
  config: CreditCardConfig | null;
  invoiceMonth: string;
  closedAt?: string | null;
}) {
  const limit = config?.limit ? config.limit / 100 : null;
  const available = limit !== null ? Math.max(0, limit - invoiceTotal) : null;

  const dueDate = config
    ? getInvoiceDueDate(invoiceMonth, config.dueDay)
    : null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <Text weight="semibold">Resumo da fatura</Text>
          {closedAt && (
            <Badge label="Fatura fechada" variant="success" />
          )}
        </View>
      </CardHeader>
      <CardContent>
        <View className="flex-row justify-between py-2">
          <Text variant="muted" size="sm">Total da fatura</Text>
          <Text size="sm" weight="semibold" className="text-danger">
            {formatCurrency(invoiceTotal)}
          </Text>
        </View>
        {closedAt ? (
          <>
            <Separator />
            <View className="flex-row justify-between py-2">
              <Text variant="muted" size="sm">Fechada em</Text>
              <Text size="sm" weight="medium">{formatDate(closedAt.substring(0, 10))}</Text>
            </View>
          </>
        ) : dueDate ? (
          <>
            <Separator />
            <View className="flex-row justify-between py-2">
              <Text variant="muted" size="sm">Vencimento</Text>
              <Text size="sm" weight="medium">{formatDate(dueDate)}</Text>
            </View>
          </>
        ) : null}
        {available !== null && (
          <>
            <Separator />
            <View className="flex-row justify-between py-2">
              <Text variant="muted" size="sm">Limite disponível</Text>
              <Text size="sm" weight="semibold" className="text-success">
                {formatCurrency(available)}
              </Text>
            </View>
          </>
        )}
        {limit !== null && (
          <>
            <Separator />
            <View className="flex-row justify-between pt-2">
              <Text variant="muted" size="sm">Limite total</Text>
              <Text size="sm" weight="semibold">{formatCurrency(limit)}</Text>
            </View>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Expense Row ──────────────────────────────────────────────────────────────

function ExpenseRow({
  expense,
  category,
  isLast,
}: {
  expense: CreditCardExpense;
  category?: Category;
  isLast: boolean;
}) {
  const Icon = category
    ? (Icons as unknown as Record<string, React.ElementType>)[category.icon] ?? Tag
    : Tag;
  const iconColor = category?.color ?? colors.text.muted;

  const isInstallment = expense.installmentTotal > 1;

  return (
    <>
      <View className="flex-row items-center py-3.5">
        <View
          style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: iconColor + '20',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Icon size={17} color={iconColor} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text size="sm" weight="medium">{expense.description}</Text>
            {isInstallment && (
              <Badge
                label={`${expense.installmentCurrent}/${expense.installmentTotal}×`}
                variant="info"
              />
            )}
          </View>
          <Text size="xs" variant="muted" className="mt-0.5">
            {category?.name ?? 'Sem categoria'} · {formatShortDate(expense.date)}
          </Text>
        </View>
        <Text size="sm" weight="semibold" className="text-danger">
          -{formatCurrency(expense.amount)}
        </Text>
      </View>
      {!isLast && <Separator />}
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CreditCardScreen({
  expenses,
  categories,
  config,
  isLoading,
  invoiceMonth,
  recurringCount,
  payment,
  onMonthChange,
  onAdd,
  onSettings,
  onViewRecurring,
  onClose,
}: CreditCardScreenProps) {
  const invoiceTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dueDate = config ? getInvoiceDueDate(invoiceMonth, config.dueDay) : null;
  const grouped = groupByDate(expenses);
  const [closeDialogVisible, setCloseDialogVisible] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  async function handleCloseInvoice() {
    setIsClosing(true);
    try {
      await onClose();
      setCloseDialogVisible(false);
    } finally {
      setIsClosing(false);
    }
  }

  const isClosed = payment !== null;
  const showCloseButton = !isClosed && expenses.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ConfirmDialog
        visible={closeDialogVisible}
        title="Fechar fatura"
        message={`Total: ${formatCurrency(invoiceTotal)}\n${expenses.length} ${expenses.length === 1 ? 'gasto' : 'gastos'}\n\nAs transações serão criadas individualmente nos lançamentos.`}
        confirmLabel="Fechar fatura"
        cancelLabel="Cancelar"
        variant="warning"
        icon={<Lock size={24} color={colors.warning} />}
        isLoading={isClosing}
        onConfirm={handleCloseInvoice}
        onCancel={() => { if (!isClosing) setCloseDialogVisible(false); }}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-6 pb-5 flex-row items-center justify-between">
          <View className="flex-1">
            <Label>Fatura do cartão</Label>
            <Text size="2xl" weight="bold" className="mt-0.5">Cartão de Crédito</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={onAdd}
              style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: colors.primary.DEFAULT,
                alignItems: 'center', justifyContent: 'center',
              }}
              className="active:opacity-80"
            >
              <Plus size={18} color="#fff" />
            </Pressable>
            <Pressable
              onPress={onSettings}
              style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: colors.background.card,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border.DEFAULT,
              }}
              className="active:opacity-70"
            >
              <Settings size={16} color={colors.text.secondary} />
            </Pressable>
          </View>
        </View>

        {/* Month navigation */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.background.surface,
            borderRadius: 14, padding: 6, marginBottom: 16,
            borderWidth: 1, borderColor: colors.border.DEFAULT,
          }}
        >
          <Pressable
            onPress={() => onMonthChange(shiftInvoiceMonth(invoiceMonth, -1))}
            style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: colors.background.card,
              alignItems: 'center', justifyContent: 'center',
            }}
            className="active:opacity-70"
          >
            <ChevronLeft size={18} color={colors.text.secondary} />
          </Pressable>
          <View className="items-center">
            <Text size="sm" weight="semibold" style={{ textTransform: 'capitalize' }}>
              {formatInvoiceMonth(invoiceMonth)}
            </Text>
            {config && (
              <Text size="xs" variant="muted">
                Fecha dia {config.closingDay}
              </Text>
            )}
          </View>
          <Pressable
            onPress={() => onMonthChange(shiftInvoiceMonth(invoiceMonth, 1))}
            style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: colors.background.card,
              alignItems: 'center', justifyContent: 'center',
            }}
            className="active:opacity-70"
          >
            <ChevronRight size={18} color={colors.text.secondary} />
          </Pressable>
        </View>

        {!config && <NoConfigBanner onSettings={onSettings} />}

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
            Assinaturas e parcelamentos
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

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <CreditCardWidget
              invoiceTotal={invoiceTotal}
              dueDate={dueDate}
              config={config}
              closedAt={payment?.closedAt}
            />
            <InvoiceSummary
              invoiceTotal={invoiceTotal}
              config={config}
              invoiceMonth={invoiceMonth}
              closedAt={payment?.closedAt}
            />

            {/* Close invoice button */}
            {showCloseButton && (
              <Pressable
                onPress={() => setCloseDialogVisible(true)}
                className="active:opacity-80"
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 8, backgroundColor: colors.warning + '15',
                  borderRadius: 14, borderWidth: 1, borderColor: colors.warning + '35',
                  paddingVertical: 14, marginBottom: 16,
                }}
              >
                <CheckCircle size={16} color={colors.warning} />
                <Text size="sm" weight="semibold" style={{ color: colors.warning }}>
                  Fechar fatura
                </Text>
              </Pressable>
            )}

            {/* Expense list */}
            {expenses.length === 0 ? (
              <EmptyState onAdd={onAdd} />
            ) : (
              <Card>
                <View className="flex-row justify-between items-center mb-3">
                  <Text weight="semibold">Compras no cartão</Text>
                  <Badge
                    label={`${expenses.length} ${expenses.length === 1 ? 'gasto' : 'gastos'}`}
                    variant="default"
                  />
                </View>
                {grouped.map(([dateStr, dayExpenses]) => (
                  <View key={dateStr}>
                    <View
                      style={{
                        backgroundColor: colors.background.card,
                        borderRadius: 8, paddingHorizontal: 8,
                        paddingVertical: 4, alignSelf: 'flex-start',
                        marginBottom: 4,
                        marginTop: 16
                      }}
                    >
                      <Text size="xs" variant="muted" weight="medium">
                        {formatShortDate(dateStr)}
                      </Text>
                    </View>
                    {dayExpenses.map((exp, idx) => (
                      <ExpenseRow
                        key={exp.id}
                        expense={exp}
                        category={categoryMap.get(exp.categoryId)}
                        isLast={idx === dayExpenses.length - 1 && dateStr === grouped[grouped.length - 1][0]}
                      />
                    ))}
                    {dateStr !== grouped[grouped.length - 1][0] && <Separator />}
                  </View>
                ))}
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
