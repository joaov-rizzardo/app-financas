import { borderColor } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: borderColor,
  },
  addButton: {
    borderRadius: 54,
    padding: 8,
  },
  navigationButton: {
    padding: 0,
  },
});
