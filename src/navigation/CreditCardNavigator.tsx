import * as React from 'react';
import { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useCreditCardExpenses } from '@/hooks/useCreditCardExpenses';
import { useCreditCardConfig } from '@/hooks/useCreditCardConfig';
import { useCategories } from '@/hooks/useCategories';
import { useRecurringCardItems } from '@/hooks/useRecurringCardItems';
import { useCreditCardInvoice } from '@/hooks/useCreditCardInvoice';
import { CreditCardScreen } from '@/screens/CreditCardScreen';
import { CreditCardExpenseFormScreen } from '@/screens/CreditCardExpenseFormScreen';
import { CreditCardConfigScreen } from '@/screens/CreditCardConfigScreen';
import { CreditCardRecurringScreen } from '@/screens/CreditCardRecurringScreen';
import { CreditCardRecurringItemFormScreen } from '@/screens/CreditCardRecurringItemFormScreen';

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'main' | 'form' | 'edit' | 'config' | 'recurring' | 'recurringEdit';

function currentInvoiceMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Navigator ────────────────────────────────────────────────────────────────

export function CreditCardNavigator() {
  const [view, setView] = useState<View>('main');
  const [invoiceMonth, setInvoiceMonth] = useState(currentInvoiceMonth);
  const [editingItem, setEditingItem] = React.useState<import('@/types/finance').RecurringCardItem | null>(null);
  const [editingExpense, setEditingExpense] = React.useState<import('@/types/finance').CreditCardExpense | null>(null);

  const { config } = useCreditCardConfig();
  const { expenses, isLoading, create, update, remove } = useCreditCardExpenses(invoiceMonth);
  const { categories } = useCategories();
  const { items: recurringItems, isLoading: recurringLoading, error: recurringError, remove: removeRecurringItem, update: updateRecurringItem } = useRecurringCardItems();
  const { payment, close: closeInvoice } = useCreditCardInvoice(invoiceMonth);

  useEffect(() => {
    if (view === 'main') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (view === 'recurringEdit') {
        setView('recurring');
      } else {
        setView('main');
      }
      return true;
    });
    return () => sub.remove();
  }, [view]);

  if (view === 'edit' && editingExpense) {
    return (
      <CreditCardExpenseFormScreen
        categories={categories}
        config={config}
        initialExpense={editingExpense}
        onCreate={async () => {}}
        onUpdate={async (id, data) => {
          await update({ id, data });
          setEditingExpense(null);
          setView('main');
        }}
        onBack={() => { setEditingExpense(null); setView('main'); }}
      />
    );
  }

  if (view === 'config') {
    return <CreditCardConfigScreen onBack={() => setView('main')} />;
  }

  if (view === 'recurringEdit' && editingItem) {
    return (
      <CreditCardRecurringItemFormScreen
        item={editingItem}
        categories={categories}
        onSave={async (id, data) => {
          await updateRecurringItem({ id, data });
          setEditingItem(null);
          setView('recurring');
        }}
        onBack={() => setView('recurring')}
      />
    );
  }

  if (view === 'recurring') {
    return (
      <CreditCardRecurringScreen
        items={recurringItems}
        categories={categories}
        isLoading={recurringLoading}
        error={recurringError ? String(recurringError) : null}
        onBack={() => setView('main')}
        onEdit={(item) => { setEditingItem(item); setView('recurringEdit'); }}
        onCancel={async (id) => { await removeRecurringItem(id); }}
      />
    );
  }

  if (view === 'form') {
    return (
      <CreditCardExpenseFormScreen
        categories={categories}
        config={config}
        onCreate={async (input) => {
          await create(input);
          setView('main');
        }}
        onBack={() => setView('main')}
      />
    );
  }

  return (
    <CreditCardScreen
      expenses={expenses}
      categories={categories}
      config={config}
      isLoading={isLoading}
      invoiceMonth={invoiceMonth}
      recurringCount={recurringItems.length}
      payment={payment}
      onMonthChange={setInvoiceMonth}
      onAdd={() => setView('form')}
      onSettings={() => setView('config')}
      onViewRecurring={() => setView('recurring')}
      onClose={async () => { await closeInvoice({ expenses, categoryId: '' }); }}
      onEdit={(expense) => { setEditingExpense(expense); setView('edit'); }}
      onDelete={async (expense) => { await remove(expense.id); }}
    />
  );
}
