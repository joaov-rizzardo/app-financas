import {
  borderColor,
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
  secondary: {
    backgroundColor: "transparent",
    color: textSecondaryColor,
    borderWidth: 1,
    borderColor: borderColor,
  },
  tertiary: {
    backgroundColor: "transparent",
    color: textSecondaryColor,
  },
  disabled: {
    opacity: 0.1,
  },
});
