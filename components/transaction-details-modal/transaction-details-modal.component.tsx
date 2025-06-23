import {
  brandColor,
  textPrimaryColor,
  textSecondaryColor,
} from "@/constants/colors";
import { formatDateToLongText } from "@/helpers/format-date-to-long-text";
import { useTransactionsQuery } from "@/hooks/queries/use-transactions-query";
import { CategoryModel } from "@/models/category.model";
import { TransactionModel } from "@/models/transaction.model";
import { TransactionsService } from "@/services/transactions.service";
import { useConfirmModalStore } from "@/store/confirm-modal-store";
import { useErrorModalStore } from "@/store/error-modal-store";
import { useMutation } from "@tanstack/react-query";
import { View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ConditionalRender } from "../conditional-render";
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
  const { open: openConfirmationModal } = useConfirmModalStore();
  const { open: openErrorModal } = useErrorModalStore();
  const query = useTransactionsQuery();

  const mutation = useMutation({
    mutationFn: () =>
      TransactionsService.removeTransaction(props.transaction.id),
    onSuccess: () => {
      props.closeModal();
      query.refetch();
    },
    onError: () => openErrorModal(),
  });

  const onDelete = () => {
    openConfirmationModal({
      title: "Atenção",
      description: "Tem certeza que deseja cancelar essa transação?",
      primaryButtonAction: mutation.mutate,
      primaryButtonText: "Sim",
      primaryButtonVariant: "danger-outline",
      secondaryButtonText: "Não",
    });
  };

  const isCurrentMonth = () =>
    props.transaction.date.toDate().getMonth() === new Date().getMonth() &&
    props.transaction.date.toDate().getFullYear() === new Date().getFullYear();

  return (
    <Modal open={props.isOpen} closeModal={props.closeModal}>
      <View style={styles.iconContainer}>
        <View style={styles.icon}>
          <MaterialIcons
            name={props.category.icon}
            size={64}
            color={brandColor}
          />
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
        <ConditionalRender condition={isCurrentMonth()}>
          <Button
            variant="danger-outline"
            style={{ width: "100%" }}
            onPress={onDelete}
            disabled={mutation.isPending}
          >
            <Typography>
              {!mutation.isPending ? "Cancelar" : "Carregando..."}
            </Typography>
          </Button>
        </ConditionalRender>

        <Button variant="secondary" onPress={props.closeModal}>
          <Typography>Fechar</Typography>
        </Button>
      </View>
    </Modal>
  );
}
