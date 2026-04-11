export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionCategory =
  | 'salary'
  | 'food'
  | 'transport'
  | 'health'
  | 'entertainment'
  | 'education'
  | 'housing'
  | 'clothing'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string; // ISO 8601
  accountId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  limitAmount: number;
  spentAmount: number;
  period: 'monthly' | 'weekly';
  userId: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
