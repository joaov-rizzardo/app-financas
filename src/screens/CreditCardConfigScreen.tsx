import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, CreditCard, DollarSign, Save } from 'lucide-react-native';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { ActionButton } from '@/components/ui/ActionButton';
import { Separator } from '@/components/ui/Separator';
import { colors } from '@/constants/colors';
import { useCreditCardConfig } from '@/hooks/useCreditCardConfig';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

interface DayStepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ElementType;
}

function DayStepper({ label, value, onChange, icon: Icon }: DayStepperProps) {
  const decrement = () => onChange(value <= 1 ? 28 : value - 1);
  const increment = () => onChange(value >= 28 ? 1 : value + 1);

  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3 flex-1">
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.primary.DEFAULT + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} color={colors.primary[400]} />
        </View>
        <Text size="sm" weight="medium">{label}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={decrement}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.background.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
          }}
          className="active:opacity-70"
        >
          <Text size="lg" weight="semibold" variant="secondary">−</Text>
        </Pressable>
        <View
          style={{
            width: 52,
            height: 36,
            backgroundColor: colors.background.card,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primary.DEFAULT + '60',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text size="base" weight="bold" className="text-primary-400">
            {String(value).padStart(2, '0')}
          </Text>
        </View>
        <Pressable
          onPress={increment}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.background.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
          }}
          className="active:opacity-70"
        >
          <Text size="lg" weight="semibold" variant="secondary">+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CreditCardConfigScreen({ onBack }: Props) {
  const { config, save, isSaving } = useCreditCardConfig();

  const [closingDay, setClosingDay] = useState(5);
  const [dueDay, setDueDay] = useState(10);
  const [limitCents, setLimitCents] = useState('');
  const [limitDisplay, setLimitDisplay] = useState('');

  useEffect(() => {
    if (config) {
      setClosingDay(config.closingDay);
      setDueDay(config.dueDay);
      if (config.limit) {
        const display = (config.limit / 100).toFixed(2).replace('.', ',');
        setLimitDisplay(display);
        setLimitCents(String(config.limit));
      }
    }
  }, [config]);

  function handleLimitChange(text: string) {
    const digits = text.replace(/\D/g, '');
    const cents = parseInt(digits || '0', 10);
    const reais = (cents / 100).toFixed(2);
    setLimitDisplay(reais.replace('.', ','));
    setLimitCents(String(cents));
  }

  async function handleSave() {
    const limit = parseInt(limitCents || '0', 10);
    await save({
      closingDay,
      dueDay,
      ...(limit > 0 && { limit }),
    });
    onBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-3 gap-3">
          <Pressable
            onPress={onBack}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: colors.background.card,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border.DEFAULT,
            }}
            className="active:opacity-70"
          >
            <ArrowLeft size={18} color={colors.text.secondary} />
          </Pressable>
          <View className="flex-1">
            <Label>Configurações</Label>
            <Text size="xl" weight="bold" className="mt-0.5">Cartão de Crédito</Text>
          </View>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: colors.primary.DEFAULT + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={18} color={colors.primary[400]} />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10"
          showsVerticalScrollIndicator={false}
        >
          {/* Billing cycle */}
          <Card className="mb-4">
            <CardHeader>
              <Text weight="semibold">Ciclo de faturamento</Text>
              <Text size="xs" variant="muted" className="mt-1">
                Define quando sua fatura fecha e vence
              </Text>
            </CardHeader>
            <CardContent>
              <DayStepper
                label="Dia de fechamento"
                value={closingDay}
                onChange={setClosingDay}
                icon={Calendar}
              />
              <Separator />
              <DayStepper
                label="Dia de vencimento"
                value={dueDay}
                onChange={setDueDay}
                icon={Clock}
              />
            </CardContent>
          </Card>

          {/* Cycle preview */}
          <View
            style={{
              backgroundColor: colors.primary.DEFAULT + '10',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.primary.DEFAULT + '30',
              padding: 14,
              marginBottom: 16,
              flexDirection: 'row',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: colors.primary.DEFAULT + '25',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Calendar size={13} color={colors.primary[400]} />
            </View>
            <View className="flex-1">
              <Text size="xs" weight="semibold" className="text-primary-400 mb-1">
                Como funciona
              </Text>
              <Text size="xs" variant="muted" style={{ lineHeight: 18 }}>
                Gastos entre o dia {closingDay + 1} e o dia {closingDay} do mês seguinte
                entram na fatura que vence no dia {dueDay}.
              </Text>
            </View>
          </View>

          {/* Card limit */}
          <Card className="mb-6">
            <CardHeader>
              <Text weight="semibold">Limite do cartão</Text>
              <Text size="xs" variant="muted" className="mt-1">
                Opcional — usado para mostrar o uso do limite
              </Text>
            </CardHeader>
            <CardContent>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.background.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border.DEFAULT,
                  paddingHorizontal: 14,
                  height: 52,
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: colors.success + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DollarSign size={14} color={colors.success} />
                </View>
                <Text size="sm" weight="semibold" style={{ color: colors.text.secondary }}>
                  R$
                </Text>
                <TextInput
                  value={limitDisplay}
                  onChangeText={handleLimitChange}
                  keyboardType="numeric"
                  placeholder="0,00"
                  placeholderTextColor={colors.text.muted}
                  style={{
                    flex: 1,
                    color: colors.text.primary,
                    fontSize: 16,
                    fontWeight: '600',
                    paddingVertical: 0,
                  }}
                />
              </View>
              {parseInt(limitCents || '0', 10) > 0 && (
                <Text size="xs" variant="muted" className="mt-2 ml-1">
                  Limite: {formatCurrency(parseInt(limitCents, 10) / 100)}
                </Text>
              )}
            </CardContent>
          </Card>

          <ActionButton
            label="Salvar configurações"
            icon={Save}
            onPress={handleSave}
            loading={isSaving}
            variant="primary"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
