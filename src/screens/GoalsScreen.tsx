import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { formatCurrency, toPercent } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Goal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  deadline: string;
  emoji: string;
  accentColor: string;
  accentBg: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const GOALS: Goal[] = [
  {
    id: '1',
    title: 'Reserva de emergência',
    description: '6 meses de despesas cobertos',
    current: 8000,
    target: 15000,
    deadline: 'Dez 2026',
    emoji: '🛡️',
    accentColor: colors.success,
    accentBg: 'bg-success/10',
  },
  {
    id: '2',
    title: 'Viagem Europa',
    description: 'Passagens, hotéis e experiências',
    current: 3200,
    target: 12000,
    deadline: 'Jun 2027',
    emoji: '✈️',
    accentColor: colors.accent.DEFAULT,
    accentBg: 'bg-accent/10',
  },
  {
    id: '3',
    title: 'Notebook novo',
    description: 'MacBook Pro M4',
    current: 2800,
    target: 4500,
    deadline: 'Ago 2026',
    emoji: '💻',
    accentColor: colors.primary.DEFAULT,
    accentBg: 'bg-primary/10',
  },
  {
    id: '4',
    title: 'Carro novo',
    description: 'Entrada do financiamento',
    current: 5000,
    target: 40000,
    deadline: 'Dez 2028',
    emoji: '🚗',
    accentColor: colors.warning,
    accentBg: 'bg-warning/10',
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function GoalsSummary() {
  const totalSaved = GOALS.reduce((s, g) => s + g.current, 0);
  const totalTarget = GOALS.reduce((s, g) => s + g.target, 0);
  const completed = GOALS.filter((g) => g.current >= g.target).length;

  return (
    <View
      className="rounded-3xl p-5 mb-4 border border-border"
      style={{ backgroundColor: colors.background.elevated }}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Label className="mb-1">Total poupado para metas</Label>
          <Text size="3xl" weight="bold">{formatCurrency(totalSaved)}</Text>
        </View>
        <View className="bg-primary/15 px-3 py-1 rounded-full">
          <Text size="xs" weight="semibold" className="text-primary-300">
            {GOALS.length} metas
          </Text>
        </View>
      </View>

      <View className="h-2 bg-background-card rounded-full overflow-hidden mb-2">
        <View
          style={{
            width: `${toPercent(totalSaved, totalTarget)}%`,
            height: '100%',
            backgroundColor: colors.primary.DEFAULT,
            borderRadius: 999,
          }}
        />
      </View>

      <View className="flex-row justify-between">
        <Text size="xs" variant="muted">
          {toPercent(totalSaved, totalTarget)}% de {formatCurrency(totalTarget)} de meta
        </Text>
        {completed > 0 && (
          <Text size="xs" className="text-success" weight="semibold">
            {completed} concluída{completed > 1 ? 's' : ''} ✓
          </Text>
        )}
      </View>
    </View>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const pct = toPercent(goal.current, goal.target);
  const remaining = goal.target - goal.current;
  const isCompleted = goal.current >= goal.target;

  return (
    <Pressable className="mb-3 active:opacity-90">
      <Card>
        <View className="flex-row items-start gap-3 mb-4">
          <View className={`w-12 h-12 rounded-2xl items-center justify-center ${goal.accentBg}`}>
            <Text size="2xl">{goal.emoji}</Text>
          </View>
          <View className="flex-1">
            <Text size="base" weight="semibold">{goal.title}</Text>
            <Text size="xs" variant="muted" className="mt-0.5">{goal.description}</Text>
          </View>
          <View
            className="flex-row items-center gap-1 px-2 py-1 rounded-full"
            style={{ backgroundColor: colors.background.card }}
          >
            <Calendar size={11} color={colors.text.muted} />
            <Text size="xs" variant="muted">{goal.deadline}</Text>
          </View>
        </View>

        <View className="h-2 bg-background-card rounded-full overflow-hidden mb-2">
          <View
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: isCompleted ? colors.success : goal.accentColor,
              borderRadius: 999,
            }}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-baseline gap-1">
            <Text size="base" weight="bold" style={{ color: goal.accentColor }}>
              {formatCurrency(goal.current)}
            </Text>
            <Text size="xs" variant="muted">
              de {formatCurrency(goal.target)}
            </Text>
          </View>
          <View className="items-end">
            {isCompleted ? (
              <Text size="xs" className="text-success" weight="semibold">
                Meta atingida! ✓
              </Text>
            ) : (
              <>
                <Text size="xs" weight="semibold" className="text-text-primary">
                  {pct}%
                </Text>
                <Text size="xs" variant="muted">
                  faltam {formatCurrency(remaining)}
                </Text>
              </>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function GoalsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 pt-6 pb-4">
        <View>
          <Label>Acompanhamento</Label>
          <Text size="2xl" weight="bold" className="mt-0.5">
            Metas
          </Text>
        </View>
        <Button variant="primary" size="icon">
          <Plus size={20} color="#fff" />
        </Button>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <GoalsSummary />
        {GOALS.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
