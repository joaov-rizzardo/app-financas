import { calculatePercentageDiff } from "@/helpers/calculate-percentage-diff";
import { useTransactionsQuery } from "./queries/use-transactions-query";

export function useSummary() {
  const {
    data: { currentTransactions, previousTransactions },
  } = useTransactionsQuery();

  const calculateSummary = () => {
    const current = currentTransactions.reduce(
      (carry, item) => {
        if (item.type === "expense") {
          carry.expenses += item.value;
          carry.balance -= item.value;
        }
        if (item.type === "income") {
          carry.incomings += item.value;
          carry.balance += item.value;
        }
        return carry;
      },
      { expenses: 0, incomings: 0, balance: 0 }
    );
    const previous = previousTransactions.reduce(
      (carry, item) => {
        if (item.type === "expense") {
          carry.expenses += item.value;
          carry.balance -= item.value;
        }
        if (item.type === "income") {
          carry.incomings += item.value;
          carry.balance += item.value;
        }
        return carry;
      },
      { expenses: 0, incomings: 0, balance: 0 }
    );
    return {
      expenses: current.expenses,
      expensesPercent: Math.round(calculatePercentageDiff(current.expenses, previous.expenses)),
      incomings: current.incomings,
      incomingsPercent: Math.round(calculatePercentageDiff(current.incomings, previous.incomings)),
      balance: current.balance,
      balancePercent: Math.round(calculatePercentageDiff(current.balance, previous.balance)),
      dailyExpense: current.expenses / new Date().getDate(),
    };
  };
  return { calculateSummary };
}
