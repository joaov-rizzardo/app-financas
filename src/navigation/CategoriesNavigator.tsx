import * as React from 'react';
import { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useCategories } from '@/hooks/useCategories';
import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { CategoryFormScreen } from '@/screens/CategoryFormScreen';
import type { Category, TransactionType } from '@/types/finance';

type View =
  | { screen: 'list' }
  | { screen: 'form'; category: Category | null; defaultType: TransactionType };

export function CategoriesNavigator() {
  const { categories, loading, create, update, remove } = useCategories();
  const [view, setView] = useState<View>({ screen: 'list' });

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
      <CategoryFormScreen
        category={view.category}
        defaultType={view.defaultType}
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
    <CategoriesScreen
      categories={categories}
      loading={loading}
      onEdit={(cat) =>
        setView({ screen: 'form', category: cat, defaultType: cat.type })
      }
      onCreateNew={(type) =>
        setView({ screen: 'form', category: null, defaultType: type })
      }
      onDelete={remove}
    />
  );
}
