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
import { db } from './firebase';
import type { Budget } from '@/types/finance';

const COLLECTION = 'budgets';

export async function listBudgets(month?: string): Promise<Budget[]> {
  const q = month
    ? query(collection(db, COLLECTION), where('month', '==', month))
    : query(collection(db, COLLECTION));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Budget));
}

export async function getBudgetById(id: string): Promise<Budget | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Budget;
}

export async function createBudget(data: Omit<Budget, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
}

export async function updateBudget(
  id: string,
  data: Partial<Omit<Budget, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteBudget(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
