import {
    textPrimaryColor,
    textSecondaryColor,
    warningColor,
} from "@/constants/colors";
import { useErrorModalStore } from "@/store/error-modal-store";
import { View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Button } from "../ui/button/button.component";
import { Modal } from "../ui/modal/modal.component";
import { Typography } from "../ui/typography/typography.component";
import { styles } from "./error-modal.styles";

export function ErrorModal() {
  const { isOpen, close } = useErrorModalStore();
  return (
    <Modal open={isOpen} closeModal={close}>
      <View style={styles.container}>
        <MaterialIcons name="warning" size={80} color={warningColor} />
        <View style={styles.messageContainer}>
          <Typography color={textPrimaryColor} weight="500" size={20}>
            Falha inesperada
          </Typography>
          <Typography
            color={textSecondaryColor}
            weight="400"
            size={12}
            align="center"
          >
            Não foi possível completar sua solicitação. Por favor tente
            novamente em alguns instantes.
          </Typography>
        </View>
        <View style={styles.actionsContainer}>
          <Button variant="secondary" onPress={close}>
            <Typography color={textSecondaryColor} size={16} weight="400">
              Fechar
            </Typography>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
