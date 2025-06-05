import { MovimentationCard } from "@/components/movimentation-card/movimentation-card.component";
import { SummaryCard } from "@/components/summary-card/summary-card.component";
import { Button } from "@/components/ui/button/button.component";
import { Input } from "@/components/ui/input/input.component";
import { textPrimaryColor } from "@/constants/colors";
import { ScrollView, View } from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { styles } from "../../../styles/home.styles";

export default function Home() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardsContainer}>
        <View style={styles.cardsLine}>
          <SummaryCard name="Receita" value={1600} diffPercent={14} />
          <SummaryCard name="Despesas" value={850.48} diffPercent={-23} />
        </View>
        <View style={styles.cardsLine}>
          <SummaryCard name="Saldo" value={450.18} diffPercent={13} />
          <SummaryCard name="Gasto p/ dia" value={335.18} diffPercent={-15} />
        </View>
      </View>
      <View style={styles.searchArea}>
        <Input icon="search" placeholder="Buscar..." containerStyle={styles.input}/>
        <Button variant="tertiary" mode="icon">
          <MaterialIcon name="swap-vert" color={textPrimaryColor} size={32}/>
        </Button>
      </View>
      <View style={styles.movimentationsArea}>
        <MovimentationCard icon="home" value={-123.54} description="Gasto com a casa"/>
        <MovimentationCard icon="payments" value={1650.00} description="Salário"/>
        <MovimentationCard icon="shopping-cart" value={-654.32} description="Supermercado"/>
        <MovimentationCard icon="pets" value={-50.35} description="Ração veio"/>
      </View>
    </ScrollView>
  );
}
