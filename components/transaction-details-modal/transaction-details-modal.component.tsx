import {
  brandColor,
  textPrimaryColor,
  textSecondaryColor,
} from "@/constants/colors";
import { formatDateToLongText } from "@/helpers/format-date-to-long-text";
import { CategoryModel } from "@/models/category.model";
import { TransactionModel } from "@/models/transaction.model";
import { View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Button } from "../ui/button/button.component";
import { Modal } from "../ui/modal/modal.component";
import { Typography } from "../ui/typography/typography.component";
import { styles } from "./transaction-details-modal.styles";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  transaction: TransactionModel;
  category: CategoryModel;
}

export function TransactionDetailsModal(props: TransactionDetailsModalProps) {
  return (
    <Modal open={props.isOpen} closeModal={props.closeModal}>
      <View style={styles.iconContainer}>
        <View style={styles.icon}>
          <MaterialIcons name={props.category.icon} size={64} color={brandColor} />
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <Typography size={20} weight="500" color={textPrimaryColor}>
          {props.transaction.description}
        </Typography>
        <Typography size={12} weight="400" color={textSecondaryColor}>
          {props.category.name}
        </Typography>
      </View>
      <View style={styles.valueContainer}>
        <Typography size={24} weight="600" color={textPrimaryColor}>
          {props.transaction.value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </Typography>
        <Typography size={12} weight="400" color={textSecondaryColor}>
          {props.transaction.type === "expense" ? "Despesa" : "Receita"}
        </Typography>
      </View>
      <View style={styles.dateContainer}>
        <Typography size={12} weight="400" color={textPrimaryColor}>
          {formatDateToLongText(props.transaction.date.toDate())}
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
