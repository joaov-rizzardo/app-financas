import { textPrimaryColor } from "@/constants/colors";
import { getShortMonthName } from "@/helpers/get-short-month-name";
import { useMonthStore } from "@/store/month-store";
import { View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Button } from "../ui/button/button.component";
import { Typography } from "../ui/typography/typography.component";
import { styles } from "./top-bar.styles";

export function Topbar() {
  const { month, year, increment, decrement } = useMonthStore();

  const isCurrentMonth = () => {
    const today = new Date();
    return today.getMonth() === month && today.getFullYear() === year;
  };

  return (
    <View style={styles.container}>
      <Button variant="tertiary" onPress={decrement} mode="icon">
        <MaterialIcons name="chevron-left" size={24} color={textPrimaryColor} />
      </Button>
      <Typography size={24} weight="300" color={textPrimaryColor}>
        {getShortMonthName(month)} {year}
      </Typography>
      <Button variant="tertiary" onPress={increment} disabled={isCurrentMonth()} mode="icon">
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={textPrimaryColor}
        />
      </Button>
    </View>
  );
}
