import * as React from 'react';
import { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { TransactionsScreen } from '@/screens/TransactionsScreen';
import { TransactionFormScreen } from '@/screens/TransactionFormScreen';
import type { Transaction } from '@/types/finance';

// ─── Types ────────────────────────────────────────────────────────────────────

type View =
  | { screen: 'list' }
  | { screen: 'form'; transaction: Transaction | null };

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

  useEffect(() => {
    if (view.screen !== 'form') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setView({ screen: 'list' });
      return true;
    });
    return () => sub.remove();
  }, [view.screen]);

  if (view.screen === 'form') {
    return (
      <TransactionFormScreen
        transaction={view.transaction}
        categories={categories}
        onCreate={async (data) => {
          await create(data);
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
      onMonthChange={setMonth}
      onAdd={() => setView({ screen: 'form', transaction: null })}
      onEdit={(tx) => setView({ screen: 'form', transaction: tx })}
      onDelete={remove}
    />
  );
}
