import { ReactNode } from "react";
import { Text } from "react-native";

interface TypographyProps {
  children?: ReactNode;
  weight?: "400" | "600" | "700";
  size?: number;
  lineHeight?: number;
}

export function Typography({
  size,
  weight = "400",
  lineHeight,
  children,
}: TypographyProps) {
  const getFontFamily = () => {
    switch (weight) {
      case "400":
        return "Montserrat_400Regular";
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
        fontFamily: getFontFamily(),
        lineHeight: lineHeight,
      }}
    >
      {children}
    </Text>
  );
}
