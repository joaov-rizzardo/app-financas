import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Card, CardHeader } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrencyCompact } from '@/lib/utils';
import type { MonthStat } from '@/hooks/useReports';

const CHART_HEIGHT = 120;
const LABEL_HEIGHT = 20;
const SVG_HEIGHT = CHART_HEIGHT + LABEL_HEIGHT + 12;
const H_PAD = 36;
const V_PAD = 12;

export interface LineChartCardProps {
  data: MonthStat[];
  isLoading: boolean;
}

export function LineChartCard({ data, isLoading }: LineChartCardProps) {
  const { width } = useWindowDimensions();
  const svgWidth = width - 64;
  const plotWidth = svgWidth - H_PAD * 2;

  if (isLoading) {
    return <View className="bg-background-surface border border-border rounded-2xl p-4 mb-4 h-52 opacity-40" />;
  }

  const balances = data.map((d) => d.balance);
  const minVal = Math.min(...balances, 0);
  const maxVal = Math.max(...balances, 1);
  const range = maxVal - minVal || 1;

  const toY = (val: number) =>
    V_PAD + CHART_HEIGHT - V_PAD - ((val - minVal) / range) * (CHART_HEIGHT - V_PAD * 2);

  const points = data.map((d, i) => ({
    x: H_PAD + (i / Math.max(data.length - 1, 1)) * plotWidth,
    y: toY(d.balance),
    label: d.label,
    balance: d.balance,
  }));

  const zeroY = toY(0);
  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = [
    `M ${points[0].x} ${zeroY}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${zeroY}`,
    'Z',
  ].join(' ');

  const isPositive = balances[balances.length - 1] >= 0;
  const lineColor = isPositive ? colors.primary[400] : colors.danger;
  const gradStartColor = isPositive ? colors.primary.DEFAULT : colors.danger;

  return (
    <Card className="mb-4">
      <CardHeader>
        <Text weight="semibold">Evolução do saldo</Text>
      </CardHeader>

      <Svg width={svgWidth} height={SVG_HEIGHT}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={gradStartColor} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={gradStartColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Zero line */}
        {minVal < 0 && (
          <Line
            x1={H_PAD}
            y1={zeroY}
            x2={svgWidth - H_PAD}
            y2={zeroY}
            stroke={colors.border.DEFAULT}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}

        {/* Y-axis reference labels */}
        <SvgText x={H_PAD - 4} y={V_PAD + 4} fontSize={8} fill={colors.text.muted} textAnchor="end">
          {formatCurrencyCompact(maxVal)}
        </SvgText>
        <SvgText x={H_PAD - 4} y={CHART_HEIGHT} fontSize={8} fill={colors.text.muted} textAnchor="end">
          {formatCurrencyCompact(minVal)}
        </SvgText>

        {/* Area fill */}
        <Path d={areaD} fill="url(#areaGrad)" />

        {/* Line */}
        <Path d={lineD} stroke={lineColor} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + labels */}
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r={4} fill={colors.background.surface} stroke={lineColor} strokeWidth={2} />
            <SvgText
              x={p.x}
              y={CHART_HEIGHT + LABEL_HEIGHT + 2}
              fontSize={9}
              fill={colors.text.muted}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </Card>
  );
}
