import { borderColor } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  cardsContainer: {
    gap: 24,
    paddingBottom: 32,
    paddingHorizontal: 12,
    paddingTop: 28,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },
  cardsLine: {
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
  },
  searchArea: {
    paddingHorizontal: 12,
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
  },
});
