import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';
import * as Icons from 'lucide-react-native';
import { Plus, X, TrendingUp } from 'lucide-react-native';
import { Card, CardHeader } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryTrend } from '@/hooks/useCategoryTrend';
import type { Category } from '@/types/finance';
import type { CategoryLineStat } from '@/hooks/useCategoryTrend';

// ─── Constants ────────────────────────────────────────────────────────────────

type PeriodMonths = 3 | 6 | 12;

const STORAGE_KEY = 'reports_category_comparison_ids';
const POINT_SPACING = 56;
const H_PAD = 50;
const R_PAD = 16;
const V_PAD_TOP = 64;
const PLOT_H = 140;
const V_PAD_BTM = 12;
const LABEL_H = 20;
const SVG_HEIGHT = V_PAD_TOP + PLOT_H + V_PAD_BTM + LABEL_H;
const TIP_W = 136;
const TIP_H = 54;

const DASH_PATTERNS: (string | undefined)[] = [
  undefined,
  '7 3',
  '2 3',
  '8 3 2 3',
  '6 3 2 3 2 3',
];

const PERIOD_OPTIONS: { value: PeriodMonths; label: string }[] = [
  { value: 3, label: '3m' },
  { value: 6, label: '6m' },
  { value: 12, label: '12m' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipState {
  svgX: number;
  svgY: number;
  categoryName: string;
  categoryColor: string;
  label: string;
  amount: number;
}

// ─── Category bottom sheet ────────────────────────────────────────────────────

function CategorySheet({
  visible,
  categories,
  selectedIds,
  onToggle,
  onClose,
}: {
  visible: boolean;
  categories: Category[];
  selectedIds: string[];
  onToggle: (cat: Category) => void;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(700)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 260, friction: 24, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 700, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

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
            <View>
              <Text size="lg" weight="bold">Selecionar categorias</Text>
              <Text size="xs" variant="muted" style={{ marginTop: 2 }}>
                {selectedIds.length} selecionada{selectedIds.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="active:opacity-70"
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background.card, alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={16} color={colors.text.secondary} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36 }}
            showsVerticalScrollIndicator={false}
          >
            {expenseCategories.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text variant="muted" style={{ textAlign: 'center' }}>
                  Nenhuma categoria de despesa encontrada
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {expenseCategories.map((cat) => {
                  const Icon = (Icons as unknown as Record<string, React.ElementType>)[cat.icon] ?? Icons.Tag;
                  const isSelected = selectedIds.includes(cat.id);
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => onToggle(cat)}
                      className="active:opacity-70"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 14,
                        borderWidth: 1.5,
                        backgroundColor: isSelected ? cat.color + '22' : colors.background.card,
                        borderColor: isSelected ? cat.color : colors.border.DEFAULT,
                      }}
                    >
                      <Icon size={16} color={isSelected ? cat.color : colors.text.secondary} strokeWidth={1.75} />
                      <Text
                        size="sm"
                        weight={isSelected ? 'semibold' : 'normal'}
                        style={{ color: isSelected ? cat.color : colors.text.primary }}
                      >
                        {cat.name}
                      </Text>
                      {isSelected && <X size={11} color={cat.color} strokeWidth={2.5} />}
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

// ─── Multi-line SVG chart ─────────────────────────────────────────────────────

function MultiLineChart({
  lines,
  tooltip,
  onPointPress,
  onChartPress,
}: {
  lines: CategoryLineStat[];
  tooltip: TooltipState | null;
  onPointPress: (state: TooltipState) => void;
  onChartPress: () => void;
}) {
  const monthCount = lines[0]?.points.length ?? 6;
  const plotWidth = H_PAD + R_PAD + (monthCount - 1) * POINT_SPACING;

  const allAmounts = lines.flatMap((l) => l.points.map((p) => p.amount));
  const maxVal = Math.max(...allAmounts, 1);

  const toY = (val: number) =>
    V_PAD_TOP + PLOT_H * (1 - val / maxVal);

  const gridFracs = [0.25, 0.5, 0.75, 1.0];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Pressable onPress={onChartPress}>
        <Svg width={plotWidth} height={SVG_HEIGHT}>
          {/* Grid lines */}
          {gridFracs.map((frac) => {
            const y = V_PAD_TOP + PLOT_H * (1 - frac);
            return (
              <React.Fragment key={frac}>
                <Line
                  x1={H_PAD}
                  y1={y}
                  x2={plotWidth - R_PAD}
                  y2={y}
                  stroke={colors.border.DEFAULT}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={H_PAD - 4}
                  y={y + 4}
                  fontSize={8}
                  fill={colors.text.muted}
                  textAnchor="end"
                >
                  {formatCurrencyCompact(maxVal * frac)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Lines — rendered first, below dots */}
          {lines.map((line, lineIdx) => {
            const pts = line.points.map((p, i) => ({
              ...p,
              x: H_PAD + i * POINT_SPACING,
              y: toY(p.amount),
            }));
            const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            const dash = DASH_PATTERNS[lineIdx % DASH_PATTERNS.length];
            return (
              <Path
                key={line.categoryId}
                d={pathD}
                stroke={line.color}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dash}
              />
            );
          })}

          {/* Dots — rendered on top so touch targets work */}
          {lines.map((line) =>
            line.points.map((p, i) => {
              const x = H_PAD + i * POINT_SPACING;
              const y = toY(p.amount);
              return (
                <Circle
                  key={`${line.categoryId}-${p.month}`}
                  cx={x}
                  cy={y}
                  r={5}
                  fill={colors.background.surface}
                  stroke={line.color}
                  strokeWidth={2}
                  onPress={() =>
                    onPointPress({
                      svgX: x,
                      svgY: y,
                      categoryName: line.name,
                      categoryColor: line.color,
                      label: p.label,
                      amount: p.amount,
                    })
                  }
                />
              );
            })
          )}

          {/* X-axis labels */}
          {lines[0]?.points.map((p, i) => (
            <SvgText
              key={p.month}
              x={H_PAD + i * POINT_SPACING}
              y={V_PAD_TOP + PLOT_H + V_PAD_BTM + LABEL_H - 4}
              fontSize={9}
              fill={colors.text.muted}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          ))}

          {/* Tooltip */}
          {tooltip && (() => {
            const above = tooltip.svgY > V_PAD_TOP + TIP_H + 12;
            const tipY = above ? tooltip.svgY - TIP_H - 10 : tooltip.svgY + 10;
            const tipX = Math.min(
              Math.max(tooltip.svgX - TIP_W / 2, H_PAD),
              plotWidth - R_PAD - TIP_W,
            );
            return (
              <G>
                <Rect
                  x={tipX}
                  y={tipY}
                  width={TIP_W}
                  height={TIP_H}
                  rx={8}
                  fill={colors.background.elevated}
                  stroke={tooltip.categoryColor}
                  strokeWidth={1}
                />
                <SvgText x={tipX + 10} y={tipY + 16} fontSize={9} fill={colors.text.secondary}>
                  {tooltip.categoryName}
                </SvgText>
                <SvgText x={tipX + 10} y={tipY + 33} fontSize={12} fill={tooltip.categoryColor} fontWeight="600">
                  {formatCurrency(tooltip.amount)}
                </SvgText>
                <SvgText x={tipX + 10} y={tipY + 47} fontSize={8} fill={colors.text.muted}>
                  {tooltip.label}
                </SvgText>
              </G>
            );
          })()}
        </Svg>
      </Pressable>
    </ScrollView>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function ChartLegend({ lines }: { lines: CategoryLineStat[] }) {
  if (lines.length === 0) return null;
  return (
    <View className="flex-row flex-wrap gap-x-4 gap-y-1.5 mt-3">
      {lines.map((line, idx) => {
        const dash = DASH_PATTERNS[idx % DASH_PATTERNS.length];
        return (
          <View key={line.categoryId} className="flex-row items-center gap-1.5">
            <View style={{ width: 16, height: 2, backgroundColor: line.color, opacity: dash ? 0.7 : 1 }} />
            <Text size="xs" variant="muted">{line.name}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function CategoryComparisonCard() {
  const [periodMonths, setPeriodMonths] = useState<PeriodMonths>(6);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  const { categories } = useCategories();
  const { lines, isLoading, isError } = useCategoryTrend(selectedIds, periodMonths);

  // Load persisted selection on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      try {
        const parsed: string[] = val ? JSON.parse(val) : [];
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedIds(parsed);
      } catch { /* ignore */ }
      setStorageReady(true);
    });
  }, []);

  // Persist selection changes (only after storage is loaded)
  useEffect(() => {
    if (!storageReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds, storageReady]);

  const toggleCategory = useCallback((cat: Category) => {
    setSelectedIds((prev) =>
      prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id],
    );
    setTooltip(null);
  }, []);

  const removeCategory = useCallback((catId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== catId));
    setTooltip(null);
  }, []);

  const hasEnough = selectedIds.length >= 1;

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row justify-between items-start">
          <View>
            <Text weight="semibold">Comparação por categoria</Text>
            <Text size="xs" variant="muted" className="mt-0.5">
              Despesas ao longo do tempo
            </Text>
          </View>

          <View
            className="flex-row rounded-xl p-0.5"
            style={{ backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.DEFAULT }}
          >
            {PERIOD_OPTIONS.map(({ value, label }) => {
              const active = periodMonths === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => { setPeriodMonths(value); setTooltip(null); }}
                  className={`px-2.5 py-1 rounded-lg items-center ${active ? 'bg-primary' : ''}`}
                >
                  <Text
                    size="xs"
                    weight={active ? 'semibold' : 'normal'}
                    className={active ? 'text-white' : 'text-text-muted'}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </CardHeader>

      {/* Selected category chips */}
      {selectedIds.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
        >
          {selectedIds.map((id) => {
            const cat = categories.find((c) => c.id === id);
            if (!cat) return null;
            return (
              <Pressable
                key={id}
                onPress={() => removeCategory(id)}
                className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5 active:opacity-70"
                style={{
                  backgroundColor: cat.color + '22',
                  borderWidth: 1,
                  borderColor: cat.color + '66',
                }}
              >
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <Text size="xs" weight="medium" style={{ color: cat.color }}>
                  {cat.name}
                </Text>
                <X size={10} color={cat.color} strokeWidth={2.5} />
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Add category button */}
      <Pressable
        onPress={() => setSheetVisible(true)}
        className="flex-row items-center gap-2 self-start mb-4 active:opacity-70"
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.primary.DEFAULT + '55',
          backgroundColor: colors.primary.DEFAULT + '11',
        }}
      >
        <Plus size={14} color={colors.primary[400]} strokeWidth={2} />
        <Text size="xs" weight="medium" style={{ color: colors.primary[400] }}>
          Adicionar categoria
        </Text>
      </Pressable>

      {/* Chart area */}
      {!hasEnough ? (
        <View className="items-center py-10 gap-3">
          <TrendingUp size={44} color={colors.text.muted} strokeWidth={1.25} />
          <Text variant="muted" size="sm" className="text-center">
            Selecione categorias para comparar
          </Text>
          <Text variant="muted" size="xs" className="text-center px-6">
            Escolha categorias de despesa para comparar
          </Text>
        </View>
      ) : isError ? (
        <View className="items-center py-10 gap-2">
          <Text variant="muted" size="sm" className="text-center">
            Erro ao carregar dados. Tente novamente.
          </Text>
        </View>
      ) : isLoading ? (
        <View
          className="rounded-xl opacity-40"
          style={{ height: SVG_HEIGHT, backgroundColor: colors.background.card }}
        />
      ) : (
        <>
          <MultiLineChart
            lines={lines}
            tooltip={tooltip}
            onPointPress={setTooltip}
            onChartPress={() => setTooltip(null)}
          />
          <ChartLegend lines={lines} />
        </>
      )}

      <CategorySheet
        visible={sheetVisible}
        categories={categories}
        selectedIds={selectedIds}
        onToggle={toggleCategory}
        onClose={() => setSheetVisible(false)}
      />
    </Card>
  );
}
