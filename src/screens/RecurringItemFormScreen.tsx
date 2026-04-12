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
  Tag,
  ChevronRight,
  Check,
  RefreshCw,
  Layers,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/constants/colors';
import type { Category, RecurringItem, Frequency } from '@/types/finance';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function isInstallmentItem(item: RecurringItem): boolean {
  return !!item.installmentTotal && item.installmentTotal > 1;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RecurringItemFormScreenProps {
  item: RecurringItem;
  categories: Category[];
  onSave: (id: string, data: Pick<RecurringItem, 'description' | 'amount' | 'categoryId' | 'frequency'>) => Promise<void>;
  onBack: () => void;
}

// ─── CategoryPickerModal ──────────────────────────────────────────────────────

function CategoryPickerModal({
  visible,
  categories,
  selectedId,
  itemType,
  onSelect,
  onClose,
}: {
  visible: boolean;
  categories: Category[];
  selectedId: string;
  itemType: 'income' | 'expense';
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

  const filteredCategories = categories.filter((c) => c.type === itemType);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={{ flex: 1, backgroundColor: '#000', opacity: backdropOpacity }}
        onTouchEnd={onClose}
      />
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          backgroundColor: colors.background.elevated,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: 20, paddingBottom: 36, maxHeight: '70%',
          transform: [{ translateY }],
        }}
      >
        <Text weight="semibold" size="base" className="mb-4 text-center">Categoria</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap gap-2 pb-2">
            {filteredCategories.map((cat) => {
              const Icon = (Icons as unknown as Record<string, React.ElementType>)[cat.icon] ?? Tag;
              const selected = cat.id === selectedId;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => { onSelect(cat.id); onClose(); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
                    backgroundColor: selected ? cat.color + '30' : colors.background.card,
                    borderWidth: 1,
                    borderColor: selected ? cat.color : colors.border.DEFAULT,
                  }}
                  className="active:opacity-70"
                >
                  <Icon size={15} color={cat.color} />
                  <Text size="sm" weight={selected ? 'semibold' : 'medium'}
                    style={{ color: selected ? cat.color : colors.text.secondary }}>
                    {cat.name}
                  </Text>
                  {selected && <Check size={13} color={cat.color} />}
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

const FREQUENCIES: { key: Frequency; label: string; description: string }[] = [
  { key: 'monthly', label: 'Mensal', description: 'Gerado uma vez por mês' },
  { key: 'weekly', label: 'Semanal', description: 'Gerado uma vez por semana' },
];

export function RecurringItemFormScreen({
  item,
  categories,
  onSave,
  onBack,
}: RecurringItemFormScreenProps) {
  const isInstallment = isInstallmentItem(item);
  const isIncome = item.type === 'income';

  const initialCents = Math.round(item.amount * 100);
  const [amountCents, setAmountCents] = useState(initialCents);
  const [amountDisplay, setAmountDisplay] = useState(parseCentsToDisplay(initialCents));
  const [description, setDescription] = useState(item.description);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [frequency, setFrequency] = useState<Frequency>(item.frequency);
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const amountColor = isIncome ? colors.success : colors.danger;
  const TypeIcon = isInstallment ? Layers : isIncome ? TrendingUp : TrendingDown;
  const typeColor = isInstallment ? colors.warning : isIncome ? colors.success : colors.primary[400];
  const typeLabel = isInstallment ? 'Parcelado' : isIncome ? 'Receita recorrente' : 'Despesa recorrente';

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
      await onSave(item.id, {
        description: description.trim(),
        amount: amountCents / 100,
        categoryId,
        frequency,
      });
    } finally {
      setLoading(false);
    }
  }

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
            <Label>Editar</Label>
            <Text size="xl" weight="bold" className="mt-0.5">{typeLabel}</Text>
          </View>
          <View style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: typeColor + '20',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <TypeIcon size={18} color={typeColor} strokeWidth={2} />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Installment info badge */}
          {isInstallment && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: colors.warning + '12', borderRadius: 14,
              borderWidth: 1, borderColor: colors.warning + '30',
              padding: 14, marginBottom: 16,
            }}>
              <Layers size={16} color={colors.warning} strokeWidth={1.75} />
              <Text size="xs" style={{ color: colors.warning, flex: 1 }}>
                Parcela {item.installmentCurrent ?? 1} de {item.installmentTotal} · Alterar o valor afeta apenas os próximos lançamentos.
              </Text>
            </View>
          )}

          {/* Amount */}
          <View style={{
            backgroundColor: colors.background.elevated,
            borderRadius: 20, padding: 20, marginBottom: 16,
            borderWidth: 1, borderColor: colors.border.DEFAULT,
            alignItems: 'center',
          }}>
            <Label className="mb-2">Valor</Label>
            <View className="flex-row items-center gap-2">
              <Text size="2xl" weight="bold" style={{ color: amountColor }}>R$</Text>
              <TextInput
                value={amountDisplay}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor={colors.text.muted}
                style={{
                  color: amountColor,
                  fontSize: 36,
                  fontWeight: '800',
                  minWidth: 80,
                  paddingVertical: 0,
                }}
              />
            </View>
          </View>

          {/* Frequency selector — hidden for installments */}
          {!isInstallment && (
            <View style={{
              backgroundColor: colors.background.surface,
              borderRadius: 16, marginBottom: 16,
              borderWidth: 1, borderColor: colors.border.DEFAULT,
              overflow: 'hidden',
            }}>
              {FREQUENCIES.map((f, idx) => {
                const selected = frequency === f.key;
                return (
                  <React.Fragment key={f.key}>
                    {idx > 0 && <Separator />}
                    <Pressable
                      onPress={() => setFrequency(f.key)}
                      style={{
                        flexDirection: 'row', alignItems: 'center',
                        paddingHorizontal: 16, paddingVertical: 14, gap: 12,
                        backgroundColor: selected ? colors.primary.DEFAULT + '10' : 'transparent',
                      }}
                      className="active:opacity-70"
                    >
                      <View style={{
                        width: 36, height: 36, borderRadius: 10,
                        backgroundColor: selected ? colors.primary.DEFAULT + '25' : colors.background.card,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: selected ? colors.primary.DEFAULT + '50' : colors.border.DEFAULT,
                      }}>
                        <RefreshCw size={15} color={selected ? colors.primary[400] : colors.text.muted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text size="sm" weight={selected ? 'semibold' : 'medium'}
                          style={{ color: selected ? colors.primary[300] : colors.text.primary }}>
                          {f.label}
                        </Text>
                        <Text size="xs" variant="muted">{f.description}</Text>
                      </View>
                      <View style={{
                        width: 20, height: 20, borderRadius: 10,
                        borderWidth: 2,
                        borderColor: selected ? colors.primary.DEFAULT : colors.border.DEFAULT,
                        backgroundColor: selected ? colors.primary.DEFAULT : 'transparent',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {selected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                      </View>
                    </Pressable>
                  </React.Fragment>
                );
              })}
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
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: selectedCategory.color + '25',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={17} color={selectedCategory.color} />
                  </View>
                );
              })()
            ) : (
              <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: colors.background.card,
                alignItems: 'center', justifyContent: 'center',
              }}>
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

          {/* Description */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: colors.background.surface,
            borderRadius: 14, padding: 14, marginBottom: 24,
            borderWidth: 1, borderColor: colors.border.DEFAULT,
          }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: colors.background.card,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icons.FileText size={17} color={colors.text.muted} />
            </View>
            <View className="flex-1">
              <Text size="xs" variant="muted" className="mb-0.5">Descrição</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Salário, Netflix, Aluguel..."
                placeholderTextColor={colors.text.muted}
                maxLength={100}
                style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500', paddingVertical: 0 }}
              />
            </View>
          </View>

          <ActionButton
            label="Salvar alterações"
            icon={isInstallment ? Layers : RefreshCw}
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
          />
        </ScrollView>

        <CategoryPickerModal
          visible={showCategoryPicker}
          categories={categories}
          selectedId={categoryId}
          itemType={item.type}
          onSelect={setCategoryId}
          onClose={() => setShowCategoryPicker(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
