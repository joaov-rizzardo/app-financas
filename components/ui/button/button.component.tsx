import { textPrimaryColor, textSecondaryColor } from "@/constants/colors";
import React, { ReactElement, ReactNode } from "react";
import {
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  Typography,
  TypographyProps,
} from "../typography/typography.component";
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
  const buttonStyle: StyleProp<ViewStyle> = [
    styles.base,
    getStylesByVariant(variant),
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
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }
        if (child.type === Typography) {
          return React.cloneElement(child as ReactElement<TypographyProps>, {
            size: 16,
            weight: "400",
            color: getTextColorByVariant(variant),
          });
        }
        if (child.type === MaterialIcons) {
          return React.cloneElement(child as ReactElement<IconProps>, {
            color: getTextColorByVariant(variant),
          });
        }
        return child;
      })}
    </TouchableOpacity>
  );
}

const getStylesByVariant = (variant: string) => {
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

const getTextColorByVariant = (variant: string) => {
  switch (variant) {
    case "primary":
      return textPrimaryColor;
    case "secondary":
      return textSecondaryColor;
    case "tertiary":
      return textSecondaryColor;
    default:
      return textPrimaryColor;
  }
};
