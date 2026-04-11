import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import type { Category, TransactionType } from '@/types/finance';

const COLLECTION = 'categories';
const SEEDED_KEY = '@app_financas/categories_seeded_v1';

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Income
  { name: 'Salário',       icon: 'Briefcase',  color: '#10b981', type: 'income'  },
  { name: 'Freelance',     icon: 'Code2',       color: '#06b6d4', type: 'income'  },
  { name: 'Investimentos', icon: 'TrendingUp',  color: '#7c3aed', type: 'income'  },
  { name: 'Outros',        icon: 'Layers',      color: '#a0a0b8', type: 'income'  },
  // Expense
  { name: 'Alimentação',   icon: 'Utensils',    color: '#f97316', type: 'expense' },
  { name: 'Transporte',    icon: 'Car',         color: '#f59e0b', type: 'expense' },
  { name: 'Saúde',         icon: 'Heart',       color: '#ec4899', type: 'expense' },
  { name: 'Lazer',         icon: 'Gamepad2',    color: '#8b5cf6', type: 'expense' },
  { name: 'Moradia',       icon: 'Home',        color: '#3b82f6', type: 'expense' },
  { name: 'Educação',      icon: 'BookOpen',    color: '#06b6d4', type: 'expense' },
];

export async function seedDefaultCategories(): Promise<void> {
  const seeded = await AsyncStorage.getItem(SEEDED_KEY);
  if (seeded) return;

  const snapshot = await getDocs(collection(db, COLLECTION));
  if (snapshot.empty) {
    await Promise.all(
      DEFAULT_CATEGORIES.map((cat) => addDoc(collection(db, COLLECTION), cat)),
    );
  }
  await AsyncStorage.setItem(SEEDED_KEY, 'true');
}

export async function listCategories(type?: TransactionType): Promise<Category[]> {
  const q = type
    ? query(collection(db, COLLECTION), where('type', '==', type))
    : query(collection(db, COLLECTION));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Category;
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
