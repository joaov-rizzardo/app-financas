import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import {
  ChevronLeft,
  Check,
  Plus,
  Calendar,
  Tag,
  ChevronDown,
  RefreshCw,
  CreditCard,
  X,
} from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { ActionButton } from '@/components/ui/ActionButton';
import { DatePicker } from '@/components/ui/DatePicker';
import { colors } from '@/constants/colors';
import { formatDate } from '@/lib/utils';
import type { Category, Transaction, TransactionType, Frequency } from '@/types/finance';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

function centsToAmount(cents: number): number {
  return cents / 100;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionFormScreenProps {
  transaction: Transaction | null;
  categories: Category[];
  onCreate: (data: Omit<Transaction, 'id' | 'createdAt'>, frequency?: Frequency) => Promise<void>;
  onUpdate: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => Promise<void>;
  onBack: () => void;
}

// ─── Category Picker Modal ────────────────────────────────────────────────────

function CategoryPickerModal({
  visible,
  categories,
  selectedId,
  transactionType,
  onSelect,
  onClose,
}: {
  visible: boolean;
  categories: Category[];
  selectedId: string;
  transactionType: TransactionType;
  onSelect: (cat: Category) => void;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const filtered = categories.filter((c) => c.type === transactionType);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 260, friction: 24, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 600, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end', opacity: backdropOpacity }}
      >
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <Animated.View
          style={{
            backgroundColor: colors.background.elevated,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderColor: colors.border.DEFAULT,
            maxHeight: '75%',
            transform: [{ translateY }],
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 }}>
            <Text size="lg" weight="bold">Selecionar categoria</Text>
            <Pressable onPress={onClose} className="active:opacity-70"
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background.card, alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color={colors.text.secondary} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36 }}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Tag size={32} color={colors.text.muted} strokeWidth={1.5} />
                <Text variant="muted" style={{ marginTop: 12, textAlign: 'center' }}>
                  Nenhuma categoria de {transactionType === 'income' ? 'receita' : 'despesa'}
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {filtered.map((cat) => {
                  const Icon = (Icons as unknown as Record<string, React.ElementType>)[cat.icon] ?? Icons.Tag;
                  const isSelected = cat.id === selectedId;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => { onSelect(cat); onClose(); }}
                      className="active:opacity-70"
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 8,
                        paddingHorizontal: 14, paddingVertical: 10,
                        borderRadius: 14, borderWidth: 1.5,
                        backgroundColor: isSelected ? cat.color + '25' : cat.color + '12',
                        borderColor: isSelected ? cat.color : cat.color + '50',
                      }}
                    >
                      <Icon size={16} color={cat.color} strokeWidth={1.75} />
                      <Text size="sm" weight={isSelected ? 'semibold' : 'normal'}
                        style={{ color: cat.color }}>
                        {cat.name}
                      </Text>
                      {isSelected && (
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
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon: React.ElementType;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="active:opacity-80"
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.background.elevated,
        borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: value ? colors.primary.DEFAULT + '60' : colors.border.DEFAULT,
      }}
    >
      <View style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: value ? colors.primary.DEFAULT + '20' : colors.background.card,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Icon size={18} color={value ? colors.primary[400] : colors.text.muted} strokeWidth={1.75} />
      </View>
      <Text size="sm" weight="medium" style={{ flex: 1 }}>{label}</Text>
      {/* pill toggle */}
      <View style={{
        width: 46, height: 26, borderRadius: 13,
        backgroundColor: value ? colors.primary.DEFAULT : colors.background.card,
        borderWidth: 1, borderColor: value ? colors.primary.DEFAULT : colors.border.DEFAULT,
        justifyContent: 'center', paddingHorizontal: 3,
      }}>
        <View style={{
          width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
          marginLeft: value ? 20 : 0,
        }} />
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function TransactionFormScreen({
  transaction,
  categories,
  onCreate,
  onUpdate,
  onBack,
}: TransactionFormScreenProps) {
  const isEditing = transaction !== null;

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [amountCents, setAmountCents] = useState(
    transaction ? Math.round(Math.abs(transaction.amount) * 100) : 0,
  );
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [date, setDate] = useState(transaction?.date ?? todayISO());
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring ?? false);
  const [frequency, setFrequency] = useState<Frequency>(
    (transaction as Transaction & { frequency?: Frequency })?.frequency ?? 'monthly',
  );
  const [isInstallment, setIsInstallment] = useState(
    !!transaction?.installmentTotal && transaction.installmentTotal > 1,
  );
  const [installmentTotal, setInstallmentTotal] = useState(
    String(transaction?.installmentTotal ?? 2),
  );
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const CategoryIcon = selectedCategory
    ? (Icons as unknown as Record<string, React.ElementType>)[selectedCategory.icon] ?? Icons.Tag
    : Tag;

  const handleAmountChange = (text: string) => {
    const cents = displayToCents(text);
    setAmountCents(cents);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    // clear category if it belongs to the other type
    if (selectedCategory && selectedCategory.type !== newType) {
      setCategoryId('');
    }
  };

  const handleSave = async () => {
    if (amountCents === 0) {
      Alert.alert('Atenção', 'Informe um valor para o lançamento.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Atenção', 'Selecione uma categoria.');
      return;
    }

    setLoading(true);
    try {
      const installments = isInstallment ? parseInt(installmentTotal, 10) || 2 : undefined;
      const payload: Omit<Transaction, 'id' | 'createdAt'> = {
        type,
        amount: centsToAmount(amountCents),
        categoryId,
        date,
        description: description.trim(),
        isRecurring: isRecurring && !isInstallment,
        installmentTotal: installments,
        installmentCurrent: isEditing ? transaction.installmentCurrent : installments ? 1 : undefined,
      };

      if (isEditing) {
        await onUpdate(transaction.id, payload);
      } else {
        await onCreate(payload, isRecurring && !isInstallment ? frequency : undefined);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido.';
      Alert.alert('Erro ao salvar', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <Pressable onPress={onBack} className="active:opacity-70"
            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.background.elevated, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: colors.border.DEFAULT }}>
            <ChevronLeft size={20} color={colors.text.primary} strokeWidth={2} />
          </Pressable>
          <Text size="xl" weight="bold">
            {isEditing ? 'Editar lançamento' : 'Novo lançamento'}
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type toggle */}
          <View style={{ marginBottom: 20 }}>
            <Label style={{ marginBottom: 10 }}>Tipo</Label>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => handleTypeChange('expense')}
                className="active:opacity-80"
                style={{
                  flex: 1, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: type === 'expense' ? colors.danger : colors.background.elevated,
                  borderWidth: 1.5,
                  borderColor: type === 'expense' ? colors.danger : colors.border.DEFAULT,
                }}
              >
                <Text size="sm" weight="semibold" style={{ color: type === 'expense' ? '#fff' : colors.text.secondary }}>
                  Despesa
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleTypeChange('income')}
                className="active:opacity-80"
                style={{
                  flex: 1, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: type === 'income' ? colors.success : colors.background.elevated,
                  borderWidth: 1.5,
                  borderColor: type === 'income' ? colors.success : colors.border.DEFAULT,
                }}
              >
                <Text size="sm" weight="semibold" style={{ color: type === 'income' ? '#fff' : colors.text.secondary }}>
                  Receita
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Amount */}
          <View style={{ marginBottom: 20 }}>
            <Label style={{ marginBottom: 10 }}>Valor</Label>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: colors.background.elevated,
              borderRadius: 13, borderWidth: 1.5,
              borderColor: amountCents > 0
                ? (type === 'income' ? colors.success + '80' : colors.danger + '80')
                : colors.border.DEFAULT,
              paddingHorizontal: 14,
            }}>
              <Text size="base" weight="semibold"
                style={{ color: colors.text.muted, marginRight: 6 }}>
                R$
              </Text>
              <TextInput
                value={parseCentsToDisplay(amountCents)}
                onChangeText={handleAmountChange}
                placeholder="0,00"
                placeholderTextColor={colors.text.muted}
                keyboardType="numeric"
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  fontSize: 20,
                  color: colors.text.primary,
                  fontFamily: 'Inter_700Bold',
                  fontWeight: '700',
                }}
              />
            </View>
          </View>

          {/* Category */}
          <View style={{ marginBottom: 20 }}>
            <Label style={{ marginBottom: 10 }}>Categoria</Label>
            <Pressable
              onPress={() => setShowCategoryPicker(true)}
              className="active:opacity-75"
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: colors.background.elevated,
                borderRadius: 13, borderWidth: 1.5,
                borderColor: selectedCategory ? selectedCategory.color + '70' : colors.border.DEFAULT,
                paddingHorizontal: 14, paddingVertical: 13,
              }}
            >
              <View style={{
                width: 32, height: 32, borderRadius: 9,
                backgroundColor: selectedCategory ? selectedCategory.color + '20' : colors.background.card,
                alignItems: 'center', justifyContent: 'center', marginRight: 10,
              }}>
                <CategoryIcon
                  size={16}
                  color={selectedCategory ? selectedCategory.color : colors.text.muted}
                  strokeWidth={1.75}
                />
              </View>
              <Text size="base" style={{ flex: 1, color: selectedCategory ? colors.text.primary : colors.text.muted }}>
                {selectedCategory ? selectedCategory.name : 'Selecionar categoria'}
              </Text>
              <ChevronDown size={16} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* Date */}
          <View style={{ marginBottom: 20 }}>
            <Label style={{ marginBottom: 10 }}>Data</Label>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="active:opacity-75"
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: colors.background.elevated,
                borderRadius: 13, borderWidth: 1.5, borderColor: colors.border.DEFAULT,
                paddingHorizontal: 14, paddingVertical: 14,
              }}
            >
              <Calendar size={18} color={colors.primary[400]} strokeWidth={1.75} style={{ marginRight: 10 }} />
              <Text size="base" style={{ flex: 1, color: colors.text.primary }}>
                {formatDate(date)}
              </Text>
              <ChevronDown size={16} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Label style={{ marginBottom: 10 }}>Descrição</Label>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Supermercado do mês"
              placeholderTextColor={colors.text.muted}
              maxLength={100}
              style={{
                backgroundColor: colors.background.elevated,
                borderRadius: 13, borderWidth: 1.5,
                borderColor: description.trim() ? colors.primary.DEFAULT + '50' : colors.border.DEFAULT,
                paddingHorizontal: 14, paddingVertical: 13,
                fontSize: 15, color: colors.text.primary,
                fontFamily: 'Inter_400Regular',
              }}
            />
          </View>

          <Separator style={{ marginBottom: 20, opacity: 0.4 }} />

          {/* Recurring toggle */}
          <View style={{ marginBottom: 12 }}>
            <ToggleRow
              label="É recorrente?"
              value={isRecurring}
              onChange={(v) => { setIsRecurring(v); if (v) setIsInstallment(false); }}
              icon={RefreshCw}
            />
          </View>

          {isRecurring && (
            <View style={{ marginBottom: 12, paddingLeft: 8 }}>
              <Label style={{ marginBottom: 10 }}>Frequência</Label>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['monthly', 'weekly'] as Frequency[]).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFrequency(f)}
                    className="active:opacity-80"
                    style={{
                      flex: 1, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: frequency === f ? colors.primary.DEFAULT + '20' : colors.background.elevated,
                      borderWidth: 1.5,
                      borderColor: frequency === f ? colors.primary.DEFAULT : colors.border.DEFAULT,
                    }}
                  >
                    <Text size="sm" weight="medium"
                      style={{ color: frequency === f ? colors.primary[400] : colors.text.secondary }}>
                      {f === 'monthly' ? 'Mensal' : 'Semanal'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Installment toggle */}
          <View style={{ marginBottom: 12 }}>
            <ToggleRow
              label="É parcelado?"
              value={isInstallment}
              onChange={(v) => { setIsInstallment(v); if (v) setIsRecurring(false); }}
              icon={CreditCard}
            />
          </View>

          {isInstallment && (
            <View style={{ marginBottom: 12, paddingLeft: 8 }}>
              <Label style={{ marginBottom: 10 }}>Número de parcelas</Label>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 16,
                backgroundColor: colors.background.elevated,
                borderRadius: 13, borderWidth: 1.5, borderColor: colors.border.DEFAULT,
                paddingHorizontal: 14,
              }}>
                <Pressable
                  onPress={() => setInstallmentTotal((v) => String(Math.max(2, parseInt(v, 10) - 1)))}
                  className="active:opacity-70"
                  style={{ padding: 12 }}
                >
                  <Text size="xl" weight="bold" style={{ color: colors.text.secondary }}>−</Text>
                </Pressable>
                <TextInput
                  value={installmentTotal}
                  onChangeText={(t) => setInstallmentTotal(t.replace(/\D/g, '') || '2')}
                  keyboardType="numeric"
                  style={{
                    flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700',
                    color: colors.text.primary, fontFamily: 'Inter_700Bold',
                    paddingVertical: 12,
                  }}
                />
                <Pressable
                  onPress={() => setInstallmentTotal((v) => String(Math.min(48, parseInt(v, 10) + 1)))}
                  className="active:opacity-70"
                  style={{ padding: 12 }}
                >
                  <Text size="xl" weight="bold" style={{ color: colors.text.secondary }}>+</Text>
                </Pressable>
              </View>
              {amountCents > 0 && (
                <Text size="xs" variant="muted" style={{ marginTop: 8, textAlign: 'center' }}>
                  {installmentTotal}× de {(centsToAmount(amountCents) / (parseInt(installmentTotal, 10) || 2)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} por mês
                </Text>
              )}
            </View>
          )}

          <View style={{ marginTop: 12 }}>
            <ActionButton
              label={isEditing ? 'Salvar alterações' : 'Adicionar lançamento'}
              icon={isEditing ? Check : Plus}
              loading={loading}
              loadingLabel="Salvando…"
              onPress={handleSave}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
        transactionType={type}
        onSelect={(cat) => setCategoryId(cat.id)}
        onClose={() => setShowCategoryPicker(false)}
      />
    </SafeAreaView>
  );
}
