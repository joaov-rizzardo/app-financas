import * as React from 'react';
import { useState, useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { Plus, Tag, Settings2, Trash2 } from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { Chip } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { colors } from '@/constants/colors';
import type { Category, TransactionType } from '@/types/finance';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoriesScreenProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onCreateNew: (type: TransactionType) => void;
  onDelete: (id: string) => Promise<void>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryCard({
  category,
  onEdit,
  onLongPress,
}: {
  category: Category;
  onEdit: () => void;
  onLongPress: () => void;
}) {
  const Icon =
    (Icons as unknown as Record<string, React.ElementType>)[category.icon] ?? Icons.Tag;

  return (
    <Pressable
      onPress={onEdit}
      onLongPress={onLongPress}
      className="active:opacity-70"
      style={{ width: '48%', marginBottom: 12 }}
    >
      <View
        style={{
          backgroundColor: colors.background.elevated,
          borderRadius: 18,
          padding: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border.DEFAULT,
        }}
      >
        {/* Icon container with layered glow */}
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: category.color + '18',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            borderWidth: 1,
            borderColor: category.color + '35',
          }}
        >
          <Icon size={26} color={category.color} strokeWidth={1.6} />
        </View>

        <Text size="sm" weight="semibold" className="text-center text-text-primary">
          {category.name}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyState({
  type,
  onCreateNew,
}: {
  type: TransactionType;
  onCreateNew: () => void;
}) {
  const label = type === 'income' ? 'receita' : 'despesa';

  return (
    <View style={{ alignItems: 'center', paddingVertical: 64 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: colors.background.elevated,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border.DEFAULT,
        }}
      >
        <Tag size={28} color={colors.text.muted} strokeWidth={1.5} />
      </View>
      <Text variant="muted" className="mb-1 text-center">
        Nenhuma categoria de {label}
      </Text>
      <Pressable onPress={onCreateNew} className="active:opacity-70 mt-3">
        <Text size="sm" className="text-primary-400">+ Criar categoria</Text>
      </Pressable>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CategoriesScreen({
  categories,
  isLoading,
  onEdit,
  onCreateNew,
  onDelete,
}: CategoriesScreenProps) {
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const { confirm, dialogProps } = useConfirmDialog();

  const filtered = useMemo(
    () => categories.filter((c) => c.type === activeType),
    [categories, activeType],
  );

  const handleLongPress = async (cat: Category) => {
    const CategoryIcon =
      (Icons as unknown as Record<string, React.ElementType>)[cat.icon] ?? Icons.Tag;

    const confirmed = await confirm({
      title: `Excluir "${cat.name}"?`,
      message: 'Esta categoria será removida permanentemente. Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir categoria',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      icon: <CategoryIcon size={28} color={colors.danger} strokeWidth={1.75} />,
    });

    if (confirmed) {
      await onDelete(cat.id);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-6 pb-4">
        <View>
          <Label className="mb-0.5">Gestão</Label>
          <Text size="2xl" weight="bold">Categorias</Text>
        </View>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.background.elevated,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
          }}
        >
          <Settings2 size={18} color={colors.text.secondary} strokeWidth={1.75} />
        </View>
      </View>

      {/* Type tabs */}
      <View className="flex-row gap-2 px-4 mb-5">
        <Chip
          label="Despesas"
          selected={activeType === 'expense'}
          onPress={() => setActiveType('expense')}
        />
        <Chip
          label="Receitas"
          selected={activeType === 'income'}
          onPress={() => setActiveType('income')}
        />
      </View>

      {/* Category grid */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text variant="muted">Carregando categorias…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            type={activeType}
            onCreateNew={() => onCreateNew(activeType)}
          />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {filtered.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onEdit={() => onEdit(cat)}
                onLongPress={() => handleLongPress(cat)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => onCreateNew(activeType)}
        className="active:opacity-80"
        style={{
          position: 'absolute',
          bottom: 28,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary.DEFAULT,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.primary.DEFAULT,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          elevation: 10,
        }}
      >
        <Plus size={26} color="white" strokeWidth={2} />
      </Pressable>

      {/* Confirm delete dialog */}
      <ConfirmDialog {...dialogProps} />
    </SafeAreaView>
  );
}
