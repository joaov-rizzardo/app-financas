import { TransactionsService } from "@/services/transactions.service";
import { decrementMonth, useMonthStore } from "@/store/month-store";
import { useQuery } from "@tanstack/react-query";

export function useTransactionsQuery() {
  const { year, month } = useMonthStore();
  const query = useQuery({
    queryKey: ["transaction-list", year, month],
    queryFn: async () => {
      const today = new Date();
      const { year: previousYear, month: previousMonth } = decrementMonth(
        month,
        year
      );
      const isCurrentMonth =
        today.getMonth() === month && today.getFullYear() === year;
      const referenceDay = isCurrentMonth ? today.getDate() : undefined;
      const [previousTransactions, currentTransactions] = await Promise.all([
        TransactionsService.getTransactionsByMonth(
          previousYear,
          previousMonth,
          referenceDay
        ),
        TransactionsService.getTransactionsByMonth(year, month, referenceDay),
      ]);
      return {
        previousTransactions,
        currentTransactions,
      };
    },
    initialData: {
      currentTransactions: [],
      previousTransactions: [],
    },
  });
  return query;
}
