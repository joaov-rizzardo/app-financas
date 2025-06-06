import {
    backgroundColor,
    borderColor,
    textPrimaryColor,
} from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    borderWidth: 1,
    borderColor: borderColor,
    backgroundColor: backgroundColor,
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    width: "100%",
    maxHeight: "50%",
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  divisorContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  divisor: {
    height: 4,
    width: 80,
    backgroundColor: textPrimaryColor,
    borderRadius: 20,
  },
  textContainer: {
    marginTop: 20,
    alignItems: "center",
    gap: 8,
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
});
