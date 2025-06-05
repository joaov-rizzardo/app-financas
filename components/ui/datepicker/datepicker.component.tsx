import { ConditionalRender } from "@/components/conditional-render";
import { textPrimaryColor } from "@/constants/colors";
import { formatDateToDDMMYYYY } from "@/helpers/date-formats";
import RNDatePicker, {
    AndroidNativeProps,
    DateTimePickerEvent,
    IOSNativeProps,
    WindowsNativeProps,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Typography } from "../typography/typography.component";
import { styles } from "./datepicker.styles";

type RNDatePickerProps =
  | IOSNativeProps
  | AndroidNativeProps
  | WindowsNativeProps;

type DatePickerProps = {
  onChangeValue: (value: Date) => void;
} & RNDatePickerProps;

export function DatePicker({ onChangeValue, ...props }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const handlePickerEvent = (e: DateTimePickerEvent) => {
    if (e.type === "neutralButtonPressed") return;
    if (e.type === "set") {
      onChangeValue(new Date(e.nativeEvent.timestamp));
    }
    close();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={open}>
      <MaterialIcons name="calendar-month" size={24} color={textPrimaryColor} />
      <Typography size={16} weight="400" color={textPrimaryColor}>
        {formatDateToDDMMYYYY(props.value)}
      </Typography>
      <ConditionalRender condition={isOpen}>
        <RNDatePicker mode="date" {...props} onChange={handlePickerEvent} />
      </ConditionalRender>
    </TouchableOpacity>
  );
}
