import * as React from 'react';
import { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { ChevronLeft, Check, Plus } from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from '@/constants/colors';
import type { Category, TransactionType } from '@/types/finance';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  '#10b981', '#06b6d4', '#7c3aed', '#f59e0b',
  '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6',
  '#f97316', '#14b8a6', '#84cc16', '#fb7185',
  '#38bdf8', '#d946ef', '#a78bfa', '#a0a0b8',
];

const CATEGORY_ICONS = [
  'Utensils',    'ShoppingCart', 'Car',          'Heart',    'Home',        'BookOpen',
  'Gamepad2',    'Plane',        'Music',         'Coffee',   'Shirt',       'Zap',
  'Wifi',        'Smartphone',   'Baby',          'Dumbbell', 'ShoppingBag', 'Package',
  'Bus',         'Ticket',       'Film',          'Pizza',    'Briefcase',   'Code2',
  'TrendingUp',  'Gift',         'Coins',         'PiggyBank','Building2',   'Tag',
  'Scissors',    'PawPrint',         'Globe',         'Wallet',   'GlassWater',  'Layers',
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoryFormScreenProps {
  category: Category | null;
  defaultType: TransactionType;
  onCreate: (data: Omit<Category, 'id'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Omit<Category, 'id'>>) => Promise<void>;
  onBack: () => void;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CategoryFormScreen({
  category,
  defaultType,
  onCreate,
  onUpdate,
  onBack,
}: CategoryFormScreenProps) {
  const isEditing = category !== null;

  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType);
  const [selectedColor, setSelectedColor] = useState(
    category?.color ?? CATEGORY_COLORS[0],
  );
  const [selectedIcon, setSelectedIcon] = useState(
    category?.icon ?? CATEGORY_ICONS[0],
  );
  const [loading, setLoading] = useState(false);

  const PreviewIcon =
    (Icons as unknown as Record<string, React.ElementType>)[selectedIcon] ?? Icons.Tag;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Informe um nome para a categoria.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        color: selectedColor,
        icon: selectedIcon,
      };
      if (isEditing) {
        await onUpdate(category.id, payload);
      } else {
        await onCreate(payload);
      }
    } catch (err) {
      console.error('[CategoryForm] save error:', err);
      const message =
        err instanceof Error ? err.message : 'Erro desconhecido.';
      Alert.alert('Erro ao salvar', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-3">
          <Pressable
            onPress={onBack}
            className="active:opacity-70"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.background.elevated,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              borderWidth: 1,
              borderColor: colors.border.DEFAULT,
            }}
          >
            <ChevronLeft size={20} color={colors.text.primary} strokeWidth={2} />
          </Pressable>
          <Text size="xl" weight="bold">
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon preview */}
          <View style={{ alignItems: 'center', paddingVertical: 28 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 26,
                backgroundColor: selectedColor + '20',
                borderWidth: 2,
                borderColor: selectedColor + '50',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <PreviewIcon size={40} color={selectedColor} strokeWidth={1.5} />
            </View>
            <Text size="lg" weight="semibold" variant={name.trim() ? 'default' : 'muted'}>
              {name.trim() || 'Nome da categoria'}
            </Text>
          </View>

          <Separator className="mb-6 opacity-40" />

          {/* Type selector */}
          <View className="mb-6">
            <Label className="mb-3">Tipo</Label>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setType('expense')}
                className="active:opacity-80"
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    type === 'expense' ? colors.danger : colors.background.elevated,
                  borderWidth: 1.5,
                  borderColor:
                    type === 'expense' ? colors.danger : colors.border.DEFAULT,
                }}
              >
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ color: type === 'expense' ? '#fff' : colors.text.secondary }}
                >
                  Despesa
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setType('income')}
                className="active:opacity-80"
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    type === 'income' ? colors.success : colors.background.elevated,
                  borderWidth: 1.5,
                  borderColor:
                    type === 'income' ? colors.success : colors.border.DEFAULT,
                }}
              >
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ color: type === 'income' ? '#fff' : colors.text.secondary }}
                >
                  Receita
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Name input */}
          <View className="mb-6">
            <Label className="mb-3">Nome</Label>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Alimentação"
              placeholderTextColor={colors.text.muted}
              maxLength={30}
              style={{
                backgroundColor: colors.background.elevated,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: name.trim()
                  ? selectedColor + '70'
                  : colors.border.DEFAULT,
                paddingHorizontal: 14,
                paddingVertical: 13,
                fontSize: 16,
                color: colors.text.primary,
                fontFamily: 'Inter_400Regular',
              }}
            />
          </View>

          {/* Color picker */}
          <View className="mb-6">
            <Label className="mb-3">Cor</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CATEGORY_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className="active:opacity-80"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: selectedColor === color ? 3 : 0,
                    borderColor: '#fff',
                    shadowColor: selectedColor === color ? color : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.7,
                    shadowRadius: 6,
                    elevation: selectedColor === color ? 6 : 0,
                  }}
                >
                  {selectedColor === color && (
                    <Check size={16} color="#fff" strokeWidth={2.5} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Icon picker */}
          <View className="mb-8">
            <Label className="mb-3">Ícone</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORY_ICONS.map((iconName) => {
                const IconComponent =
                  (Icons as unknown as Record<string, React.ElementType>)[iconName] ?? Icons.Tag;
                const isSelected = selectedIcon === iconName;
                return (
                  <Pressable
                    key={iconName}
                    onPress={() => setSelectedIcon(iconName)}
                    className="active:opacity-70"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? selectedColor + '22'
                        : colors.background.elevated,
                      borderWidth: 1.5,
                      borderColor: isSelected
                        ? selectedColor
                        : colors.border.DEFAULT,
                    }}
                  >
                    <IconComponent
                      size={22}
                      color={isSelected ? selectedColor : colors.text.secondary}
                      strokeWidth={1.75}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Save button */}
          <ActionButton
            label={isEditing ? 'Salvar alterações' : 'Criar categoria'}
            icon={isEditing ? Check : Plus}
            loading={loading}
            onPress={handleSave}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
