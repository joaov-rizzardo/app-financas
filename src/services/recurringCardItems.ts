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
import type { RecurringCardItem, RecurringCardType } from '@/types/finance';

const COLLECTION = 'recurringCardItems';

export async function listRecurringCardItems(
  type?: RecurringCardType,
): Promise<RecurringCardItem[]> {
  const q = type
    ? query(collection(db, COLLECTION), where('type', '==', type))
    : query(collection(db, COLLECTION));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RecurringCardItem));
}

export async function getRecurringCardItemById(id: string): Promise<RecurringCardItem | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as RecurringCardItem;
}

export async function createRecurringCardItem(
  data: Omit<RecurringCardItem, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
}

export async function updateRecurringCardItem(
  id: string,
  data: Partial<Omit<RecurringCardItem, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteRecurringCardItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
