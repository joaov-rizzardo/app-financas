import {
  brandColor,
  textPrimaryColor,
  textSecondaryColor,
} from "@/constants/colors";
import { formatDateToLongText } from "@/helpers/format-date-to-long-text";
import { View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Button } from "../ui/button/button.component";
import { Modal } from "../ui/modal/modal.component";
import { Typography } from "../ui/typography/typography.component";
import { styles } from "./transaction-details-modal.styles";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  icon: string;
  description: string;
  value: number;
  category: string;
  transactionType: "expense" | "income";
  date: Date;
}

export function TransactionDetailsModal(props: TransactionDetailsModalProps) {
  return (
    <Modal open={props.isOpen} closeModal={props.closeModal}>
      <View style={styles.iconContainer}>
        <View style={styles.icon}>
          <MaterialIcons name={props.icon} size={64} color={brandColor} />
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <Typography size={20} weight="500" color={textPrimaryColor}>
          {props.description}
        </Typography>
        <Typography size={12} weight="400" color={textSecondaryColor}>
          {props.category}
        </Typography>
      </View>
      <View style={styles.valueContainer}>
        <Typography size={24} weight="600" color={textPrimaryColor}>
          {props.value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </Typography>
        <Typography size={12} weight="400" color={textSecondaryColor}>
          {props.transactionType === "expense" ? "Despesa" : "Receita"}
        </Typography>
      </View>
      <View style={styles.dateContainer}>
        <Typography size={12} weight="400" color={textPrimaryColor}>
          {formatDateToLongText(props.date)}
        </Typography>
      </View>
      <View style={styles.actionsContainer}>
        <Button variant="danger-outline" style={{ width: "100%" }}>
          <Typography>Cancelar</Typography>
        </Button>
        <Button variant="secondary" onPress={props.closeModal}>
          <Typography>Fechar</Typography>
        </Button>
      </View>
    </Modal>
  );
}
