import {
  negativeColor,
  positiveColor,
  textPrimaryColor,
  textSecondaryColor,
} from "@/constants/colors";
import { useCategory } from "@/hooks/use-category";
import { TransactionModel } from "@/models/transaction.model";
import { useState } from "react";
import { Pressable, View } from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { ConditionalRender } from "../conditional-render";
import { TransactionDetailsModal } from "../transaction-details-modal/transaction-details-modal.component";
import { Typography } from "../ui/typography/typography.component";
import { styles } from "./transaction-card.styles";

interface TransactionCardProps {
  transaction: TransactionModel;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [isOpenOpenDetails, setIsOpenDetails] = useState(false);
  const { getCategory } = useCategory();

  const openDetails = () => setIsOpenDetails(true);

  const closeDetails = () => setIsOpenDetails(false);

  const category = getCategory(transaction.category, transaction.type);

  return (
    <Pressable style={styles.container} onPress={openDetails}>
      <TransactionDetailsModal isOpen={isOpenOpenDetails} closeModal={closeDetails} transaction={transaction} category={category}/>
      <MaterialIcon
        name={category.icon}
        size={36}
        color={textPrimaryColor}
      />
      <View style={styles.textArea}>
        <Typography size={12} weight="500" color={textSecondaryColor}>
          {transaction.description}
        </Typography>
        <Typography size={16} weight="400" color={textPrimaryColor}>
          {Math.abs(transaction.value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </Typography>
      </View>
      <ConditionalRender condition={transaction.type === "expense"}>
        <MaterialIcon name="arrow-downward" size={24} color={negativeColor} />
      </ConditionalRender>
      <ConditionalRender condition={transaction.type === "income"}>
        <MaterialIcon name="arrow-upward" size={24} color={positiveColor} />
      </ConditionalRender>
    </Pressable>
  );
}
