import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction } from '@/types/finance';

const COLLECTION = 'transactions';

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

export async function addTransaction(
  data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
