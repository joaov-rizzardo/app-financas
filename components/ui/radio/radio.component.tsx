import { ConditionalRender } from "@/components/conditional-render";
import { Pressable, View } from "react-native";
import { styles } from "./radio.styles";

interface RadioProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Radio({ checked, onChange }: RadioProps) {
  function toogleRadio() {
    if (onChange) onChange(!checked);
  }
  return (
    <Pressable
      style={[styles.container, checked ? styles.checked : {}]}
      onPress={toogleRadio}
    >
      <ConditionalRender condition={Boolean(checked)}>
        <View style={styles.circle} />
      </ConditionalRender>
    </Pressable>
  );
}
