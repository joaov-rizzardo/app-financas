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
import type { Category, TransactionType } from '@/types/finance';

const COLLECTION = 'categories';

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

export async function createCategory(data: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
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
