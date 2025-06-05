import {
    backgroundColor,
    borderColor,
    inputBackgroundColor,
    textPrimaryColor,
} from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: inputBackgroundColor,
    borderWidth: 1,
    borderColor: borderColor,
    borderRadius: 4,
  },
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
    height: "50%",
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
  title: {
    marginTop: 24,
  },
  optionList: {
    marginTop: 28,
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
});
