import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Modal,
  Pressable,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Clock,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Text, Label } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
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

const GOAL_FORM_HEIGHT = 520;
const CONTRIBUTION_HEIGHT = 300;

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
  const translateY = useRef(new Animated.Value(CONTRIBUTION_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [rawCents, setRawCents] = useState(0);
  const [isWithdraw, setIsWithdraw] = useState(false);

  useEffect(() => {
    if (visible) {
      setRawCents(0);
      setIsWithdraw(false);
      translateY.setValue(CONTRIBUTION_HEIGHT);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 280, friction: 26, useNativeDriver: true }),
      ]).start();
    } else {
      translateY.setValue(CONTRIBUTION_HEIGHT);
      opacity.setValue(0);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxWithdrawCents = Math.round((goal?.currentAmount ?? 0) * 100);
  const exceedsBalance = isWithdraw && rawCents > maxWithdrawCents;
  const canConfirm = rawCents > 0 && !exceedsBalance;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(isWithdraw ? -(rawCents / 100) : rawCents / 100);
  };

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={isPending ? undefined : onClose}
    >
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', opacity }}>
        <Pressable style={{ flex: 1 }} onPress={isPending ? undefined : onClose} />
        <Animated.View
          style={{
            backgroundColor: colors.background.elevated,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.border.DEFAULT,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
            transform: [{ translateY }],
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: colors.border.DEFAULT,
              alignSelf: 'center', marginBottom: 22,
            }}
          />

          {/* Title */}
          <View style={{ marginBottom: 16 }}>
            <Label style={{ marginBottom: 4 }}>Movimentar valor</Label>
            <Text size="lg" weight="bold" numberOfLines={1}>
              {goal?.name ?? ''}
            </Text>
          </View>

          {/* Mode toggle */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.background.card,
              borderRadius: 12,
              padding: 3,
              marginBottom: 16,
            }}
          >
            {(['add', 'withdraw'] as const).map((mode) => {
              const active = (mode === 'withdraw') === isWithdraw;
              return (
                <Pressable
                  key={mode}
                  onPress={() => { setIsWithdraw(mode === 'withdraw'); setRawCents(0); }}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: active
                      ? (mode === 'withdraw' ? colors.danger + 'dd' : colors.primary.DEFAULT)
                      : 'transparent',
                  }}
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

          {/* Amount input */}
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: exceedsBalance ? colors.danger : colors.border.DEFAULT,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: exceedsBalance ? 6 : 20,
            }}
          >
            <Text
              size="xl"
              weight="semibold"
              style={{ marginRight: 6, color: isWithdraw ? colors.danger : colors.text.muted }}
            >
              {isWithdraw ? '−' : '+'} R$
            </Text>
            <TextInput
              value={centsToDisplay(rawCents)}
              onChangeText={(t) => setRawCents(displayToCents(t))}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor={colors.text.muted}
              autoFocus
              style={{ flex: 1, fontSize: 28, fontWeight: '700', color: colors.text.primary }}
            />
          </View>

          {/* Validation message */}
          {exceedsBalance && (
            <Text size="xs" style={{ color: colors.danger, marginBottom: 16 }}>
              Valor maior que o saldo atual ({formatCurrency(goal?.currentAmount ?? 0)})
            </Text>
          )}

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              variant="secondary"
              label="Cancelar"
              size="md"
              onPress={onClose}
              disabled={isPending}
              style={{ flex: 1 }}
            />
            <Button
              variant={isWithdraw ? 'destructive' : 'primary'}
              label={isWithdraw ? 'Remover' : 'Adicionar'}
              size="md"
              onPress={handleConfirm}
              disabled={!canConfirm || isPending}
              loading={isPending}
              style={{ flex: 1 }}
            />
          </View>
        </Animated.View>
      </Animated.View>
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
  const translateY = useRef(new Animated.Value(GOAL_FORM_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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
      translateY.setValue(GOAL_FORM_HEIGHT);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 280, friction: 26, useNativeDriver: true }),
      ]).start();
    } else {
      translateY.setValue(GOAL_FORM_HEIGHT);
      opacity.setValue(0);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSave = name.trim().length > 0 && rawCents > 0;

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={isSaving ? undefined : onClose}
    >
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', opacity }}>
        <Pressable style={{ flex: 1 }} onPress={isSaving ? undefined : onClose} />
        <Animated.View
          style={{
            backgroundColor: colors.background.elevated,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.border.DEFAULT,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
            transform: [{ translateY }],
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: colors.border.DEFAULT,
              alignSelf: 'center', marginBottom: 22,
            }}
          />

          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Label style={{ marginBottom: 4 }}>
              {existing ? 'Editar meta' : 'Nova meta'}
            </Label>
            <Text size="xl" weight="bold">
              {existing ? existing.name : 'Definir objetivo'}
            </Text>
          </View>

          {/* Name input */}
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border.DEFAULT,
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginBottom: 12,
            }}
          >
            <Label style={{ marginBottom: 6 }}>Nome da meta</Label>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Reserva de emergência"
              placeholderTextColor={colors.text.muted}
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: colors.text.primary,
              }}
            />
          </View>

          {/* Target amount input */}
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border.DEFAULT,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Label style={{ marginBottom: 6 }}>Valor alvo</Label>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text size="lg" weight="semibold" variant="muted" style={{ marginRight: 6 }}>R$</Text>
                <TextInput
                  value={centsToDisplay(rawCents)}
                  onChangeText={(t) => setRawCents(displayToCents(t))}
                  keyboardType="numeric"
                  placeholder="0,00"
                  placeholderTextColor={colors.text.muted}
                  style={{ flex: 1, fontSize: 20, fontWeight: '700', color: colors.text.primary }}
                />
              </View>
            </View>
          </View>

          {/* Deadline picker */}
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border.DEFAULT,
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginBottom: 20,
            }}
          >
            <Label style={{ marginBottom: 10 }}>Prazo</Label>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pressable
                onPress={() => setDeadline((d) => shiftDeadlineMonth(d.year, d.month, -1))}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: colors.background.elevated,
                  alignItems: 'center', justifyContent: 'center',
                }}
                className="active:opacity-60"
              >
                <ChevronLeft size={18} color={colors.text.secondary} />
              </Pressable>

              <Text size="base" weight="semibold">
                {MONTHS_PT_FULL[deadline.month]} {deadline.year}
              </Text>

              <Pressable
                onPress={() => setDeadline((d) => shiftDeadlineMonth(d.year, d.month, 1))}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: colors.background.elevated,
                  alignItems: 'center', justifyContent: 'center',
                }}
                className="active:opacity-60"
              >
                <ChevronRight size={18} color={colors.text.secondary} />
              </Pressable>
            </View>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: existing && onDelete ? 12 : 0 }}>
            <Button
              variant="secondary"
              label="Cancelar"
              size="md"
              onPress={onClose}
              disabled={isSaving}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Salvar"
              size="md"
              onPress={() =>
                canSave &&
                onSave(name.trim(), rawCents / 100, stateToDeadlineIso(deadline.year, deadline.month))
              }
              disabled={!canSave || isSaving}
              loading={isSaving}
              style={{ flex: 1 }}
            />
          </View>

          {/* Delete */}
          {existing && onDelete && (
            <Pressable
              onPress={onDelete}
              disabled={isSaving}
              style={{
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', gap: 6,
                paddingVertical: 10,
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
        </Animated.View>
      </Animated.View>
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
