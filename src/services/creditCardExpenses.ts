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
import type { CreditCardExpense } from '@/types/finance';

const COLLECTION = 'creditCardExpenses';

export async function listCreditCardExpenses(invoiceMonth?: string): Promise<CreditCardExpense[]> {
  // Avoid composite index requirement by not mixing where() + orderBy() on different fields.
  // Sort client-side instead.
  const q = invoiceMonth
    ? query(collection(db, COLLECTION), where('invoiceMonth', '==', invoiceMonth))
    : query(collection(db, COLLECTION));

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CreditCardExpense));
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getCreditCardExpenseById(id: string): Promise<CreditCardExpense | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as CreditCardExpense;
}

export async function createCreditCardExpense(
  data: Omit<CreditCardExpense, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
}

export async function updateCreditCardExpense(
  id: string,
  data: Partial<Omit<CreditCardExpense, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteCreditCardExpense(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
