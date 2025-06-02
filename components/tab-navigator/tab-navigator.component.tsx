import { textPrimaryColor, textSecondaryColor } from "@/constants/colors";
import { useRouter } from "expo-router";
import { View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Button } from "../ui/button/button.component";
import { styles } from "./tab-navigator.styles";

export function TabNavigator() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Button style={styles.navigationButton} variant="tertiary" onPress={() => router.push("/home")}>
        <MaterialIcons name="home" size={54} color={textSecondaryColor} />
      </Button>
      <Button variant="primary" style={styles.addButton} onPress={() => router.push("/home")}>
        <MaterialIcons name="add" size={38} color={textPrimaryColor} />
      </Button>
      <Button style={styles.navigationButton} variant="tertiary" onPress={() => router.push("/charts")}>
        <MaterialIcons name="pie-chart" size={54} color={textSecondaryColor} />
      </Button>
    </View>
  );
}
