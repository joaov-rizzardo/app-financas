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
import type { CreditCardExpense } from '@/types/finance';

const COLLECTION = 'creditCardExpenses';

export async function listCreditCardExpenses(invoiceMonth?: string): Promise<CreditCardExpense[]> {
  const q = invoiceMonth
    ? query(
        collection(db, COLLECTION),
        where('invoiceMonth', '==', invoiceMonth),
        orderBy('date', 'desc'),
      )
    : query(collection(db, COLLECTION), orderBy('date', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CreditCardExpense));
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
