import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Tag } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
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
