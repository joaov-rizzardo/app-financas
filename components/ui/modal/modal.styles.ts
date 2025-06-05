import { backgroundColor, borderColor } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    padding: 12,
    backgroundColor: backgroundColor,
    borderWidth: 1,
    borderColor: borderColor,
    borderRadius: 8,
    width: "100%",
    maxHeight: "100%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
