import { textPrimaryColor } from "@/constants/colors";
import { ReactNode } from "react";
import { Text } from "react-native";

export interface TypographyProps {
  children?: ReactNode;
  weight?: "300" | "400" | "500" | "600" | "700";
  size?: number;
  lineHeight?: number;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
}

export function Typography({
  size,
  align,
  weight = "400",
  color = textPrimaryColor,
  lineHeight,
  children,
}: TypographyProps) {
  const getFontFamily = () => {
    switch (weight) {
      case "300":
        return "Montserrat_300Light";
      case "400":
        return "Montserrat_400Regular";
      case "500":
        return "Montserrat_500Medium";
      case "600":
        return "Montserrat_600SemiBold";
      case "700":
        return "Montserrat_700Bold";
      default:
        return "Montserrat_400Regular";
    }
  };

  return (
    <Text
      style={{
        fontSize: size,
        color,
        fontFamily: getFontFamily(),
        lineHeight: lineHeight,
        textAlign: align ?? "auto",
      }}
    >
      {children}
    </Text>
  );
}
