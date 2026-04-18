import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Minus,
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Clock,
  ArrowLeft,
} from 'lucide-react-native';
import { Text, Label } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ActionButton } from '@/components/ui/ActionButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { colors } from '@/constants/colors';
import { formatCurrency, toPercent } from '@/lib/utils';
import { useGoals } from '@/hooks/useGoals';
import type { Goal, GoalContributionEntry } from '@/types/finance';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS_PT_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MONTHS_PT_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

// ─── Types ────────────────────────────────────────────────────────────────────

type GoalStatus = 'completed' | 'on_track' | 'delayed';

interface StatusConfig {
  label: string;
  color: string;
  badgeBg: string;
  barColor: string;
}

const STATUS_CONFIG: Record<GoalStatus, StatusConfig> = {
  completed: {
    label: '🏆 Concluída',
    color: colors.warning,
    badgeBg: colors.warning + '22',
    barColor: colors.warning,
  },
  on_track: {
    label: 'No prazo',
    color: colors.success,
    badgeBg: colors.success + '22',
    barColor: colors.success,
  },
  delayed: {
    label: 'Atrasada',
    color: colors.danger,
    badgeBg: colors.danger + '22',
    barColor: colors.danger,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonthlyAverage(contributions: GoalContributionEntry[] | undefined): number | null {
  if (!contributions || contributions.length === 0) return null;
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const recent = contributions.filter((c) => new Date(c.date + 'T00:00:00') >= threeMonthsAgo);
  if (recent.length === 0) return null;
  const total = recent.reduce((s, c) => s + c.amount, 0);
  return total / 3;
}

function getMonthsLeft(deadline: string): number {
  const d = new Date(deadline + 'T00:00:00');
  const now = new Date();
  return (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
}

function getGoalStatus(goal: Goal): GoalStatus {
  if (goal.currentAmount >= goal.targetAmount) return 'completed';
  const monthsLeft = getMonthsLeft(goal.deadline);
  if (monthsLeft < 0) return 'delayed';
  const avg = getMonthlyAverage(goal.contributions);
  if (avg === null || avg <= 0) return 'on_track';
  const remaining = goal.targetAmount - goal.currentAmount;
  const estimatedMonths = Math.ceil(remaining / avg);
  return estimatedMonths <= monthsLeft ? 'on_track' : 'delayed';
}

function getEstimatedMonths(goal: Goal): number | null {
  const remaining = goal.targetAmount - goal.currentAmount;
  if (remaining <= 0) return 0;
  const avg = getMonthlyAverage(goal.contributions);
  if (!avg || avg <= 0) return null;
  return Math.ceil(remaining / avg);
}

function getEstimationText(goal: Goal): string | null {
  if (goal.currentAmount >= goal.targetAmount) return null;
  const months = getEstimatedMonths(goal);
  if (months === null) return null;
  if (months === 0) return 'Quase lá! Continue assim.';
  if (months === 1) return 'No ritmo atual, você atingirá essa meta em 1 mês.';
  return `No ritmo atual, você atingirá essa meta em ${months} meses.`;
}

function formatDeadlineDisplay(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `${MONTHS_PT_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function deadlineToState(iso: string): { year: number; month: number } {
  const d = new Date(iso + 'T00:00:00');
  return { year: d.getFullYear(), month: d.getMonth() };
}

function stateToDeadlineIso(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
}

function shiftDeadlineMonth(year: number, month: number, delta: number): { year: number; month: number } {
  let m = month + delta;
  let y = year;
  while (m > 11) { m -= 12; y += 1; }
  while (m < 0) { m += 12; y -= 1; }
  const now = new Date();
  if (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth())) {
    return { year, month }; // don't go before current month
  }
  return { year: y, month: m };
}

function defaultDeadlineState(): { year: number; month: number } {
  const d = new Date();
  d.setMonth(d.getMonth() + 12);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function displayToCents(text: string): number {
  const digits = text.replace(/\D/g, '');
  return parseInt(digits || '0', 10);
}

function centsToDisplay(cents: number): string {
  if (cents === 0) return '';
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Contribution Modal ───────────────────────────────────────────────────────

interface ContributionModalProps {
  visible: boolean;
  goal: Goal | null;
  isPending: boolean;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}

function ContributionModal({ visible, goal, isPending, onConfirm, onClose }: ContributionModalProps) {
  const [rawCents, setRawCents] = useState(0);
  const [isWithdraw, setIsWithdraw] = useState(false);

  useEffect(() => {
    if (visible) {
      setRawCents(0);
      setIsWithdraw(false);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxWithdrawCents = Math.round((goal?.currentAmount ?? 0) * 100);
  const exceedsBalance = isWithdraw && rawCents > maxWithdrawCents;
  const canConfirm = rawCents > 0 && !exceedsBalance;
  const accentColor = isWithdraw ? colors.danger : colors.success;
  const projectedBalance = (goal?.currentAmount ?? 0) + (isWithdraw ? -(rawCents / 100) : rawCents / 100);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(isWithdraw ? -(rawCents / 100) : rawCents / 100);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={isPending ? undefined : onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.DEFAULT }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 12,
            }}
          >
            <Pressable
              onPress={isPending ? undefined : onClose}
              style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: colors.background.card,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border.DEFAULT,
              }}
              className="active:opacity-70"
            >
              <ArrowLeft size={18} color={colors.text.secondary} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Label>Movimentar valor</Label>
              <Text size="xl" weight="bold" style={{ marginTop: 2 }} numberOfLines={1}>
                {goal?.name ?? ''}
              </Text>
            </View>
            <View
              style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: accentColor + '20',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} color={accentColor} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Mode toggle */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.background.elevated,
                borderRadius: 14, padding: 4, marginBottom: 16,
                borderWidth: 1, borderColor: colors.border.DEFAULT,
              }}
            >
              {(['add', 'withdraw'] as const).map((mode) => {
                const active = (mode === 'withdraw') === isWithdraw;
                const modeColor = mode === 'withdraw' ? colors.danger : colors.success;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => { setIsWithdraw(mode === 'withdraw'); setRawCents(0); }}
                    style={{
                      flex: 1, paddingVertical: 10,
                      borderRadius: 10, alignItems: 'center',
                      backgroundColor: active ? modeColor : 'transparent',
                    }}
                    className="active:opacity-80"
                  >
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{ color: active ? '#fff' : colors.text.secondary }}
                    >
                      {mode === 'add' ? 'Adicionar' : 'Remover'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Amount card */}
            <View
              style={{
                backgroundColor: colors.background.elevated,
                borderRadius: 20, padding: 20, marginBottom: 16,
                borderWidth: 1,
                borderColor: exceedsBalance ? colors.danger : colors.border.DEFAULT,
                alignItems: 'center',
              }}
            >
              <Label style={{ marginBottom: 8 }}>
                {isWithdraw ? 'Valor a remover' : 'Valor a adicionar'}
              </Label>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text size="2xl" weight="bold" style={{ color: accentColor }}>
                  {isWithdraw ? '−' : '+'} R$
                </Text>
                <TextInput
                  value={centsToDisplay(rawCents)}
                  onChangeText={(t) => setRawCents(displayToCents(t))}
                  keyboardType="numeric"
                  placeholder="0,00"
                  placeholderTextColor={colors.text.muted}
                  autoFocus
                  style={{
                    color: accentColor,
                    fontSize: 36,
                    fontWeight: '800',
                    minWidth: 80,
                    paddingVertical: 0,
                  }}
                />
              </View>
              {exceedsBalance && (
                <Text size="xs" style={{ color: colors.danger, marginTop: 8 }}>
                  Valor maior que o saldo atual ({formatCurrency(goal?.currentAmount ?? 0)})
                </Text>
              )}
            </View>

            {/* Balance info row */}
            <View
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: colors.background.surface,
                borderRadius: 14, padding: 14, marginBottom: 24,
                borderWidth: 1, borderColor: colors.border.DEFAULT,
              }}
            >
              <View
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: colors.success + '20',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <TrendingUp size={17} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text size="xs" variant="muted">Saldo atual</Text>
                <Text size="sm" weight="semibold">
                  {formatCurrency(goal?.currentAmount ?? 0)}
                </Text>
              </View>
              {rawCents > 0 && !exceedsBalance && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text size="xs" variant="muted">Novo saldo</Text>
                  <Text size="sm" weight="semibold" style={{ color: accentColor }}>
                    {formatCurrency(projectedBalance)}
                  </Text>
                </View>
              )}
            </View>

            <ActionButton
              label={isWithdraw ? 'Remover valor' : 'Adicionar valor'}
              icon={isWithdraw ? Minus : Plus}
              onPress={handleConfirm}
              loading={isPending}
              disabled={!canConfirm}
              variant={isWithdraw ? 'danger' : 'success'}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Goal Form Modal ──────────────────────────────────────────────────────────

interface GoalFormModalProps {
  visible: boolean;
  existing: Goal | null;
  isSaving: boolean;
  onSave: (name: string, targetAmount: number, deadline: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function GoalFormModal({ visible, existing, isSaving, onSave, onDelete, onClose }: GoalFormModalProps) {
  const [name, setName] = useState('');
  const [rawCents, setRawCents] = useState(0);
  const [deadline, setDeadline] = useState(defaultDeadlineState());

  useEffect(() => {
    if (visible) {
      if (existing) {
        setName(existing.name);
        setRawCents(Math.round(existing.targetAmount * 100));
        setDeadline(deadlineToState(existing.deadline));
      } else {
        setName('');
        setRawCents(0);
        setDeadline(defaultDeadlineState());
      }
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSave = name.trim().length > 0 && rawCents > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={isSaving ? undefined : onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.DEFAULT }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 12,
            }}
          >
            <Pressable
              onPress={isSaving ? undefined : onClose}
              style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: colors.background.card,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border.DEFAULT,
              }}
              className="active:opacity-70"
            >
              <ArrowLeft size={18} color={colors.text.secondary} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Label>{existing ? 'Editar meta' : 'Nova meta'}</Label>
              <Text size="xl" weight="bold" style={{ marginTop: 2 }}>
                {existing ? existing.name : 'Definir objetivo'}
              </Text>
            </View>
            <View
              style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: colors.primary.DEFAULT + '20',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Target size={18} color={colors.primary[400]} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Amount card */}
            <View
              style={{
                backgroundColor: colors.background.elevated,
                borderRadius: 20, padding: 20, marginBottom: 16,
                borderWidth: 1, borderColor: colors.border.DEFAULT,
                alignItems: 'center',
              }}
            >
              <Label style={{ marginBottom: 8 }}>Valor alvo</Label>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text size="2xl" weight="bold" style={{ color: colors.primary[400] }}>R$</Text>
                <TextInput
                  value={centsToDisplay(rawCents)}
                  onChangeText={(t) => setRawCents(displayToCents(t))}
                  keyboardType="numeric"
                  placeholder="0,00"
                  placeholderTextColor={colors.text.muted}
                  style={{
                    color: colors.primary[400],
                    fontSize: 36,
                    fontWeight: '800',
                    minWidth: 80,
                    paddingVertical: 0,
                  }}
                />
              </View>
            </View>

            {/* Name field */}
            <View
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: colors.background.surface,
                borderRadius: 14, padding: 14, marginBottom: 12,
                borderWidth: 1, borderColor: colors.border.DEFAULT,
              }}
            >
              <View
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: colors.background.card,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Pencil size={17} color={colors.text.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text size="xs" variant="muted" style={{ marginBottom: 2 }}>Nome da meta</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Reserva de emergência"
                  placeholderTextColor={colors.text.muted}
                  style={{
                    color: colors.text.primary,
                    fontSize: 14,
                    fontWeight: '500',
                    paddingVertical: 0,
                  }}
                />
              </View>
            </View>

            {/* Deadline field */}
            <View
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: colors.background.surface,
                borderRadius: 14, padding: 14, marginBottom: 24,
                borderWidth: 1, borderColor: colors.border.DEFAULT,
              }}
            >
              <View
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: colors.accent.DEFAULT + '20',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Calendar size={17} color={colors.accent.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text size="xs" variant="muted" style={{ marginBottom: 2 }}>Prazo</Text>
                <Text size="sm" weight="semibold">
                  {MONTHS_PT_FULL[deadline.month]} {deadline.year}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable
                  onPress={() => setDeadline((d) => shiftDeadlineMonth(d.year, d.month, -1))}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: colors.background.card,
                    borderWidth: 1, borderColor: colors.border.DEFAULT,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                  className="active:opacity-60"
                >
                  <ChevronLeft size={16} color={colors.text.secondary} />
                </Pressable>
                <Pressable
                  onPress={() => setDeadline((d) => shiftDeadlineMonth(d.year, d.month, 1))}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: colors.background.card,
                    borderWidth: 1, borderColor: colors.border.DEFAULT,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                  className="active:opacity-60"
                >
                  <ChevronRight size={16} color={colors.text.secondary} />
                </Pressable>
              </View>
            </View>

            <ActionButton
              label={existing ? 'Salvar alterações' : 'Criar meta'}
              icon={Target}
              onPress={() =>
                canSave &&
                onSave(name.trim(), rawCents / 100, stateToDeadlineIso(deadline.year, deadline.month))
              }
              disabled={!canSave}
              loading={isSaving}
              variant="primary"
            />

            {/* Delete */}
            {existing && onDelete && (
              <Pressable
                onPress={onDelete}
                disabled={isSaving}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                  paddingVertical: 16,
                  opacity: isSaving ? 0.4 : 1,
                }}
                className="active:opacity-50"
              >
                <Trash2 size={14} color={colors.danger} strokeWidth={2} />
                <Text size="sm" weight="semibold" style={{ color: colors.danger }}>
                  Excluir meta
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Goals Summary ────────────────────────────────────────────────────────────

interface GoalsSummaryProps {
  goals: Goal[];
}

function GoalsSummary({ goals }: GoalsSummaryProps) {
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completed = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const active = goals.length - completed;
  const pct = toPercent(totalSaved, totalTarget);

  return (
    <View
      style={{
        backgroundColor: colors.background.elevated,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border.DEFAULT,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <View>
          <Label style={{ marginBottom: 4 }}>Total poupado</Label>
          <Text size="3xl" weight="bold">{formatCurrency(totalSaved)}</Text>
          <Text size="xs" variant="muted" style={{ marginTop: 2 }}>
            de {formatCurrency(totalTarget)} em metas
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <View
            style={{
              paddingHorizontal: 12, paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: colors.primary.DEFAULT + '20',
            }}
          >
            <Text size="xs" weight="semibold" style={{ color: colors.primary[400] }}>
              {active} ativa{active !== 1 ? 's' : ''}
            </Text>
          </View>
          {completed > 0 && (
            <View
              style={{
                paddingHorizontal: 12, paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: colors.warning + '20',
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: colors.warning }}>
                🏆 {completed} concluída{completed !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Overall progress bar */}
      <View
        style={{
          height: 8, backgroundColor: colors.background.card,
          borderRadius: 999, overflow: 'hidden', marginBottom: 8,
        }}
      >
        <View
          style={{
            width: `${pct}%`, height: '100%',
            backgroundColor: colors.primary.DEFAULT,
            borderRadius: 999,
          }}
        />
      </View>
      <Text size="xs" variant="muted">{pct}% do total de metas</Text>
    </View>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onAddContribution: () => void;
}

function GoalCard({ goal, onEdit, onAddContribution }: GoalCardProps) {
  const pct = toPercent(goal.currentAmount, goal.targetAmount);
  const remaining = goal.targetAmount - goal.currentAmount;
  const status = getGoalStatus(goal);
  const statusCfg = STATUS_CONFIG[status];
  const estimationText = getEstimationText(goal);
  const isCompleted = status === 'completed';

  return (
    <View style={{ marginBottom: 12 }}>
      <View
        style={{
          backgroundColor: colors.background.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border.DEFAULT,
          overflow: 'hidden',
        }}
      >
        {/* Status accent strip */}
        <View
          style={{
            height: 3,
            backgroundColor: statusCfg.barColor,
          }}
        />

        <View style={{ padding: 16 }}>
          {/* Header row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text size="base" weight="semibold" numberOfLines={1} style={{ marginBottom: 4 }}>
                {goal.name}
              </Text>
              {/* Status badge */}
              <View
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 8, paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: statusCfg.badgeBg,
                }}
              >
                {status === 'on_track' && (
                  <TrendingUp size={10} color={statusCfg.color} strokeWidth={2.5} />
                )}
                {status === 'delayed' && (
                  <Clock size={10} color={statusCfg.color} strokeWidth={2.5} />
                )}
                {status === 'completed' && (
                  <Trophy size={10} color={statusCfg.color} strokeWidth={2.5} />
                )}
                <Text size="xs" weight="semibold" style={{ color: statusCfg.color }}>
                  {statusCfg.label}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
              {/* Deadline */}
              <View
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  paddingHorizontal: 8, paddingVertical: 5,
                  borderRadius: 10,
                  backgroundColor: colors.background.card,
                }}
              >
                <Calendar size={11} color={colors.text.muted} strokeWidth={1.75} />
                <Text size="xs" variant="muted">{formatDeadlineDisplay(goal.deadline)}</Text>
              </View>

              {/* Edit button */}
              <Pressable
                onPress={onEdit}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  backgroundColor: colors.background.card,
                  alignItems: 'center', justifyContent: 'center',
                }}
                className="active:opacity-60"
              >
                <Pencil size={13} color={colors.text.muted} strokeWidth={1.75} />
              </Pressable>
            </View>
          </View>

          {/* Progress bar */}
          <View
            style={{
              height: 8, backgroundColor: colors.background.card,
              borderRadius: 999, overflow: 'hidden', marginBottom: 10,
            }}
          >
            <View
              style={{
                width: `${pct}%`, height: '100%',
                backgroundColor: statusCfg.barColor,
                borderRadius: 999,
              }}
            />
          </View>

          {/* Amounts row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <View>
              <Text size="xs" variant="muted" style={{ marginBottom: 2 }}>Poupado</Text>
              <Text size="lg" weight="bold" style={{ color: statusCfg.barColor }}>
                {formatCurrency(goal.currentAmount)}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text size="xl" weight="bold" variant="muted">{pct}%</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text size="xs" variant="muted" style={{ marginBottom: 2 }}>
                {isCompleted ? 'Meta' : 'Faltam'}
              </Text>
              <Text size="base" weight="semibold" variant={isCompleted ? 'default' : 'secondary'}>
                {isCompleted ? formatCurrency(goal.targetAmount) : formatCurrency(remaining)}
              </Text>
            </View>
          </View>

          {/* Estimation text */}
          {estimationText && (
            <View
              style={{
                backgroundColor: colors.background.card,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <TrendingUp size={13} color={colors.accent.DEFAULT} strokeWidth={2} />
              <Text size="xs" style={{ color: colors.accent.DEFAULT, flex: 1 }}>
                {estimationText}
              </Text>
            </View>
          )}

          {/* Add contribution button */}
          {!isCompleted && (
            <Pressable
              onPress={onAddContribution}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 6, paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.primary.DEFAULT + '60',
                backgroundColor: colors.primary.DEFAULT + '12',
              }}
              className="active:opacity-70"
            >
              <Plus size={14} color={colors.primary[400]} strokeWidth={2.5} />
              <Text size="sm" weight="semibold" style={{ color: colors.primary[400] }}>
                Adicionar valor
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function GoalsScreen() {
  const { goals, isLoading, create, update, remove, addContribution, isSaving, isAddingContribution } = useGoals();
  const { confirm, dialogProps, setLoading: setDialogLoading, close: closeDialog } = useConfirmDialog();

  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [formVisible, setFormVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null);

  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount);
  const visibleGoals = filter === 'active' ? activeGoals : completedGoals;

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setFormVisible(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormVisible(true);
  };

  const handleFormSave = async (name: string, targetAmount: number, deadline: string) => {
    try {
      if (editingGoal) {
        await update(editingGoal.id, { name, targetAmount, deadline });
      } else {
        await create({ name, targetAmount, currentAmount: 0, deadline });
      }
      setFormVisible(false);
      setEditingGoal(null);
    } catch (e) {
      console.error('[GoalsScreen] save error:', e);
    }
  };

  const handleDelete = async () => {
    if (!editingGoal) return;
    const confirmed = await confirm({
      title: 'Excluir meta',
      message: `Remover a meta "${editingGoal.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      variant: 'danger',
      icon: <Trash2 size={24} color={colors.danger} strokeWidth={1.75} />,
    });
    if (!confirmed) return;
    setDialogLoading(true);
    try {
      await remove(editingGoal.id);
      closeDialog();
      setFormVisible(false);
      setEditingGoal(null);
    } catch (e) {
      console.error('[GoalsScreen] delete error:', e);
      closeDialog();
    }
  };

  const handleContribution = async (amount: number) => {
    if (!contributionGoal) return;
    try {
      await addContribution(contributionGoal.id, amount);
      setContributionGoal(null);
    } catch (e) {
      console.error('[GoalsScreen] contribution error:', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Label style={{ marginBottom: 4 }}>Acompanhamento</Label>
            <Text size="2xl" weight="bold">Metas</Text>
          </View>
          <Button variant="primary" size="icon" onPress={handleOpenCreate}>
            <Plus size={20} color="#fff" />
          </Button>
        </View>

        {isLoading ? (
          /* Skeleton */
          <>
            <View className="h-32 bg-background-surface rounded-3xl mb-4 border border-border opacity-40" />
            {[1, 2, 3].map((i) => (
              <View key={i} className="h-48 bg-background-surface rounded-3xl mb-3 border border-border opacity-40" />
            ))}
          </>
        ) : goals.length === 0 ? (
          /* Empty state — no goals at all */
          <View style={{ alignItems: 'center', paddingTop: 80, paddingBottom: 40 }}>
            <View
              style={{
                width: 80, height: 80, borderRadius: 24,
                backgroundColor: colors.primary.DEFAULT + '15',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Target size={40} color={colors.primary[400]} strokeWidth={1.5} />
            </View>
            <Text size="lg" weight="semibold" style={{ marginBottom: 8 }}>
              Nenhuma meta ainda
            </Text>
            <Text size="sm" variant="muted" style={{ textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              Defina objetivos financeiros e{'\n'}acompanhe seu progresso.
            </Text>
            <Button
              variant="primary"
              label="Criar primeira meta"
              size="md"
              onPress={handleOpenCreate}
            />
          </View>
        ) : (
          <>
            <GoalsSummary goals={goals} />

            {/* Filter tabs */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {([
                { key: 'active', label: 'Em andamento', count: activeGoals.length },
                { key: 'completed', label: 'Concluídas', count: completedGoals.length },
              ] as const).map(({ key, label, count }) => {
                const active = filter === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setFilter(key)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 999,
                      backgroundColor: active ? colors.primary.DEFAULT : colors.background.elevated,
                      borderWidth: 1,
                      borderColor: active ? colors.primary.DEFAULT : colors.border.DEFAULT,
                    }}
                    className="active:opacity-75"
                  >
                    <Text size="sm" weight="semibold" style={{ color: active ? '#fff' : colors.text.secondary }}>
                      {label}
                    </Text>
                    {count > 0 && (
                      <View
                        style={{
                          minWidth: 18, height: 18, borderRadius: 999,
                          paddingHorizontal: 4,
                          alignItems: 'center', justifyContent: 'center',
                          backgroundColor: active ? 'rgba(255,255,255,0.25)' : colors.background.card,
                        }}
                      >
                        <Text size="xs" weight="bold" style={{ color: active ? '#fff' : colors.text.muted }}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Goal list */}
            {visibleGoals.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 48, paddingBottom: 24 }}>
                <Trophy size={36} color={colors.text.muted} strokeWidth={1.5} />
                <Text size="sm" variant="muted" style={{ marginTop: 12, textAlign: 'center' }}>
                  {filter === 'completed'
                    ? 'Nenhuma meta concluída ainda.\nContinue firme!'
                    : 'Todas as metas foram concluídas! 🏆'}
                </Text>
              </View>
            ) : (
              visibleGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => handleOpenEdit(goal)}
                  onAddContribution={() => setContributionGoal(goal)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <GoalFormModal
        visible={formVisible}
        existing={editingGoal}
        isSaving={isSaving}
        onSave={handleFormSave}
        onDelete={editingGoal ? handleDelete : undefined}
        onClose={() => {
          setFormVisible(false);
          setEditingGoal(null);
        }}
      />

      <ContributionModal
        visible={contributionGoal !== null}
        goal={contributionGoal}
        isPending={isAddingContribution}
        onConfirm={handleContribution}
        onClose={() => setContributionGoal(null)}
      />

      <ConfirmDialog {...dialogProps} />
    </SafeAreaView>
  );
}
