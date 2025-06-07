import { borderColor, cardColor } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
    color: cardColor,
    borderWidth: 1,
    borderColor: borderColor,
    borderRadius: 6,
  },
  detailsContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  valueContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  dateContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  actionsContainer: {
    marginTop: 28,
    gap: 12,
  },
});
