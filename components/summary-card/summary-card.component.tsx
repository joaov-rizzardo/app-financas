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
import { styles } from "./summary-card.styles";

interface SummaryCardProps {
  value: number;
  name: string;
  diffPercent: number;
}

export function SummaryCard({ name, value, diffPercent }: SummaryCardProps) {
  return (
    <View style={styles.container}>
      <View>
        <Typography color={textSecondaryColor} size={12} weight="500">
          {name}
        </Typography>
        <Typography color={textPrimaryColor} size={16} weight="400">
          {value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </Typography>
      </View>
      <ConditionalRender condition={diffPercent < 0}>
        <View>
          <MaterialIcon name="trending-down" size={20} color={negativeColor} />
          <Typography color={negativeColor} weight="400" size={10}>
            {Math.abs(Math.round(diffPercent))}%
          </Typography>
        </View>
      </ConditionalRender>
      <ConditionalRender condition={diffPercent > 0}>
        <View>
          <MaterialIcon name="trending-up" size={20} color={positiveColor} />
          <Typography color={positiveColor} weight="400" size={10}>
            {Math.abs(Math.round(diffPercent))}%
          </Typography>
        </View>
      </ConditionalRender>
    </View>
  );
}
