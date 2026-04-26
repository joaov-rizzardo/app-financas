import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { X, Calendar } from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PAD = Math.floor(VISIBLE_ITEMS / 2); // 2

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_ITEMS = Array.from({ length: 21 }, (_, i) => String(CURRENT_YEAR - 10 + i));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function parseDateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { day: d, month: m, year: y };
}

function buildISO(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── WheelItem ───────────────────────────────────────────────────────────────

function WheelItem({
  label,
  index,
  scrollY,
  onPress,
}: {
  label: string;
  index: number;
  scrollY: Animated.Value;
  onPress: () => void;
}) {
  const itemCenter = index * ITEM_HEIGHT;

  const opacity = scrollY.interpolate({
    inputRange: [
      itemCenter - 2.5 * ITEM_HEIGHT,
      itemCenter - ITEM_HEIGHT,
      itemCenter,
      itemCenter + ITEM_HEIGHT,
      itemCenter + 2.5 * ITEM_HEIGHT,
    ],
    outputRange: [0.08, 0.38, 1, 0.38, 0.08],
    extrapolate: 'clamp',
  });

  const scale = scrollY.interpolate({
    inputRange: [
      itemCenter - 1.4 * ITEM_HEIGHT,
      itemCenter,
      itemCenter + 1.4 * ITEM_HEIGHT,
    ],
    outputRange: [0.82, 1, 0.82],
    extrapolate: 'clamp',
  });

  return (
    <Pressable
      onPress={onPress}
      style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Text
          style={{
            fontSize: 18,
            color: colors.text.primary,
            fontFamily: 'Inter_400Regular',
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── WheelPicker ─────────────────────────────────────────────────────────────

interface WheelPickerProps {
  items: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  flex?: number;
}

function WheelPicker({ items, selectedIndex, onIndexChange, flex = 1 }: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  // useNativeDriver: false required — opacity/scale cannot run on native thread
  const scrollY = useRef(new Animated.Value(selectedIndex * ITEM_HEIGHT)).current;
  const isUserScrollingRef = useRef(false);
  // -1 sentinel so the mount scroll is never skipped (no valid index equals -1)
  const lastCommittedRef = useRef(-1);
  // Timer to distinguish slow-drag (no momentum follows) from fast-fling
  const dragEndTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const scrollToIndex = (index: number, animated: boolean) => {
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated });
    if (!animated) scrollY.setValue(index * ITEM_HEIGHT);
  };

  // Only reposition when selectedIndex changed externally (e.g. day clamped after month change).
  // Skip when the change echoes back our own commitIndex — that would snap the wheel mid-inertia.
  useEffect(() => {
    if (isUserScrollingRef.current) return;
    if (selectedIndex === lastCommittedRef.current) return;

    const t = setTimeout(() => {
      if (!isUserScrollingRef.current) scrollToIndex(selectedIndex, false);
    }, 80);
    return () => clearTimeout(t);
  }, [selectedIndex]);

  // Commit the nearest snapped index to state — never calls scrollTo so no loop
  const commitIndex = (rawY: number) => {
    const index = Math.max(0, Math.min(items.length - 1, Math.round(rawY / ITEM_HEIGHT)));
    lastCommittedRef.current = index;
    isUserScrollingRef.current = false;
    onIndexChange(index);
  };

  return (
    <View style={{ flex, height: PICKER_HEIGHT, overflow: 'hidden' }}>
      {/* Selection band */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: PAD * ITEM_HEIGHT,
          left: 5,
          right: 5,
          height: ITEM_HEIGHT,
          borderRadius: 12,
          backgroundColor: `${colors.primary.DEFAULT}1c`,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: `${colors.primary.DEFAULT}58`,
          zIndex: 2,
        }}
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PAD * ITEM_HEIGHT }}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          isUserScrollingRef.current = true;
          clearTimeout(dragEndTimer.current);
        }}
        onScrollEndDrag={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          // If momentum begins within 150 ms, the timer is cancelled there
          const y = e.nativeEvent.contentOffset.y;
          dragEndTimer.current = setTimeout(() => commitIndex(y), 150);
        }}
        onMomentumScrollBegin={() => {
          // Fast fling — cancel the slow-drag timer, momentum will commit
          clearTimeout(dragEndTimer.current);
        }}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          // snapToInterval already landed on the snap point; just read the position
          commitIndex(e.nativeEvent.contentOffset.y);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {items.map((label, i) => (
          <WheelItem
            key={i}
            label={label}
            index={i}
            scrollY={scrollY}
            onPress={() => {
              lastCommittedRef.current = i;
              isUserScrollingRef.current = false;
              onIndexChange(i);
              scrollToIndex(i, true);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

export interface DatePickerProps {
  visible: boolean;
  value: string;
  onConfirm: (iso: string) => void;
  onClose: () => void;
}

export function DatePicker({ visible, value, onConfirm, onClose }: DatePickerProps) {
  const translateY = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const { day: initDay, month: initMonth, year: initYear } = parseDateParts(value);
  const [day, setDay] = useState(initDay);
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);

  useEffect(() => {
    if (visible) {
      const { day: d, month: m, year: y } = parseDateParts(value);
      setDay(d);
      setMonth(m);
      setYear(y);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 280, friction: 26, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 500, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    const max = daysInMonth(month, year);
    if (day > max) setDay(max);
  }, [month, year]);

  const dayCount = daysInMonth(month, year);
  const DAY_ITEMS = Array.from({ length: dayCount }, (_, i) => String(i + 1).padStart(2, '0'));
  const dayIndex = Math.min(day - 1, dayCount - 1);
  const monthIndex = month - 1;
  const yearIndex = Math.max(0, YEAR_ITEMS.indexOf(String(year)));

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
          { opacity: backdropOpacity },
        ]}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <Animated.View
          style={[
            {
              backgroundColor: colors.background.elevated,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderTopWidth: 1,
              borderColor: colors.border.DEFAULT,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 36,
            },
            { transform: [{ translateY }] },
          ]}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: `${colors.primary.DEFAULT}22`,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Calendar size={17} color={colors.primary[400]} strokeWidth={1.75} />
              </View>
              <Text size="lg" weight="bold">Selecionar data</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="active:opacity-70"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: colors.background.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color={colors.text.secondary} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Column labels */}
          <View style={{ flexDirection: 'row', marginBottom: 4, paddingHorizontal: 10 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Label>Dia</Label>
            </View>
            <View style={{ flex: 2.5, alignItems: 'center' }}>
              <Label>Mês</Label>
            </View>
            <View style={{ flex: 1.5, alignItems: 'center' }}>
              <Label>Ano</Label>
            </View>
          </View>

          {/* Wheel container */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.background.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
            overflow: 'hidden',
            marginBottom: 24,
            paddingHorizontal: 4,
          }}>
            <WheelPicker
              items={DAY_ITEMS}
              selectedIndex={dayIndex}
              onIndexChange={(i) => setDay(i + 1)}
              flex={1}
            />
            <View style={{ width: 1, backgroundColor: colors.border.DEFAULT, marginVertical: 14 }} />
            <WheelPicker
              items={MONTH_NAMES}
              selectedIndex={monthIndex}
              onIndexChange={(i) => setMonth(i + 1)}
              flex={2.5}
            />
            <View style={{ width: 1, backgroundColor: colors.border.DEFAULT, marginVertical: 14 }} />
            <WheelPicker
              items={YEAR_ITEMS}
              selectedIndex={yearIndex}
              onIndexChange={(i) => setYear(parseInt(YEAR_ITEMS[i], 10))}
              flex={1.5}
            />
          </View>

          {/* Confirm */}
          <Pressable
            onPress={() => {
              onConfirm(buildISO(day, month, year));
              onClose();
            }}
            className="active:opacity-80"
            style={{
              height: 52,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary.DEFAULT,
              shadowColor: colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' }}>
              Confirmar
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
