import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import {
  ArrowLeft,
  Calendar,
  Tag,
  ChevronRight,
  Check,
  CreditCard,
  RefreshCw,
  Layers,
} from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { ActionButton } from '@/components/ui/ActionButton';
import { DatePicker } from '@/components/ui/DatePicker';
import { colors } from '@/constants/colors';
import { formatDate, getInvoiceMonth, formatInvoiceMonth } from '@/lib/utils';
import type { Category, CreditCardConfig, CreditCardExpense } from '@/types/finance';
import type { CreateExpenseInput, ExpenseType } from '@/hooks/useCreditCardExpenses';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseCentsToDisplay(cents: number): string {
  if (cents === 0) return '';
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function displayToCents(text: string): number {
  const digits = text.replace(/\D/g, '');
  return parseInt(digits || '0', 10);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  categories: Category[];
  config: CreditCardConfig | null;
  onCreate: (input: CreateExpenseInput) => Promise<void>;
  onBack: () => void;
  initialExpense?: CreditCardExpense;
  onUpdate?: (id: string, data: Partial<Omit<CreditCardExpense, 'id'>>) => Promise<void>;
}

// ─── CategoryPickerModal ──────────────────────────────────────────────────────

function CategoryPickerModal({
  visible,
  categories,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 260, friction: 24, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 600, tension: 260, friction: 24, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={{ flex: 1, backgroundColor: '#000', opacity: backdropOpacity }}
        onTouchEnd={onClose}
      />
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background.elevated,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          paddingBottom: 36,
          maxHeight: '70%',
          transform: [{ translateY }],
        }}
      >
        <Text weight="semibold" size="base" className="mb-4 text-center">Categoria</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap gap-2 pb-2">
            {expenseCategories.map((cat) => {
              const Icon = (Icons as unknown as Record<string, React.ElementType>)[cat.icon] ?? Tag;
              const selected = cat.id === selectedId;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => { onSelect(cat.id); onClose(); }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: selected ? cat.color + '25' : cat.color + '12',
                    borderWidth: 1,
                    borderColor: selected ? cat.color : cat.color + '50',
                  }}
                  className="active:opacity-70"
                >
                  <Icon size={15} color={cat.color} />
                  <Text size="sm" weight={selected ? 'semibold' : 'medium'}
                    style={{ color: cat.color }}>
                    {cat.name}
                  </Text>
                  {selected && (
                    <View style={{
                      width: 16, height: 16, borderRadius: 8,
                      backgroundColor: cat.color,
                      alignItems: 'center', justifyContent: 'center', marginLeft: 2,
                    }}>
                      <Check size={10} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CreditCardExpenseFormScreen({ categories, config, onCreate, onBack, initialExpense, onUpdate }: Props) {
  const isEditMode = initialExpense !== undefined;

  const [amountCents, setAmountCents] = useState(() =>
    initialExpense ? Math.round(initialExpense.amount * 100) : 0,
  );
  const [amountDisplay, setAmountDisplay] = useState(() =>
    initialExpense ? parseCentsToDisplay(Math.round(initialExpense.amount * 100)) : '',
  );
  const [description, setDescription] = useState(() => initialExpense?.description ?? '');
  const [categoryId, setCategoryId] = useState(() => initialExpense?.categoryId ?? '');
  const [date, setDate] = useState(() => initialExpense?.date ?? todayISO());
  const [expenseType, setExpenseType] = useState<ExpenseType>('single');
  const [installmentTotal, setInstallmentTotal] = useState(2);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const invoiceMonth = config
    ? getInvoiceMonth(date, config.closingDay)
    : date.substring(0, 7);

  function handleAmountChange(text: string) {
    const cents = displayToCents(text);
    setAmountCents(cents);
    setAmountDisplay(parseCentsToDisplay(cents));
  }

  async function handleSubmit() {
    if (amountCents === 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Categoria obrigatória', 'Selecione uma categoria.');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && onUpdate && initialExpense) {
        const updatedInvoiceMonth = config
          ? getInvoiceMonth(date, config.closingDay)
          : date.substring(0, 7);
        await onUpdate(initialExpense.id, {
          amount: amountCents / 100,
          description: description.trim() || (selectedCategory?.name ?? 'Gasto no cartão'),
          categoryId,
          date,
          invoiceMonth: updatedInvoiceMonth,
        });
      } else {
        if (!config) {
          Alert.alert('Cartão não configurado', 'Configure o cartão antes de adicionar gastos.');
          return;
        }
        await onCreate({
          amount: amountCents / 100,
          description: description.trim() || (selectedCategory?.name ?? 'Gasto no cartão'),
          categoryId,
          date,
          expenseType,
          installmentTotal: expenseType === 'installment' ? installmentTotal : undefined,
          closingDay: config.closingDay,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const EXPENSE_TYPES: { key: ExpenseType; label: string; icon: React.ElementType; description: string }[] = [
    { key: 'single', label: 'À vista', icon: CreditCard, description: 'Cobrança única na fatura' },
    { key: 'installment', label: 'Parcelado', icon: Layers, description: 'Dividido em parcelas mensais' },
    { key: 'subscription', label: 'Assinatura', icon: RefreshCw, description: 'Renovação automática mensal' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-3 gap-3">
          <Pressable
            onPress={onBack}
            style={{
              width: 38, height: 38, borderRadius: 12,
              backgroundColor: colors.background.card,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: colors.border.DEFAULT,
            }}
            className="active:opacity-70"
          >
            <ArrowLeft size={18} color={colors.text.secondary} />
          </Pressable>
          <View className="flex-1">
            <Label>{isEditMode ? 'Editar gasto' : 'Novo gasto'}</Label>
            <Text size="xl" weight="bold" className="mt-0.5">Cartão de Crédito</Text>
          </View>
          <View
            style={{
              width: 38, height: 38, borderRadius: 12,
              backgroundColor: colors.primary.DEFAULT + '20',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CreditCard size={18} color={colors.primary[400]} />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* No config warning */}
          {!config && (
            <View
              style={{
                backgroundColor: colors.warning + '15',
                borderRadius: 12, borderWidth: 1,
                borderColor: colors.warning + '40',
                padding: 12, marginBottom: 16,
                flexDirection: 'row', gap: 10, alignItems: 'center',
              }}
            >
              <CreditCard size={16} color={colors.warning} />
              <Text size="xs" style={{ color: colors.warning, flex: 1 }}>
                Configure o cartão para que a fatura seja calculada corretamente.
              </Text>
            </View>
          )}

          {/* Amount */}
          <View
            style={{
              backgroundColor: colors.background.elevated,
              borderRadius: 20, padding: 20, marginBottom: 16,
              borderWidth: 1, borderColor: colors.border.DEFAULT,
              alignItems: 'center',
            }}
          >
            <Label className="mb-2">Valor do gasto</Label>
            <View className="flex-row items-center gap-2">
              <Text size="2xl" weight="bold" style={{ color: colors.danger }}>R$</Text>
              <TextInput
                value={amountDisplay}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor={colors.text.muted}
                style={{
                  color: colors.danger,
                  fontSize: 36,
                  fontWeight: '800',
                  minWidth: 80,
                  paddingVertical: 0,
                }}
              />
            </View>
            {config && (
              <View
                style={{
                  marginTop: 10, paddingHorizontal: 12, paddingVertical: 5,
                  backgroundColor: colors.primary.DEFAULT + '15',
                  borderRadius: 20,
                }}
              >
                <Text size="xs" className="text-primary-400" weight="medium">
                  Fatura de {formatInvoiceMonth(invoiceMonth)}
                </Text>
              </View>
            )}
          </View>

          {/* Expense type — hidden in edit mode */}
          {!isEditMode && (
            <View
              style={{
                backgroundColor: colors.background.surface,
                borderRadius: 16, marginBottom: 16,
                borderWidth: 1, borderColor: colors.border.DEFAULT,
                overflow: 'hidden',
              }}
            >
              {EXPENSE_TYPES.map((et, idx) => {
                const Icon = et.icon;
                const selected = expenseType === et.key;
                return (
                  <React.Fragment key={et.key}>
                    {idx > 0 && <Separator />}
                    <Pressable
                      onPress={() => setExpenseType(et.key)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        gap: 12,
                        backgroundColor: selected ? colors.primary.DEFAULT + '10' : 'transparent',
                      }}
                      className="active:opacity-70"
                    >
                      <View
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          backgroundColor: selected ? colors.primary.DEFAULT + '25' : colors.background.card,
                          alignItems: 'center', justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: selected ? colors.primary.DEFAULT + '50' : colors.border.DEFAULT,
                        }}
                      >
                        <Icon size={16} color={selected ? colors.primary[400] : colors.text.muted} />
                      </View>
                      <View className="flex-1">
                        <Text size="sm" weight={selected ? 'semibold' : 'medium'}
                          style={{ color: selected ? colors.primary[300] : colors.text.primary }}>
                          {et.label}
                        </Text>
                        <Text size="xs" variant="muted">{et.description}</Text>
                      </View>
                      <View
                        style={{
                          width: 20, height: 20, borderRadius: 10,
                          borderWidth: 2,
                          borderColor: selected ? colors.primary.DEFAULT : colors.border.DEFAULT,
                          backgroundColor: selected ? colors.primary.DEFAULT : 'transparent',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {selected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                      </View>
                    </Pressable>
                  </React.Fragment>
                );
              })}
            </View>
          )}

          {/* Installment stepper */}
          {!isEditMode && expenseType === 'installment' && (
            <View
              style={{
                backgroundColor: colors.background.surface,
                borderRadius: 14, marginBottom: 16,
                borderWidth: 1, borderColor: colors.primary.DEFAULT + '40',
                padding: 16,
              }}
            >
              <Text size="sm" weight="semibold" className="text-primary-400 mb-3">
                Número de parcelas
              </Text>
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => setInstallmentTotal((v) => Math.max(2, v - 1))}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: colors.background.card,
                    borderWidth: 1, borderColor: colors.border.DEFAULT,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                  className="active:opacity-70"
                >
                  <Text size="xl" weight="semibold" variant="secondary">−</Text>
                </Pressable>
                <View
                  style={{
                    flex: 1, height: 40, backgroundColor: colors.background.card,
                    borderRadius: 10, borderWidth: 1,
                    borderColor: colors.primary.DEFAULT + '60',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text size="lg" weight="bold" className="text-primary-400">
                    {installmentTotal}×
                  </Text>
                </View>
                <Pressable
                  onPress={() => setInstallmentTotal((v) => Math.min(24, v + 1))}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: colors.background.card,
                    borderWidth: 1, borderColor: colors.border.DEFAULT,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                  className="active:opacity-70"
                >
                  <Text size="xl" weight="semibold" variant="secondary">+</Text>
                </Pressable>
              </View>
              {amountCents > 0 && (
                <Text size="xs" variant="muted" className="mt-2 text-center">
                  {installmentTotal}× de {((amountCents / 100) / installmentTotal).toLocaleString('pt-BR', {
                    style: 'currency', currency: 'BRL',
                  })}
                </Text>
              )}
            </View>
          )}

          {/* Category */}
          <Pressable
            onPress={() => setShowCategoryPicker(true)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: colors.background.surface,
              borderRadius: 14, padding: 14, marginBottom: 12,
              borderWidth: 1,
              borderColor: categoryId ? colors.primary.DEFAULT + '50' : colors.border.DEFAULT,
            }}
            className="active:opacity-70"
          >
            {selectedCategory ? (
              (() => {
                const Icon = (Icons as unknown as Record<string, React.ElementType>)[selectedCategory.icon] ?? Tag;
                return (
                  <View
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: selectedCategory.color + '25',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon size={17} color={selectedCategory.color} />
                  </View>
                );
              })()
            ) : (
              <View
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: colors.background.card,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Tag size={17} color={colors.text.muted} />
              </View>
            )}
            <View className="flex-1">
              <Text size="xs" variant="muted">Categoria</Text>
              <Text size="sm" weight="medium"
                style={{ color: selectedCategory ? colors.text.primary : colors.text.muted }}>
                {selectedCategory ? selectedCategory.name : 'Selecionar categoria'}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.text.muted} />
          </Pressable>

          {/* Date */}
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: colors.background.surface,
              borderRadius: 14, padding: 14, marginBottom: 12,
              borderWidth: 1, borderColor: colors.border.DEFAULT,
            }}
            className="active:opacity-70"
          >
            <View
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: colors.accent.DEFAULT + '20',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Calendar size={17} color={colors.accent.DEFAULT} />
            </View>
            <View className="flex-1">
              <Text size="xs" variant="muted">Data da compra</Text>
              <Text size="sm" weight="medium">{formatDate(date)}</Text>
            </View>
            <ChevronRight size={16} color={colors.text.muted} />
          </Pressable>

          {/* Description */}
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: colors.background.surface,
              borderRadius: 14, padding: 14, marginBottom: 24,
              borderWidth: 1, borderColor: colors.border.DEFAULT,
            }}
          >
            <View
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: colors.background.card,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icons.FileText size={17} color={colors.text.muted} />
            </View>
            <View className="flex-1">
              <Text size="xs" variant="muted" className="mb-0.5">Descrição</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Amazon, iFood, Uber..."
                placeholderTextColor={colors.text.muted}
                maxLength={100}
                style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500', paddingVertical: 0 }}
              />
            </View>
          </View>

          <ActionButton
            label={isEditMode ? 'Salvar alterações' : 'Adicionar gasto'}
            icon={CreditCard}
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
          />
        </ScrollView>

        <DatePicker
          visible={showDatePicker}
          value={date}
          onConfirm={setDate}
          onClose={() => setShowDatePicker(false)}
        />
        <CategoryPickerModal
          visible={showCategoryPicker}
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
          onClose={() => setShowCategoryPicker(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
