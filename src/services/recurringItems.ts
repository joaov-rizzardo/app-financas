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
import type { RecurringItem, TransactionType } from '@/types/finance';

const COLLECTION = 'recurringItems';

export async function listRecurringItems(type?: TransactionType): Promise<RecurringItem[]> {
  const q = type
    ? query(collection(db, COLLECTION), where('type', '==', type))
    : query(collection(db, COLLECTION));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RecurringItem));
}

export async function getRecurringItemById(id: string): Promise<RecurringItem | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as RecurringItem;
}

export async function createRecurringItem(
  data: Omit<RecurringItem, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
}

export async function updateRecurringItem(
  id: string,
  data: Partial<Omit<RecurringItem, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteRecurringItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
