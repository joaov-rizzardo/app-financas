import * as React from 'react';
import { useState, useMemo } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Card, CardHeader } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { cn, formatCurrencyCompact } from '@/lib/utils';
import { colors } from '@/constants/colors';
import type { MonthStat } from '@/hooks/useReports';

const CHART_HEIGHT = 140;
const LABEL_HEIGHT = 22;
const SVG_HEIGHT = CHART_HEIGHT + LABEL_HEIGHT;
const H_PAD = 42;
const V_PAD = 10;
const BAR_GAP = 3;
const GROUP_PADDING = 0.28;

type FilterPeriod = '3M' | '6M' | '12M';

const FILTERS: { label: FilterPeriod; months: number }[] = [
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '12M', months: 12 },
];

export interface IncomeExpenseChartCardProps {
  data: MonthStat[];
  isLoading: boolean;
}

export function IncomeExpenseChartCard({ data, isLoading }: IncomeExpenseChartCardProps) {
  const [filter, setFilter] = useState<FilterPeriod>('6M');
  const { width } = useWindowDimensions();
  const svgWidth = width - 64;
  const plotWidth = svgWidth - H_PAD * 2;

  const filtered = useMemo(() => {
    const months = FILTERS.find((f) => f.label === filter)!.months;
    return data.slice(-months);
  }, [data, filter]);

  if (isLoading) {
    return <View className="bg-background-surface border border-border rounded-2xl p-4 mb-4 h-52 opacity-40" />;
  }

  const maxVal = Math.max(...filtered.map((d) => Math.max(d.income, d.expense)), 1);
  const plotHeight = CHART_HEIGHT - V_PAD * 2;
  const baseY = V_PAD + plotHeight;
  const toH = (val: number) => (val / maxVal) * plotHeight;

  const n = filtered.length || 1;
  const groupWidth = plotWidth / n;
  const innerWidth = groupWidth * (1 - GROUP_PADDING);
  const barWidth = (innerWidth - BAR_GAP) / 2;
  const groupOffset = (groupWidth - innerWidth) / 2;

  const ticks = [0, maxVal * 0.5, maxVal];

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row justify-between items-center flex-1">
          <Text weight="semibold">Receitas vs Despesas</Text>
          <View className="flex-row gap-1">
            {FILTERS.map(({ label }) => (
              <Pressable
                key={label}
                onPress={() => setFilter(label)}
                className={cn(
                  'px-2.5 py-1 rounded-full',
                  filter === label ? 'bg-primary' : 'bg-background-card',
                )}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  className={filter === label ? 'text-white' : 'text-text-muted'}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </CardHeader>

      {filtered.length === 0 ? (
        <View className="items-center py-8">
          <Text variant="muted" size="sm">Sem dados no período</Text>
        </View>
      ) : (
        <>
          <Svg width={svgWidth} height={SVG_HEIGHT}>
            <Defs>
              <LinearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.success} stopOpacity={1} />
                <Stop offset="100%" stopColor={colors.success} stopOpacity={0.6} />
              </LinearGradient>
              <LinearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.danger} stopOpacity={1} />
                <Stop offset="100%" stopColor={colors.danger} stopOpacity={0.6} />
              </LinearGradient>
            </Defs>

            {ticks.map((tick, i) => {
              const y = baseY - toH(tick);
              return (
                <React.Fragment key={i}>
                  <Line
                    x1={H_PAD}
                    y1={y}
                    x2={svgWidth - H_PAD}
                    y2={y}
                    stroke={colors.border.DEFAULT}
                    strokeWidth={i === 0 ? 1 : 0.5}
                    strokeDasharray={i === 0 ? undefined : '3 4'}
                  />
                  {i > 0 && (
                    <SvgText
                      x={H_PAD - 5}
                      y={y + 3}
                      fontSize={8}
                      fill={colors.text.muted}
                      textAnchor="end"
                    >
                      {formatCurrencyCompact(tick)}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}

            {filtered.map((d, i) => {
              const gx = H_PAD + i * groupWidth + groupOffset;
              const incH = Math.max(toH(d.income), 2);
              const expH = Math.max(toH(d.expense), 2);
              const centerX = gx + barWidth + BAR_GAP / 2;

              return (
                <React.Fragment key={d.month}>
                  <Rect
                    x={gx}
                    y={baseY - incH}
                    width={barWidth}
                    height={incH}
                    rx={3}
                    ry={3}
                    fill="url(#incGrad)"
                  />
                  <Rect
                    x={gx + barWidth + BAR_GAP}
                    y={baseY - expH}
                    width={barWidth}
                    height={expH}
                    rx={3}
                    ry={3}
                    fill="url(#expGrad)"
                  />
                  <SvgText
                    x={centerX}
                    y={baseY + LABEL_HEIGHT - 4}
                    fontSize={9}
                    fill={colors.text.muted}
                    textAnchor="middle"
                  >
                    {d.label}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>

          <View className="flex-row gap-4 mt-2 px-1">
            <View className="flex-row items-center gap-1.5">
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.success }} />
              <Text size="xs" variant="muted">Receitas</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.danger }} />
              <Text size="xs" variant="muted">Despesas</Text>
            </View>
          </View>
        </>
      )}
    </Card>
  );
}
