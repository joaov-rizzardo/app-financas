import { textPrimaryColor } from "@/constants/colors";
import { ReactNode } from "react";
import { Modal as NativeModal, Pressable, View } from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { Button } from "../button/button.component";
import { styles } from "./modal.styles";

interface ModalProps {
  open: boolean;
  closeModal: () => void;
  children: ReactNode;
}

export function Modal({ open, closeModal, children }: ModalProps) {
  return (
    <NativeModal
      animationType="fade"
      transparent
      visible={open}
      onRequestClose={closeModal}
    >
      <Pressable style={styles.modalOverlay} onPress={closeModal}>
        <Pressable style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Button variant="tertiary" onPress={closeModal}>
              <MaterialIcon name="close" size={24} color={textPrimaryColor} />
            </Button>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </NativeModal>
  );
}
