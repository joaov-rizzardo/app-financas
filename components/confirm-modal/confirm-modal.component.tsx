import { textPrimaryColor, textSecondaryColor } from "@/constants/colors";
import { useConfirmModalStore } from "@/store/confirm-modal-store";
import { Modal, Pressable, View } from "react-native";
import { Button } from "../ui/button/button.component";
import { Typography } from "../ui/typography/typography.component";
import { styles } from "./confirm-modal.styles";

export function ConfirmModal() {
  const props = useConfirmModalStore();

  const onPrimaryButtonClick = () => {
    props.close();
    props.primaryButtonAction();
  };

  const onSecondaryButtonClick = () => {
    props.close();
    if (props.secondaryButtonAction) {
      props.secondaryButtonAction();
    }
  };
  return (
    <Modal
      visible={props.isOpen}
      transparent
      animationType="slide"
      onRequestClose={props.close}
    >
      <Pressable style={styles.modalOverlay} onPress={props.close}>
        <Pressable style={styles.modalContainer}>
          <View style={styles.divisorContainer}>
            <View style={styles.divisor} />
          </View>
          <View style={styles.textContainer}>
            <Typography
              color={textPrimaryColor}
              size={24}
              weight="500"
              align="center"
            >
              {props.title || "Atenção"}
            </Typography>
            <Typography
              color={textSecondaryColor}
              size={16}
              weight="400"
              align="center"
            >
              {props.description}
            </Typography>
          </View>
          <View style={styles.actionsContainer}>
            <Button variant={props.primaryButtonVariant || "primary"} onPress={onPrimaryButtonClick}>
              <Typography>{props.primaryButtonText || "Confirmar"}</Typography>
            </Button>
            <Button variant="secondary" onPress={onSecondaryButtonClick}>
              <Typography>{props.secondaryButtonText || "Fechar"}</Typography>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
