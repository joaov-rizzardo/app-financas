import { useRouter } from "expo-router";
import { View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { CreateTransactionModal } from "../create-transaction-modal/create-transaction-modal.component";
import { Button } from "../ui/button/button.component";
import { styles } from "./tab-navigator.styles";

export function TabNavigator() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Button style={styles.navigationButton} variant="tertiary" onPress={() => router.push("/home")} mode="icon">
        <MaterialIcons name="home" size={54} />
      </Button>
      <CreateTransactionModal />
      <Button style={styles.navigationButton} variant="tertiary" onPress={() => router.push("/charts")} mode="icon">
        <MaterialIcons name="pie-chart" size={54} />
      </Button>
    </View>
  );
}
