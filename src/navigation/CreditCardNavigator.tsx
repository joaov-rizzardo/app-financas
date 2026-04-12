import * as React from 'react';
import { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useCreditCardExpenses } from '@/hooks/useCreditCardExpenses';
import { useCreditCardConfig } from '@/hooks/useCreditCardConfig';
import { useCategories } from '@/hooks/useCategories';
import { CreditCardScreen } from '@/screens/CreditCardScreen';
import { CreditCardExpenseFormScreen } from '@/screens/CreditCardExpenseFormScreen';
import { CreditCardConfigScreen } from '@/screens/CreditCardConfigScreen';

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'main' | 'form' | 'config';

function currentInvoiceMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Navigator ────────────────────────────────────────────────────────────────

export function CreditCardNavigator() {
  const [view, setView] = useState<View>('main');
  const [invoiceMonth, setInvoiceMonth] = useState(currentInvoiceMonth);

  const { config } = useCreditCardConfig();
  const { expenses, isLoading, create } = useCreditCardExpenses(invoiceMonth);
  const { categories } = useCategories();

  useEffect(() => {
    if (view === 'main') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setView('main');
      return true;
    });
    return () => sub.remove();
  }, [view]);

  if (view === 'config') {
    return <CreditCardConfigScreen onBack={() => setView('main')} />;
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
      onMonthChange={setInvoiceMonth}
      onAdd={() => setView('form')}
      onSettings={() => setView('config')}
    />
  );
}
