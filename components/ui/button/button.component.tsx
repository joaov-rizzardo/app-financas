import { ReactNode } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { styles } from "./button.styles";

interface ButtonProps extends TouchableOpacityProps {
  variant: "primary" | "secondary" | "tertiary";
  children: ReactNode;
}

export function Button({ variant, children, style, ...props }: ButtonProps) {
  const getStylesByVariant = () => {
    switch (variant) {
      case "primary":
        return styles.primary;
      case "tertiary":
        return styles.tertiary;
      default:
        return styles.primary;
    }
  };
  return (
    <TouchableOpacity
      style={[styles.base, getStylesByVariant(), style]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}
