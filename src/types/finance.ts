export type TransactionType = 'income' | 'expense';
export type Frequency = 'monthly' | 'weekly';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO 8601
  categoryId: string;
  description: string;
  isRecurring: boolean;
  recurringId?: string;
  installmentTotal?: number;
  installmentCurrent?: number;
  creditCardInvoiceMonth?: string; // YYYY-MM — set when generated from a credit card invoice
  createdAt: string; // ISO 8601
}

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide-react-native icon name
  color: string; // hex color
  type: TransactionType;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO 8601
  createdAt: string; // ISO 8601
}

export interface RecurringItem {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  frequency: Frequency;
  startDate: string; // ISO 8601
  lastGeneratedAt?: string; // ISO 8601
  installmentTotal?: number;
  installmentCurrent?: number;
}

export type RecurringCardType = 'subscription' | 'installment';

export interface RecurringCardItem {
  id: string;
  type: RecurringCardType;
  amount: number;
  categoryId: string;
  description: string;
  startInvoiceMonth: string; // YYYY-MM — primeira fatura
  lastGeneratedInvoiceMonth?: string; // YYYY-MM — última fatura gerada
  installmentTotal?: number; // apenas para type === 'installment'
  installmentCurrent?: number; // apenas para type === 'installment'
  createdAt: string; // ISO 8601
}

export interface CreditCardExpense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO 8601
  installmentTotal: number;
  installmentCurrent: number;
  invoiceMonth: string; // YYYY-MM
}

export interface CreditCardConfig {
  closingDay: number; // 1–31
  dueDay: number; // 1–31
  limit?: number; // optional card limit for UI display
}
