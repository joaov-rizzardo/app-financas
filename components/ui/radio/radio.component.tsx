import { ConditionalRender } from "@/components/conditional-render";
import { Pressable, PressableProps, View } from "react-native";
import { styles } from "./radio.styles";

interface RadioProps extends PressableProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Radio({ checked, onChange, ...props}: RadioProps) {
  function toogleRadio() {
    if (onChange) onChange(true);
  }
  return (
    <Pressable
      style={[styles.container, checked ? styles.checked : {}]}
      onPress={toogleRadio}
      {...props}
    >
      <ConditionalRender condition={Boolean(checked)}>
        <View style={styles.circle} />
      </ConditionalRender>
    </Pressable>
  );
}
