import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { CreditCardConfig } from '@/types/finance';

// Single-document collection: one config per app instance
const COLLECTION = 'creditCardConfig';
const DOC_ID = 'default';

export async function getCreditCardConfig(): Promise<CreditCardConfig | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, DOC_ID));
  if (!snapshot.exists()) return null;
  return snapshot.data() as CreditCardConfig;
}

export async function setCreditCardConfig(data: CreditCardConfig): Promise<void> {
  await setDoc(doc(db, COLLECTION, DOC_ID), data);
}
