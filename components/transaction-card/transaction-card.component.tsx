import {
  negativeColor,
  positiveColor,
  textPrimaryColor,
  textSecondaryColor,
} from "@/constants/colors";
import { View } from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { ConditionalRender } from "../conditional-render";
import { Typography } from "../ui/typography/typography.component";
import { styles } from "./transaction-card.styles";

interface TransactionCardProps {
  icon: string;
  description: string;
  value: number;
}

export function TransactionCard({
  icon,
  description,
  value,
}: TransactionCardProps) {
  return (
    <View style={styles.container}>
      <MaterialIcon name={icon} size={36} color={textPrimaryColor} />
      <View style={styles.textArea}>
        <Typography size={12} weight="500" color={textSecondaryColor}>
          {description}
        </Typography>
        <Typography size={16} weight="400" color={textPrimaryColor}>
          {Math.abs(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </Typography>
      </View>
      <ConditionalRender condition={value < 0}>
        <MaterialIcon name="arrow-downward" size={24} color={negativeColor} />
      </ConditionalRender>
      <ConditionalRender condition={value > 0}>
        <MaterialIcon name="arrow-upward" size={24} color={positiveColor} />
      </ConditionalRender>
    </View>
  );
}
