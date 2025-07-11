import { SummaryCard } from "@/components/summary-card/summary-card.component";
import { TransactionCard } from "@/components/transaction-card/transaction-card.component";
import { Button } from "@/components/ui/button/button.component";
import { Input } from "@/components/ui/input/input.component";
import { textPrimaryColor } from "@/constants/colors";
import { useTransactionsQuery } from "@/hooks/queries/use-transactions-query";
import { useCategory } from "@/hooks/use-category";
import { useSummary } from "@/hooks/use-summary";
import { TransactionModel } from "@/models/transaction.model";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { styles } from "../../../styles/home.styles";

export default function Home() {
  const [transactionOrder, setTransactionOrder] = useState<"desc" | "asc">(
    "desc"
  );
  const [filter, setFilter] = useState<string>("");
  const { getCategory } = useCategory();
  const {
    data: { currentTransactions },
  } = useTransactionsQuery();
  const { calculateSummary } = useSummary();

  const summary = calculateSummary();

  const toogleTransactionOrder = () => {
    setTransactionOrder((state) => {
      if (state === "asc") {
        return "desc";
      }
      return "asc";
    });
  };

  const sortTransactionOrder = (a: TransactionModel, b: TransactionModel) => {
    if (transactionOrder === "asc") {
      return a.date.seconds - b.date.seconds;
    }
    return b.date.seconds - a.date.seconds;
  };

  const filterTransactions = (transaction: TransactionModel) => {
    if (!filter.trim()) return true;

    const normalizedFilter = filter.trim().toLowerCase();
    const category = getCategory(transaction.category, transaction.type);

    return (
      transaction.description.toLowerCase().includes(normalizedFilter) ||
      category.name.toLowerCase().includes(normalizedFilter) ||
      transaction.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).includes(normalizedFilter)
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardsContainer}>
        <View style={styles.cardsLine}>
          <SummaryCard
            name="Receita"
            value={summary.incomings}
            diffPercent={summary.incomingsPercent}
          />
          <SummaryCard
            name="Despesas"
            value={summary.expenses}
            diffPercent={summary.expensesPercent}
          />
        </View>
        <View style={styles.cardsLine}>
          <SummaryCard
            name="Saldo"
            value={summary.balance}
            diffPercent={summary.balancePercent}
          />
          <SummaryCard
            name="Gasto p/ dia"
            value={summary.dailyExpense}
            diffPercent={0}
          />
        </View>
      </View>
      <View style={styles.searchArea}>
        <Input
          icon="search"
          placeholder="Buscar..."
          containerStyle={styles.input}
          value={filter}
          onChangeText={(text) => setFilter(text)}
        />
        <Button variant="tertiary" mode="icon" onPress={toogleTransactionOrder}>
          <MaterialIcon name="swap-vert" color={textPrimaryColor} size={32} />
        </Button>
      </View>
      <View style={styles.movimentationsArea}>
        {currentTransactions
          .filter(filterTransactions)
          .sort(sortTransactionOrder)
          .map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
      </View>
    </ScrollView>
  );
}
