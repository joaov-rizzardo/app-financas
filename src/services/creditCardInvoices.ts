import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { createTransaction } from './transactions';
import type { CreditCardExpense } from '@/types/finance';

const COLLECTION = 'creditCardInvoices';

export interface CreditCardInvoicePayment {
  id: string;
  invoiceMonth: string;      // YYYY-MM
  closedAt: string;          // ISO 8601
  totalAmount: number;
  transactionIds: string[];
}

export async function closeInvoice(
  invoiceMonth: string,
  expenses: CreditCardExpense[],
  _categoryId: string,
): Promise<CreditCardInvoicePayment> {
  const now = new Date().toISOString();

  const closingDate = now.substring(0, 10); // YYYY-MM-DD

  const transactionIds = await Promise.all(
    expenses.map((expense) =>
      createTransaction({
        type: 'expense',
        amount: expense.amount,
        date: closingDate,
        categoryId: expense.categoryId,
        description: expense.description,
        isRecurring: false,
        creditCardInvoiceMonth: invoiceMonth,
      }),
    ),
  );

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const ref = await addDoc(collection(db, COLLECTION), {
    invoiceMonth,
    closedAt: now,
    totalAmount,
    transactionIds,
  });

  return { id: ref.id, invoiceMonth, closedAt: now, totalAmount, transactionIds };
}

export async function getInvoicePayment(
  invoiceMonth: string,
): Promise<CreditCardInvoicePayment | null> {
  const q = query(collection(db, COLLECTION), where('invoiceMonth', '==', invoiceMonth));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as CreditCardInvoicePayment;
}

export async function listInvoicePayments(): Promise<CreditCardInvoicePayment[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CreditCardInvoicePayment));
}
