import {
  brandColor,
  textPrimaryColor,
  textSecondaryColor,
} from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  base: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    borderRadius: 4,
  },
  primary: {
    backgroundColor: brandColor,
    color: textPrimaryColor,
  },
  tertiary: {
    backgroundColor: "transparent",
    color: textSecondaryColor,
  },
  disabled: {
    opacity: 0.1,
  },
});
