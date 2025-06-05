import { textPrimaryColor } from "@/constants/colors";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Button } from "../ui/button/button.component";
import { DatePicker } from "../ui/datepicker/datepicker.component";
import { Input } from "../ui/input/input.component";
import { Modal } from "../ui/modal/modal.component";
import { Radio } from "../ui/radio/radio.component";
import { Select } from "../ui/select/select.component";
import { Typography } from "../ui/typography/typography.component";
import { styles } from "./create-movimentation-modal.styles";

export function CreateMovimentationModal() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date());

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button variant="primary" style={styles.addButton} onPress={openModal}>
        <MaterialIcons name="add" size={38} color={textPrimaryColor} />
      </Button>
      <Modal open={open} closeModal={closeModal}>
        <ScrollView>
          <View style={styles.inputList}>
            <View style={styles.inputBox}>
              <Typography color={textPrimaryColor} size={16} weight="400">
                Descrição
              </Typography>
              <Input placeholder="Informe a descrição" />
            </View>
            <View style={styles.inputBox}>
              <Typography color={textPrimaryColor} size={16} weight="400">
                Valor
              </Typography>
              <Input placeholder="Informe o valor" />
            </View>
            <View style={styles.inputBox}>
              <Typography color={textPrimaryColor} size={16} weight="400">
                Categoria
              </Typography>
              <Select
                title="Categorias"
                placeholder="Selecione a categoria..."
                value={value}
                onChange={(value) => setValue(value)}
                options={[
                  {
                    key: "a",
                    value: "Supermercado",
                  },
                  {
                    key: "b",
                    value: "Casa",
                  },
                  {
                    key: "c",
                    value: "Contas",
                  },
                  {
                    key: "d",
                    value: "Academia",
                  },
                ]}
              />
            </View>
            <View style={styles.inputBox}>
              <Typography color={textPrimaryColor} size={16} weight="400">
                Valor
              </Typography>
              <DatePicker
                value={date}
                onChangeValue={(value) => setDate(value)}
                maximumDate={new Date()}
              />
            </View>
            <View style={styles.radioContainer}>
              <View style={styles.radioItem}>
                <Typography size={16} weight="400" color={textPrimaryColor}>
                  Despesa
                </Typography>
                <Radio checked />
              </View>
              <View style={styles.radioItem}>
                <Typography size={16} weight="400" color={textPrimaryColor}>
                  Receita
                </Typography>
                <Radio />
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.actionsContainer}>
          <Button variant="secondary" onPress={closeModal}>
            <Typography size={16} weight="400">
              Fechar
            </Typography>
          </Button>
          <Button variant="primary">
            <Typography size={16} weight="400">
              Salvar
            </Typography>
          </Button>
        </View>
      </Modal>
    </>
  );
}
