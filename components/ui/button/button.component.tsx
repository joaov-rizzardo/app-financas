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
  const buttonStyle: StyleProp<ViewStyle> = [
    styles.base,
    getStylesByVariant(),
    style,
  ];
  if (props.disabled) {
    buttonStyle.push(styles.disabled);
  }
  return (
    <TouchableOpacity style={buttonStyle} {...props}>
      {children}
    </TouchableOpacity>
  );
}
