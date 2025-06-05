import { brandColor, textPrimaryColor } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: brandColor,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    backgroundColor: brandColor,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: textPrimaryColor,
  },
});
