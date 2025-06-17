import { ConditionalRender } from "@/components/conditional-render";
import { textPrimaryColor, textSecondaryColor } from "@/constants/colors";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Radio } from "../radio/radio.component";
import { Typography } from "../typography/typography.component";
import { styles } from "./select.styles";

interface SelectProps {
  title?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  options: { key: string; value: string }[];
}

export function Select({
  title,
  value,
  placeholder,
  onChange,
  options,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const select = (key: string) => {
    onChange(key);
    close();
  };

  const getOptionValue = (key: string) =>
    options.find((o) => o.key === key)?.value || "";

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={open}>
        <ConditionalRender
          condition={value === ""}
        >
          <Typography size={16} weight="400" color={textSecondaryColor}>
            {placeholder}
          </Typography>
        </ConditionalRender>
        <ConditionalRender condition={value !== ""}>
          <Typography size={16} weight="400" color={textPrimaryColor}>
            {getOptionValue(value)}
          </Typography>
        </ConditionalRender>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={24}
          color={textSecondaryColor}
        />
      </TouchableOpacity>
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <Pressable style={styles.modalOverlay} onPress={close}>
          <Pressable style={styles.modalContainer}>
            <View style={styles.divisorContainer}>
              <View style={styles.divisor} />
            </View>
            <View style={styles.title}>
              <ConditionalRender condition={title !== undefined}>
                <Typography size={20} weight="500" color={textPrimaryColor}>
                  Categorias
                </Typography>
              </ConditionalRender>
            </View>
            <ScrollView
              contentContainerStyle={styles.optionList}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => (
                <Pressable
                  key={option.key}
                  style={styles.option}
                  onPress={() => select(option.key)}
                >
                  <Typography color={textSecondaryColor}>{option.value}</Typography>
                  <Radio checked={option.key === value} onChange={() => select(option.key)}/>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
