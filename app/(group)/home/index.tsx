import { SummaryCard } from "@/components/summary-card/summary-card.component";
import { TransactionCard } from "@/components/transaction-card/transaction-card.component";
import { Button } from "@/components/ui/button/button.component";
import { Input } from "@/components/ui/input/input.component";
import { textPrimaryColor } from "@/constants/colors";
import { useTransactionsQuery } from "@/hooks/queries/use-transactions-query";
import { useSummary } from "@/hooks/use-summary";
import { ScrollView, View } from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { styles } from "../../../styles/home.styles";

export default function Home() {
  const {
    data: { currentTransactions },
  } = useTransactionsQuery();
  const { calculateSummary } = useSummary()

  const summary = calculateSummary()

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardsContainer}>
        <View style={styles.cardsLine}>
          <SummaryCard name="Receita" value={summary.incomings} diffPercent={summary.incomingsPercent} />
          <SummaryCard name="Despesas" value={summary.expenses} diffPercent={summary.expensesPercent} />
        </View>
        <View style={styles.cardsLine}>
          <SummaryCard name="Saldo" value={summary.balance} diffPercent={summary.balancePercent} />
          <SummaryCard name="Gasto p/ dia" value={summary.dailyExpense} diffPercent={0} />
        </View>
      </View>
      <View style={styles.searchArea}>
        <Input
          icon="search"
          placeholder="Buscar..."
          containerStyle={styles.input}
        />
        <Button variant="tertiary" mode="icon">
          <MaterialIcon name="swap-vert" color={textPrimaryColor} size={32} />
        </Button>
      </View>
      <View style={styles.movimentationsArea}>
        {currentTransactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </View>
    </ScrollView>
  );
}
