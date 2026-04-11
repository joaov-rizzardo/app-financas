import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '@/services/transactions';
import type { Transaction } from '@/types/finance';

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches transactions for a given user from Firestore.
 *
 * @example
 * const { transactions, loading } = useTransactions('user-id-123');
 */
export function useTransactions(userId: string): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions(userId);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { transactions, loading, error, refetch: fetch };
}
