import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ShoppingCart,
  Home,
  Tv,
  Car,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { Card, StatRow, StatCard } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { colors } from '@/constants/colors';
import { formatCurrency, toPercent } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuickStat {
  label: string;
  value: number;
  change: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

interface RecentTransaction {
  id: string;
  label: string;
  category: string;
  amount: number;
  date: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const BALANCE = 12_560.80;
const MONTHLY_INCOME = 7_000;
const MONTHLY_EXPENSE = 3_240;
const SAVINGS_RATE = toPercent(MONTHLY_INCOME - MONTHLY_EXPENSE, MONTHLY_INCOME);

const quickStats: QuickStat[] = [
  {
    label: 'Receitas',
    value: MONTHLY_INCOME,
    change: 20.7,
    icon: TrendingUp,
    iconColor: colors.success,
    iconBg: 'bg-success/10',
  },
  {
    label: 'Despesas',
    value: MONTHLY_EXPENSE,
    change: -8.3,
    icon: TrendingDown,
    iconColor: colors.danger,
    iconBg: 'bg-danger/10',
  },
];

const recentTransactions: RecentTransaction[] = [
  {
    id: '1',
    label: 'Supermercado',
    category: 'Alimentação',
    amount: -320.5,
    date: 'Hoje',
    icon: ShoppingCart,
    iconColor: colors.warning,
    iconBg: 'bg-warning/10',
  },
  {
    id: '2',
    label: 'Salário',
    category: 'Renda',
    amount: 7000,
    date: '05 abr',
    icon: TrendingUp,
    iconColor: colors.success,
    iconBg: 'bg-success/10',
  },
  {
    id: '3',
    label: 'Aluguel',
    category: 'Moradia',
    amount: -1500,
    date: '05 abr',
    icon: Home,
    iconColor: colors.info,
    iconBg: 'bg-info/10',
  },
  {
    id: '4',
    label: 'Netflix',
    category: 'Lazer',
    amount: -44.9,
    date: '04 abr',
    icon: Tv,
    iconColor: colors.danger,
    iconBg: 'bg-danger/10',
  },
  {
    id: '5',
    label: 'Uber',
    category: 'Transporte',
    amount: -28,
    date: '03 abr',
    icon: Car,
    iconColor: colors.accent.DEFAULT,
    iconBg: 'bg-accent/10',
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function HeroBalanceCard() {
  return (
    <View
      style={{ backgroundColor: colors.background.elevated }}
      className="rounded-3xl p-6 mb-4 border border-border"
    >
      <View className="flex-row justify-between items-start mb-6">
        <View>
          <Label className="mb-1">Saldo total</Label>
          <Text size="4xl" weight="bold" className="text-text-primary tracking-tight">
            {formatCurrency(BALANCE)}
          </Text>
        </View>
        <View className="w-10 h-10 rounded-full bg-primary/15 items-center justify-center">
          <Bell size={18} color={colors.primary.DEFAULT} />
        </View>
      </View>

      <View className="mb-2">
        <View className="flex-row justify-between mb-2">
          <Label>Taxa de poupança</Label>
          <Text size="xs" weight="semibold" className="text-success">
            {SAVINGS_RATE}%
          </Text>
        </View>
        <View className="h-1.5 bg-background-card rounded-full overflow-hidden">
          <View
            style={{
              width: `${SAVINGS_RATE}%`,
              height: '100%',
              backgroundColor: colors.success,
              borderRadius: 999,
            }}
          />
        </View>
      </View>

      <Separator className="my-4 opacity-50" />

      <View className="flex-row justify-between">
        <View>
          <Label className="mb-1">Receitas</Label>
          <Text size="sm" weight="semibold" className="text-success">
            +{formatCurrency(MONTHLY_INCOME)}
          </Text>
        </View>
        <View className="items-end">
          <Label className="mb-1">Despesas</Label>
          <Text size="sm" weight="semibold" className="text-danger">
            -{formatCurrency(MONTHLY_EXPENSE)}
          </Text>
        </View>
        <View className="items-end">
          <Label className="mb-1">Economizado</Label>
          <Text size="sm" weight="semibold" className="text-primary-400">
            {formatCurrency(MONTHLY_INCOME - MONTHLY_EXPENSE)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function QuickStatCard({ stat }: { stat: QuickStat }) {
  const Icon = stat.icon;
  const isPositive = stat.change >= 0;
  return (
    <StatCard>
      <View className={`w-9 h-9 rounded-xl items-center justify-center mb-3 ${stat.iconBg}`}>
        <Icon size={17} color={stat.iconColor} />
      </View>
      <Label className="mb-1">{stat.label}</Label>
      <Text size="lg" weight="bold" className="text-text-primary">
        {formatCurrency(stat.value)}
      </Text>
      <View className="flex-row items-center gap-1 mt-1">
        <ArrowUpRight
          size={12}
          color={isPositive ? colors.success : colors.danger}
          style={{ transform: [{ rotate: isPositive ? '0deg' : '90deg' }] }}
        />
        <Text
          size="xs"
          weight="medium"
          className={isPositive ? 'text-success' : 'text-danger'}
        >
          {Math.abs(stat.change)}% vs mês passado
        </Text>
      </View>
    </StatCard>
  );
}

function TransactionRow({ tx, isLast }: { tx: RecentTransaction; isLast: boolean }) {
  const Icon = tx.icon;
  const isIncome = tx.amount >= 0;
  return (
    <>
      <Pressable className="flex-row items-center py-3 active:opacity-70">
        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${tx.iconBg}`}>
          <Icon size={17} color={tx.iconColor} />
        </View>
        <View className="flex-1">
          <Text size="sm" weight="medium">{tx.label}</Text>
          <Text size="xs" variant="muted" className="mt-0.5">
            {tx.category} · {tx.date}
          </Text>
        </View>
        <Text
          size="sm"
          weight="semibold"
          className={isIncome ? 'text-success' : 'text-text-primary'}
        >
          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
        </Text>
      </Pressable>
      {!isLast && <Separator />}
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center pt-6 pb-5">
          <View>
            <Label>Abril 2026</Label>
            <Text size="2xl" weight="bold" className="mt-0.5">
              Bom dia, João 👋
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
            <Text size="sm" weight="bold" className="text-primary-300">J</Text>
          </View>
        </View>

        <HeroBalanceCard />

        <StatRow className="mb-4">
          {quickStats.map((stat) => (
            <QuickStatCard key={stat.label} stat={stat} />
          ))}
        </StatRow>

        <Card>
          <View className="flex-row justify-between items-center mb-3">
            <Text weight="semibold">Últimos lançamentos</Text>
            <Pressable className="flex-row items-center gap-1 active:opacity-70">
              <Text size="xs" className="text-primary-400">Ver todos</Text>
              <ChevronRight size={13} color={colors.primary[400]} />
            </Pressable>
          </View>
          {recentTransactions.map((tx, i) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              isLast={i === recentTransactions.length - 1}
            />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
