import { textPrimaryColor } from "@/constants/colors";
import { useCategory } from "@/hooks/use-category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { z } from "zod";
import { Button } from "../ui/button/button.component";
import { DatePicker } from "../ui/datepicker/datepicker.component";
import { Input } from "../ui/input/input.component";
import { Modal } from "../ui/modal/modal.component";
import { Radio } from "../ui/radio/radio.component";
import { Select } from "../ui/select/select.component";
import { Typography } from "../ui/typography/typography.component";
import { styles } from "./create-transaction-modal.styles";

const FormSchema = z.object({
  description: z.string(),
  value: z.number(),
  type: z.enum(["expense", "income"]),
  category: z.string(),
  date: z.date(),
});

type FormType = z.infer<typeof FormSchema>;

const defaultValue: FormType = {
  category: "",
  date: new Date(),
  type: "expense",
  description: "",
  value: 0,
};

export function CreateTransactionModal() {
  const [open, setOpen] = useState(false);
  const { getCategories } = useCategory();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: defaultValue,
  });

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  const onSubmit = (formData: FormType) => {
    console.log(formData);
  };

  return (
    <>
      <Button
        variant="primary"
        style={styles.addButton}
        onPress={openModal}
        mode="icon"
      >
        <MaterialIcons name="add" size={38} />
      </Button>
      <Modal open={open} closeModal={closeModal}>
        <ScrollView>
          <View style={styles.inputList}>
            <View style={styles.inputBox}>
              <Typography color={textPrimaryColor} size={16} weight="400">
                Descrição
              </Typography>
              <Input
                placeholder="Informe a descrição"
                {...form.register("description")}
                onChangeText={(text) => form.setValue("description", text)}
              />
            </View>
            <View style={styles.inputBox}>
              <Typography color={textPrimaryColor} size={16} weight="400">
                Valor
              </Typography>
              <Input
                placeholder="Informe o valor"
                {...form.register("value")}
                onChangeText={(text) => form.setValue("value", Number(text))}
              />
            </View>
            <View style={styles.radioContainer}>
              <View style={styles.radioItem}>
                <Typography size={16} weight="400" color={textPrimaryColor}>
                  Despesa
                </Typography>
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field: { value, onBlur, onChange } }) => (
                    <Radio
                      onChange={(checked) => {
                        if (checked) onChange("expense");
                      }}
                      onBlur={onBlur}
                      checked={value === "expense"}
                    />
                  )}
                />
              </View>
              <View style={styles.radioItem}>
                <Typography size={16} weight="400" color={textPrimaryColor}>
                  Receita
                </Typography>
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field: { value, onBlur, onChange } }) => (
                    <Radio
                      onChange={(checked) => {
                        if (checked) onChange("income");
                      }}
                      onBlur={onBlur}
                      checked={value === "income"}
                    />
                  )}
                />
              </View>
            </View>
            <View style={styles.inputBox}>
              <Typography color={textPrimaryColor} size={16} weight="400">
                Categoria
              </Typography>
              <Controller
                control={form.control}
                name="category"
                render={({ field: { value, onChange } }) => (
                  <Select
                    title="Categorias"
                    placeholder="Selecione a categoria..."
                    value={value}
                    onChange={onChange}
                    options={getCategories(form.watch("type")).map(
                      (category) => ({ key: category.id, value: category.name })
                    )}
                  />
                )}
              />
            </View>
            <View style={styles.inputBox}>
              <Typography color={textPrimaryColor} size={16} weight="400">
                Data
              </Typography>
              <Controller
                control={form.control}
                name="date"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    value={value}
                    onChangeValue={onChange}
                    maximumDate={new Date()}
                  />
                )}
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.actionsContainer}>
          <Button variant="secondary" onPress={closeModal}>
            <Typography>Fechar</Typography>
          </Button>
          <Button variant="primary" onPress={form.handleSubmit(onSubmit)}>
            <Typography>Salvar</Typography>
          </Button>
        </View>
      </Modal>
    </>
  );
}
