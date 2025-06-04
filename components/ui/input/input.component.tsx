import { ConditionalRender } from "@/components/conditional-render";
import { textSecondaryColor } from "@/constants/colors";
import {
    StyleProp,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./input.styles";

interface InputProps extends TextInputProps {
  icon?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({ icon, containerStyle, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <ConditionalRender condition={icon !== undefined}>
        <MaterialIcon name={icon!} size={24} color={textSecondaryColor} />
      </ConditionalRender>
      <TextInput
        style={styles.input}
        placeholderTextColor={textSecondaryColor}
        {...props}
      />
    </View>
  );
}
