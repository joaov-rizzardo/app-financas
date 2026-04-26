import * as React from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { Card, CardHeader } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { colors } from '@/constants/colors';
import { formatCurrency } from '@/lib/utils';
import type { CategoryStat } from '@/hooks/useReports';

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, ro: number, ri: number, startDeg: number, endDeg: number): string {
  const sweep = endDeg - startDeg;
  if (sweep >= 359.99) {
    // Full circle — draw two half-arcs so SVG doesn't collapse it
    const top = polar(cx, cy, ro, 0);
    const bot = polar(cx, cy, ro, 180);
    const iTop = polar(cx, cy, ri, 0);
    const iBot = polar(cx, cy, ri, 180);
    return [
      `M ${top.x} ${top.y}`,
      `A ${ro} ${ro} 0 1 1 ${bot.x} ${bot.y}`,
      `A ${ro} ${ro} 0 1 1 ${top.x} ${top.y}`,
      `M ${iTop.x} ${iTop.y}`,
      `A ${ri} ${ri} 0 1 0 ${iBot.x} ${iBot.y}`,
      `A ${ri} ${ri} 0 1 0 ${iTop.x} ${iTop.y}`,
      'Z',
    ].join(' ');
  }
  const large = sweep > 180 ? 1 : 0;
  const os = polar(cx, cy, ro, startDeg);
  const oe = polar(cx, cy, ro, endDeg);
  const is = polar(cx, cy, ri, startDeg);
  const ie = polar(cx, cy, ri, endDeg);
  return [
    `M ${os.x} ${os.y}`,
    `A ${ro} ${ro} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${ri} ${ri} 0 ${large} 0 ${is.x} ${is.y}`,
    'Z',
  ].join(' ');
}

// ─── Components ───────────────────────────────────────────────────────────────

interface DonutChartProps {
  data: CategoryStat[];
  size: number;
}

function DonutChart({ data, size }: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const ro = size * 0.38;
  const ri = size * 0.24;
  const total = data.reduce((s, d) => s + d.amount, 0);

  let startDeg = 0;
  const slices = data.map((cat) => {
    const deg = (cat.amount / total) * 360;
    const path = slicePath(cx, cy, ro, ri, startDeg, startDeg + deg);
    startDeg += deg;
    return { path, color: cat.color };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <Path key={i} d={s.path} fill={s.color} opacity={0.9} />
      ))}
      {/* Center text */}
      <SvgText
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill={colors.text.muted}
        fontSize={10}
        fontWeight="600"
      >
        Total
      </SvgText>
      <SvgText
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill={colors.text.primary}
        fontSize={13}
        fontWeight="700"
      >
        {formatCurrency(total)}
      </SvgText>
    </Svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface DonutChartCardProps {
  data: CategoryStat[];
  isLoading: boolean;
  onCategoryPress?: (categoryId: string) => void;
}

export function DonutChartCard({ data, isLoading, onCategoryPress }: DonutChartCardProps) {
  const { width } = useWindowDimensions();
  const chartSize = Math.min(width - 80, 220);

  if (isLoading) {
    return (
      <View className="bg-background-surface border border-border rounded-2xl p-4 mb-4 h-48 opacity-40" />
    );
  }

  if (data.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <Text weight="semibold">Gastos por categoria</Text>
        </CardHeader>
        <View className="items-center py-8">
          <Text variant="muted" size="sm">Nenhuma despesa no período</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <Text weight="semibold">Gastos por categoria</Text>
      </CardHeader>

      {/* Donut */}
      <View className="items-center mb-5">
        <DonutChart data={data} size={chartSize} />
      </View>

      {/* Legend + list */}
      {data.map((cat, i) => (
        <View key={cat.categoryId}>
          <Pressable
            className="py-2.5 active:opacity-70"
            onPress={() => onCategoryPress?.(cat.categoryId)}
            disabled={!onCategoryPress}
          >
            <View className="flex-row justify-between items-center mb-1.5">
              <View className="flex-row items-center gap-2 flex-1">
                <View
                  style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: cat.color }}
                />
                <Text size="sm" weight="medium" numberOfLines={1} className="flex-1">
                  {cat.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text size="xs" variant="muted">{cat.pct}%</Text>
                <Text size="sm" weight="semibold">{formatCurrency(cat.amount)}</Text>
              </View>
            </View>
            <View className="h-1.5 bg-background-card rounded-full overflow-hidden">
              <View
                style={{
                  width: `${cat.pct}%`,
                  height: '100%',
                  backgroundColor: cat.color,
                  borderRadius: 999,
                  opacity: 0.85,
                }}
              />
            </View>
          </Pressable>
          {i < data.length - 1 && <Separator />}
        </View>
      ))}
    </Card>
  );
}
