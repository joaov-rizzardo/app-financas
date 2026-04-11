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
} from 'firebase/firestore';
import { db } from './firebase';
import type { Goal } from '@/types/finance';

const COLLECTION = 'goals';

export async function listGoals(): Promise<Goal[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Goal));
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Goal;
}

export async function createGoal(data: Omit<Goal, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateGoal(
  id: string,
  data: Partial<Omit<Goal, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteGoal(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
