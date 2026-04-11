import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CreditCard,
  Utensils,
  Package,
  Fuel,
  Pill,
  Wifi,
  ChevronRight,
} from 'lucide-react-native';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/constants/colors';
import { formatCurrency, toPercent } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CardTransaction {
  id: string;
  label: string;
  category: string;
  amount: number;
  date: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  status: 'posted' | 'pending';
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CARD_LIMIT = 5_000;
const INVOICE_AMOUNT = 372.3;
const NEXT_INVOICE = 0;
const AVAILABLE = CARD_LIMIT - INVOICE_AMOUNT;
const USAGE_PCT = toPercent(INVOICE_AMOUNT, CARD_LIMIT);

const CARD_TRANSACTIONS: CardTransaction[] = [
  {
    id: '1',
    label: 'iFood',
    category: 'Delivery',
    amount: -58.9,
    date: '09 abr',
    icon: Utensils,
    iconColor: colors.warning,
    iconBg: 'bg-warning/10',
    status: 'posted',
  },
  {
    id: '2',
    label: 'Amazon',
    category: 'Compras online',
    amount: -149.9,
    date: '07 abr',
    icon: Package,
    iconColor: colors.accent.DEFAULT,
    iconBg: 'bg-accent/10',
    status: 'posted',
  },
  {
    id: '3',
    label: 'Posto Shell',
    category: 'Transporte',
    amount: -120,
    date: '06 abr',
    icon: Fuel,
    iconColor: colors.info,
    iconBg: 'bg-info/10',
    status: 'posted',
  },
  {
    id: '4',
    label: 'Farmácia',
    category: 'Saúde',
    amount: -43.5,
    date: '05 abr',
    icon: Pill,
    iconColor: colors.danger,
    iconBg: 'bg-danger/10',
    status: 'posted',
  },
  {
    id: '5',
    label: 'Spotify',
    category: 'Entretenimento',
    amount: -21.9,
    date: '04 abr',
    icon: Wifi,
    iconColor: colors.success,
    iconBg: 'bg-success/10',
    status: 'pending',
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function CreditCardWidget() {
  const usageColor =
    USAGE_PCT > 80 ? colors.danger : USAGE_PCT > 50 ? colors.warning : colors.success;

  return (
    <View
      style={{
        backgroundColor: colors.primary[700],
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.primary[600],
      }}
    >
      <View className="flex-row justify-between items-start mb-8">
        <View>
          <Text
            size="xs"
            weight="semibold"
            tracking="widest"
            className="uppercase text-primary-300 mb-1"
          >
            Nubank Platinum
          </Text>
          <Text size="lg" weight="semibold" className="text-white tracking-widest">
            ••••  ••••  ••••  4821
          </Text>
        </View>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary[600],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CreditCard size={22} color={colors.primary[200]} />
        </View>
      </View>

      <View className="flex-row justify-between items-end mb-5">
        <View>
          <Label className="text-primary-300 mb-1">Fatura atual</Label>
          <Text size="2xl" weight="bold" className="text-white">
            {formatCurrency(INVOICE_AMOUNT)}
          </Text>
        </View>
        <View className="items-end">
          <Label className="text-primary-300 mb-1">Vencimento</Label>
          <Text size="sm" weight="semibold" className="text-white">
            10 mai. 2026
          </Text>
        </View>
      </View>

      <View>
        <View className="flex-row justify-between mb-1.5">
          <Label className="text-primary-300">Limite utilizado</Label>
          <Text size="xs" weight="semibold" style={{ color: usageColor }}>
            {USAGE_PCT}% de {formatCurrency(CARD_LIMIT)}
          </Text>
        </View>
        <View
          style={{
            height: 4,
            backgroundColor: colors.primary[900] + '80',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${USAGE_PCT}%`,
              height: '100%',
              backgroundColor: usageColor,
              borderRadius: 999,
            }}
          />
        </View>
      </View>
    </View>
  );
}

function InvoiceSummary() {
  return (
    <Card className="mb-4">
      <CardHeader>
        <Text weight="semibold">Resumo da fatura</Text>
      </CardHeader>
      <CardContent>
        <View className="flex-row justify-between py-2">
          <Text variant="muted" size="sm">Fatura atual</Text>
          <Text size="sm" weight="semibold" className="text-danger">
            {formatCurrency(INVOICE_AMOUNT)}
          </Text>
        </View>
        <Separator />
        <View className="flex-row justify-between py-2">
          <Text variant="muted" size="sm">Próxima fatura</Text>
          <Text size="sm" weight="medium">
            {NEXT_INVOICE === 0 ? '—' : formatCurrency(NEXT_INVOICE)}
          </Text>
        </View>
        <Separator />
        <View className="flex-row justify-between py-2">
          <Text variant="muted" size="sm">Limite disponível</Text>
          <Text size="sm" weight="semibold" className="text-success">
            {formatCurrency(AVAILABLE)}
          </Text>
        </View>
        <Separator />
        <View className="flex-row justify-between pt-2">
          <Text variant="muted" size="sm">Limite total</Text>
          <Text size="sm" weight="semibold">{formatCurrency(CARD_LIMIT)}</Text>
        </View>
      </CardContent>
    </Card>
  );
}

function TransactionRow({ tx, isLast }: { tx: CardTransaction; isLast: boolean }) {
  const Icon = tx.icon;
  return (
    <>
      <Pressable className="flex-row items-center py-3.5 active:opacity-70">
        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${tx.iconBg}`}>
          <Icon size={17} color={tx.iconColor} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text size="sm" weight="medium">{tx.label}</Text>
            {tx.status === 'pending' && (
              <Badge label="Pendente" variant="warning" />
            )}
          </View>
          <Text size="xs" variant="muted" className="mt-0.5">
            {tx.category} · {tx.date}
          </Text>
        </View>
        <Text size="sm" weight="semibold" className="text-danger">
          -{formatCurrency(tx.amount)}
        </Text>
      </Pressable>
      {!isLast && <Separator />}
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CreditCardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-6 pb-5">
          <Label>Ciclo atual</Label>
          <Text size="2xl" weight="bold" className="mt-0.5">
            Cartão de Crédito
          </Text>
        </View>

        <CreditCardWidget />
        <InvoiceSummary />

        <Card>
          <View className="flex-row justify-between items-center mb-3">
            <Text weight="semibold">Compras no cartão</Text>
            <Pressable className="flex-row items-center gap-1 active:opacity-70">
              <Text size="xs" className="text-primary-400">Ver todas</Text>
              <ChevronRight size={13} color={colors.primary[400]} />
            </Pressable>
          </View>
          {CARD_TRANSACTIONS.map((tx, i) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              isLast={i === CARD_TRANSACTIONS.length - 1}
            />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
