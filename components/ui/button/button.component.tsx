import { ReactNode } from "react";
import {
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { styles } from "./button.styles";

interface ButtonProps extends TouchableOpacityProps {
  variant: "primary" | "secondary" | "tertiary";
  mode?: "icon" | "normal";
  children: ReactNode;
}

export function Button({
  variant,
  children,
  mode = "normal",
  style,
  ...props
}: ButtonProps) {
  const getStylesByVariant = () => {
    switch (variant) {
      case "primary":
        return styles.primary;
      case "secondary":
        return styles.secondary;
      case "tertiary":
        return styles.tertiary;
      default:
        return styles.primary;
    }
  };
  const buttonStyle: StyleProp<ViewStyle> = [
    styles.base,
    getStylesByVariant(),
    style,
  ];
  if (mode === "icon") {
    buttonStyle.push(styles.icon);
  }
  if (props.disabled) {
    buttonStyle.push(styles.disabled);
  }
  return (
    <TouchableOpacity style={buttonStyle} {...props}>
      {children}
    </TouchableOpacity>
  );
}
