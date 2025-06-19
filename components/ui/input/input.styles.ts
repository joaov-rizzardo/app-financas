import {
  borderColor,
  errorColor,
  inputBackgroundColor,
  textPrimaryColor
} from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: inputBackgroundColor,
    borderWidth: 1,
    borderColor: borderColor,
    borderStyle: "solid",
    borderRadius: 4,
  },
  input: {
    flex: 1,
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: textPrimaryColor,
  },
  error: {
    borderColor: errorColor
  }
});
