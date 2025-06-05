import { borderColor, inputBackgroundColor } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: borderColor,
    backgroundColor: inputBackgroundColor,
  },
});
