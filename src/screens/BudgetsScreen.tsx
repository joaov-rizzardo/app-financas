import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingCart,
  Car,
  Gamepad2,
  Home,
  Heart,
  GraduationCap,
  Shirt,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { formatCurrency, toPercent } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const BUDGETS: Budget[] = [
  {
    id: '1',
    category: 'Alimentação',
    spent: 680,
    limit: 1000,
    icon: ShoppingCart,
    iconColor: colors.warning,
    iconBg: 'bg-warning/10',
  },
  {
    id: '2',
    category: 'Transporte',
    spent: 220,
    limit: 400,
    icon: Car,
    iconColor: colors.info,
    iconBg: 'bg-info/10',
  },
  {
    id: '3',
    category: 'Lazer',
    spent: 390,
    limit: 300,
    icon: Gamepad2,
    iconColor: colors.danger,
    iconBg: 'bg-danger/10',
  },
  {
    id: '4',
    category: 'Moradia',
    spent: 1500,
    limit: 1500,
    icon: Home,
    iconColor: colors.success,
    iconBg: 'bg-success/10',
  },
  {
    id: '5',
    category: 'Saúde',
    spent: 80,
    limit: 300,
    icon: Heart,
    iconColor: colors.accent.DEFAULT,
    iconBg: 'bg-accent/10',
  },
  {
    id: '6',
    category: 'Educação',
    spent: 150,
    limit: 500,
    icon: GraduationCap,
    iconColor: colors.primary.DEFAULT,
    iconBg: 'bg-primary/10',
  },
  {
    id: '7',
    category: 'Vestuário',
    spent: 95,
    limit: 200,
    icon: Shirt,
    iconColor: colors.warning,
    iconBg: 'bg-warning/10',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBudgetStatus(spent: number, limit: number): {
  pct: number;
  barColor: string;
  label: string;
  labelColor: string;
} {
  const pct = toPercent(spent, limit);
  const isOver = spent > limit;
  if (isOver) {
    return {
      pct: 100,
      barColor: colors.danger,
      label: `${formatCurrency(spent - limit)} acima`,
      labelColor: 'text-danger',
    };
  }
  if (pct >= 90) {
    return { pct, barColor: colors.danger, label: `${pct}%`, labelColor: 'text-danger' };
  }
  if (pct >= 70) {
    return { pct, barColor: colors.warning, label: `${pct}%`, labelColor: 'text-warning' };
  }
  return { pct, barColor: colors.success, label: `${pct}%`, labelColor: 'text-success' };
}

// ─── Components ───────────────────────────────────────────────────────────────

function MonthSummary() {
  const totalSpent = BUDGETS.reduce((s, b) => s + b.spent, 0);
  const totalLimit = BUDGETS.reduce((s, b) => s + b.limit, 0);
  const overBudget = BUDGETS.filter((b) => b.spent > b.limit).length;
  const onTrack = BUDGETS.length - overBudget;

  return (
    <View className="flex-row gap-3 mb-4">
      <View className="flex-1 bg-background-surface rounded-2xl p-4 border border-border">
        <Label className="mb-1">Total gasto</Label>
        <Text size="xl" weight="bold">{formatCurrency(totalSpent)}</Text>
        <Text size="xs" variant="muted" className="mt-1">
          de {formatCurrency(totalLimit)} orçado
        </Text>
      </View>
      <View className="gap-2">
        <View className="bg-success/10 rounded-xl px-3 py-2 border border-success/20">
          <Text size="xs" weight="semibold" className="text-success">
            {onTrack} no limite
          </Text>
        </View>
        <View className="bg-danger/10 rounded-xl px-3 py-2 border border-danger/20">
          <Text size="xs" weight="semibold" className="text-danger">
            {overBudget} acima
          </Text>
        </View>
      </View>
    </View>
  );
}

function BudgetCard({ budget }: { budget: Budget }) {
  const Icon = budget.icon;
  const { pct, barColor, label, labelColor } = getBudgetStatus(budget.spent, budget.limit);
  const remaining = budget.limit - budget.spent;

  return (
    <Card className="mb-3">
      <View className="flex-row items-center gap-3 mb-3">
        <View className={`w-10 h-10 rounded-xl items-center justify-center ${budget.iconBg}`}>
          <Icon size={18} color={budget.iconColor} />
        </View>
        <View className="flex-1">
          <Text size="sm" weight="semibold">{budget.category}</Text>
          <Text size="xs" variant="muted">
            {remaining >= 0
              ? `${formatCurrency(remaining)} restante`
              : `${formatCurrency(Math.abs(remaining))} acima do limite`}
          </Text>
        </View>
        <Text size="sm" weight="bold" className={labelColor}>
          {label}
        </Text>
      </View>

      <View className="h-2 bg-background-card rounded-full overflow-hidden mb-2">
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: 999,
          }}
        />
      </View>

      <View className="flex-row justify-between">
        <Text size="xs" variant="muted">{formatCurrency(budget.spent)} gasto</Text>
        <Text size="xs" variant="muted">{formatCurrency(budget.limit)} limite</Text>
      </View>
    </Card>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function BudgetsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-6 pb-5">
          <Label>Abril 2026</Label>
          <Text size="2xl" weight="bold" className="mt-0.5">
            Orçamentos
          </Text>
        </View>

        <MonthSummary />

        {BUDGETS.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
