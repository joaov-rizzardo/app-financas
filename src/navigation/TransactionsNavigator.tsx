import * as React from 'react';
import { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useRecurringItems } from '@/hooks/useRecurringItems';
import { TransactionsScreen } from '@/screens/TransactionsScreen';
import { TransactionFormScreen } from '@/screens/TransactionFormScreen';
import { RecurringItemsScreen } from '@/screens/RecurringItemsScreen';
import type { Transaction } from '@/types/finance';

// ─── Types ────────────────────────────────────────────────────────────────────

type View =
  | { screen: 'list' }
  | { screen: 'form'; transaction: Transaction | null }
  | { screen: 'recurring' };

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Navigator ────────────────────────────────────────────────────────────────

export function TransactionsNavigator() {
  const [view, setView] = useState<View>({ screen: 'list' });
  const [month, setMonth] = useState(currentMonth);

  const { transactions, isLoading, error, create, update, remove } = useTransactions(month);
  const { categories } = useCategories();
  const { recurringItems, isLoading: recurringLoading, error: recurringError, remove: cancelRecurring } = useRecurringItems();

  useEffect(() => {
    if (view.screen === 'list') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setView({ screen: 'list' });
      return true;
    });
    return () => sub.remove();
  }, [view.screen]);

  if (view.screen === 'recurring') {
    return (
      <RecurringItemsScreen
        recurringItems={recurringItems}
        categories={categories}
        isLoading={recurringLoading}
        error={recurringError}
        onBack={() => setView({ screen: 'list' })}
        onCancel={cancelRecurring}
      />
    );
  }

  if (view.screen === 'form') {
    return (
      <TransactionFormScreen
        transaction={view.transaction}
        categories={categories}
        onCreate={async (data, frequency) => {
          await create(data, frequency);
          setView({ screen: 'list' });
        }}
        onUpdate={async (id, data) => {
          await update(id, data);
          setView({ screen: 'list' });
        }}
        onBack={() => setView({ screen: 'list' })}
      />
    );
  }

  return (
    <TransactionsScreen
      transactions={transactions}
      categories={categories}
      isLoading={isLoading}
      error={error}
      month={month}
      recurringCount={recurringItems.length}
      onMonthChange={setMonth}
      onAdd={() => setView({ screen: 'form', transaction: null })}
      onEdit={(tx) => setView({ screen: 'form', transaction: tx })}
      onDelete={remove}
      onViewRecurring={() => setView({ screen: 'recurring' })}
    />
  );
}
