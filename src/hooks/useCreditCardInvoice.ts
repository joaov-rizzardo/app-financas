import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { closeInvoice, getInvoicePayment } from '@/services/creditCardInvoices';
import type { CreditCardExpense } from '@/types/finance';
import { TRANSACTIONS_QUERY_KEY } from './useTransactions';

export const CREDIT_CARD_INVOICE_QUERY_KEY = ['creditCardInvoice'] as const;

export function useCreditCardInvoice(invoiceMonth: string) {
  const queryClient = useQueryClient();

  const queryKey = [...CREDIT_CARD_INVOICE_QUERY_KEY, invoiceMonth] as const;

  const { data: payment = null, isLoading } = useQuery({
    queryKey,
    queryFn: () => getInvoicePayment(invoiceMonth),
  });

  const closeMutation = useMutation({
    mutationFn: ({
      expenses,
      categoryId,
    }: {
      expenses: CreditCardExpense[];
      categoryId: string;
    }) => closeInvoice(invoiceMonth, expenses, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    payment,
    isLoading,
    close: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
  };
}
