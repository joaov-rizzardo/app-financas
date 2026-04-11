import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  ShoppingCart,
  Home,
  Tv,
  Car,
  TrendingUp,
  Heart,
  Coffee,
  Briefcase,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Button, Chip } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { colors } from '@/constants/colors';
import { formatCurrency, formatShortDate } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'income' | 'expense';

interface Transaction {
  id: string;
  label: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    label: 'Salário',
    category: 'Renda',
    amount: 5800,
    date: '2026-04-05',
    type: 'income',
    icon: Briefcase,
    iconColor: colors.success,
    iconBg: 'bg-success/10',
  },
  {
    id: '2',
    label: 'Freelance',
    category: 'Renda',
    amount: 1200,
    date: '2026-04-02',
    type: 'income',
    icon: TrendingUp,
    iconColor: colors.accent.DEFAULT,
    iconBg: 'bg-accent/10',
  },
  {
    id: '3',
    label: 'Aluguel',
    category: 'Moradia',
    amount: -1500,
    date: '2026-04-05',
    type: 'expense',
    icon: Home,
    iconColor: colors.info,
    iconBg: 'bg-info/10',
  },
  {
    id: '4',
    label: 'Supermercado',
    category: 'Alimentação',
    amount: -320.5,
    date: '2026-04-08',
    type: 'expense',
    icon: ShoppingCart,
    iconColor: colors.warning,
    iconBg: 'bg-warning/10',
  },
  {
    id: '5',
    label: 'Netflix',
    category: 'Lazer',
    amount: -44.9,
    date: '2026-04-04',
    type: 'expense',
    icon: Tv,
    iconColor: colors.danger,
    iconBg: 'bg-danger/10',
  },
  {
    id: '6',
    label: 'Uber',
    category: 'Transporte',
    amount: -28,
    date: '2026-04-03',
    type: 'expense',
    icon: Car,
    iconColor: colors.accent.DEFAULT,
    iconBg: 'bg-accent/10',
  },
  {
    id: '7',
    label: 'Farmácia',
    category: 'Saúde',
    amount: -65,
    date: '2026-04-06',
    type: 'expense',
    icon: Heart,
    iconColor: colors.danger,
    iconBg: 'bg-danger/10',
  },
  {
    id: '8',
    label: 'Cafeteria',
    category: 'Alimentação',
    amount: -18.5,
    date: '2026-04-07',
    type: 'expense',
    icon: Coffee,
    iconColor: colors.warning,
    iconBg: 'bg-warning/10',
  },
];

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'income', label: 'Receitas' },
  { key: 'expense', label: 'Despesas' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const key = formatShortDate(tx.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.entries());
}

// ─── Components ───────────────────────────────────────────────────────────────

function SummaryBar({ income, expense }: { income: number; expense: number }) {
  const net = income - expense;
  return (
    <View className="flex-row gap-3 mb-4">
      <View className="flex-1 bg-success/10 rounded-2xl p-3 border border-success/20">
        <Label className="text-success mb-1">Receitas</Label>
        <Text size="base" weight="bold" className="text-success">
          +{formatCurrency(income)}
        </Text>
      </View>
      <View className="flex-1 bg-danger/10 rounded-2xl p-3 border border-danger/20">
        <Label className="text-danger mb-1">Despesas</Label>
        <Text size="base" weight="bold" className="text-danger">
          -{formatCurrency(expense)}
        </Text>
      </View>
      <View
        className="flex-1 rounded-2xl p-3 border"
        style={{
          backgroundColor: colors.primary.DEFAULT + '15',
          borderColor: colors.primary.DEFAULT + '30',
        }}
      >
        <Label className="text-primary-300 mb-1">Saldo</Label>
        <Text size="base" weight="bold" className="text-primary-400">
          +{formatCurrency(net)}
        </Text>
      </View>
    </View>
  );
}

function TransactionItem({ tx, isLast }: { tx: Transaction; isLast: boolean }) {
  const Icon = tx.icon;
  const isIncome = tx.type === 'income';
  return (
    <>
      <Pressable className="flex-row items-center py-3.5 active:opacity-70">
        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${tx.iconBg}`}>
          <Icon size={17} color={tx.iconColor} />
        </View>
        <View className="flex-1">
          <Text size="sm" weight="medium">{tx.label}</Text>
          <Text size="xs" variant="muted" className="mt-0.5">{tx.category}</Text>
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

export function TransactionsScreen() {
  const [filter, setFilter] = React.useState<FilterType>('all');

  const filtered =
    filter === 'all'
      ? ALL_TRANSACTIONS
      : ALL_TRANSACTIONS.filter((tx) => tx.type === filter);

  const grouped = groupByDate(filtered);

  const totalIncome = ALL_TRANSACTIONS.filter((t) => t.type === 'income').reduce(
    (s, t) => s + t.amount,
    0,
  );
  const totalExpense = ALL_TRANSACTIONS.filter((t) => t.type === 'expense').reduce(
    (s, t) => s + Math.abs(t.amount),
    0,
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 pt-6 pb-4">
        <View>
          <Label>Abril 2026</Label>
          <Text size="2xl" weight="bold" className="mt-0.5">
            Lançamentos
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
        <SummaryBar income={totalIncome} expense={totalExpense} />

        <View className="flex-row gap-2 mb-4">
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </View>

        {grouped.map(([date, txs]) => (
          <View key={date} className="mb-3">
            <Label className="mb-2 px-1">{date}</Label>
            <Card>
              {txs.map((tx, i) => (
                <TransactionItem key={tx.id} tx={tx} isLast={i === txs.length - 1} />
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
