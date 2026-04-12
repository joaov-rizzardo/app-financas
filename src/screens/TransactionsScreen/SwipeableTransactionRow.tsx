import * as React from 'react';
import { useRef } from 'react';
import { View, Pressable, Animated, PanResponder } from 'react-native';
import * as Icons from 'lucide-react-native';
import { Trash2, Tag } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { colors } from '@/constants/colors';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, Category } from '@/types/finance';

const SWIPE_THRESHOLD = 72;
const DELETE_ZONE_WIDTH = 80;

interface SwipeableTransactionRowProps {
  tx: Transaction;
  category: Category | undefined;
  isLast: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
}

export function SwipeableTransactionRow({
  tx,
  category,
  isLast,
  onEdit,
  onDeleteRequest,
}: SwipeableTransactionRowProps) {
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
          Animated.spring(translateX, {
            toValue: -DELETE_ZONE_WIDTH,
            useNativeDriver: true,
            tension: 200,
            friction: 20,
          }).start(() => {
            onDeleteRequest();
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 20,
          }).start();
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
        <View style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: DELETE_ZONE_WIDTH,
          backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
          borderRadius: 4,
        }}>
          <Trash2 size={20} color="#fff" strokeWidth={2} />
        </View>

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
