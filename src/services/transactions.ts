import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction } from '@/types/finance';

const COLLECTION = 'transactions';

export async function listTransactions(filters?: {
  type?: Transaction['type'];
  categoryId?: string;
  from?: string;
  to?: string;
}): Promise<Transaction[]> {
  let q = query(collection(db, COLLECTION), orderBy('date', 'desc'));

  if (filters?.type) {
    q = query(q, where('type', '==', filters.type));
  }
  if (filters?.categoryId) {
    q = query(q, where('categoryId', '==', filters.categoryId));
  }
  if (filters?.from) {
    q = query(q, where('date', '>=', filters.from));
  }
  if (filters?.to) {
    q = query(q, where('date', '<=', filters.to));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Transaction;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...stripUndefined(data),
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), stripUndefined(data));
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
