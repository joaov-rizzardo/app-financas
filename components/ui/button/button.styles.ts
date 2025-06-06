import {
  borderColor,
  brandColor
} from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    borderRadius: 4,
  },
  icon: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  primary: {
    backgroundColor: brandColor,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: borderColor,
  },
  tertiary: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.1,
  },
});
