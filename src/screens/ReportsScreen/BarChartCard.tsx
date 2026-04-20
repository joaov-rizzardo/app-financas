import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { Card, CardHeader } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrencyCompact } from '@/lib/utils';
import type { MonthStat } from '@/hooks/useReports';

const CHART_HEIGHT = 120;
const LABEL_HEIGHT = 20;
const SVG_HEIGHT = CHART_HEIGHT + LABEL_HEIGHT + 16;
const H_PAD = 8;
const GRID_LINES = 3;

export interface BarChartCardProps {
  data: MonthStat[];
  isLoading: boolean;
}

export function BarChartCard({ data, isLoading }: BarChartCardProps) {
  const { width } = useWindowDimensions();
  const svgWidth = width - 64;

  if (isLoading) {
    return <View className="bg-background-surface border border-border rounded-2xl p-4 mb-4 h-52 opacity-40" />;
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.fixedExpense, d.variableExpense]), 1);

  const groupWidth = (svgWidth - H_PAD * 2) / data.length;
  const barWidth = Math.max(6, (groupWidth - 12) / 2);
  const gap = 3;

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row justify-between items-center">
          <Text weight="semibold">Fixo vs variável</Text>
          <View className="flex-row gap-3 items-center">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors.primary.DEFAULT }} />
              <Text size="xs" variant="muted">Fixo</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors.accent.DEFAULT }} />
              <Text size="xs" variant="muted">Variável</Text>
            </View>
          </View>
        </View>
      </CardHeader>

      <Svg width={svgWidth} height={SVG_HEIGHT}>
        {/* Grid lines */}
        {Array.from({ length: GRID_LINES }).map((_, i) => {
          const y = CHART_HEIGHT - ((i + 1) / GRID_LINES) * CHART_HEIGHT;
          const val = ((i + 1) / GRID_LINES) * maxVal;
          return (
            <React.Fragment key={i}>
              <Line
                x1={H_PAD}
                y1={y}
                x2={svgWidth - H_PAD}
                y2={y}
                stroke={colors.border.DEFAULT}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={H_PAD}
                y={y - 3}
                fontSize={8}
                fill={colors.text.muted}
                textAnchor="start"
              >
                {formatCurrencyCompact(val)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const groupX = H_PAD + i * groupWidth + (groupWidth - barWidth * 2 - gap) / 2;
          const fixedH = (d.fixedExpense / maxVal) * CHART_HEIGHT;
          const varH = (d.variableExpense / maxVal) * CHART_HEIGHT;

          return (
            <React.Fragment key={d.month}>
              {/* Fixed bar */}
              <Rect
                x={groupX}
                y={CHART_HEIGHT - fixedH}
                width={barWidth}
                height={Math.max(fixedH, 2)}
                fill={colors.primary.DEFAULT}
                opacity={0.85}
                rx={3}
              />
              {/* Variable bar */}
              <Rect
                x={groupX + barWidth + gap}
                y={CHART_HEIGHT - varH}
                width={barWidth}
                height={Math.max(varH, 2)}
                fill={colors.accent.DEFAULT}
                opacity={0.85}
                rx={3}
              />
              {/* Month label */}
              <SvgText
                x={groupX + barWidth + gap / 2}
                y={CHART_HEIGHT + LABEL_HEIGHT}
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
    </Card>
  );
}
