import { ConditionalRender } from "@/components/conditional-render";
import { Pressable, PressableProps, View } from "react-native";
import { styles } from "./radio.styles";

interface RadioProps extends PressableProps {
  checked?: boolean;
  error?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Radio({ checked, onChange, error, ...props}: RadioProps) {
  
  function toogleRadio() {
    if (!checked && onChange) onChange(true);
  }
  return (
    <Pressable
      style={[styles.container, checked ? styles.checked : {}, error ? styles.error : {}]}
      onPress={toogleRadio}
      {...props}
    >
      <ConditionalRender condition={Boolean(checked)}>
        <View style={styles.circle} />
      </ConditionalRender>
    </Pressable>
  );
}
