import { textPrimaryColor } from "@/constants/colors";
import { moneyMask } from "@/helpers/money-mask";
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
  description: z.string().min(1).max(20),
  value: z
    .string()
    .transform((value) => Number(value.replace(",", ".")))
    .refine((val) => val > 0),
  type: z.enum(["expense", "income"]),
  category: z.string().min(1),
  date: z.date(),
});

type FormTypeInput = z.input<typeof FormSchema>;

type FormTypeOutput = z.output<typeof FormSchema>;

const defaultValue: FormTypeInput = {
  category: "",
  date: new Date(),
  type: "expense",
  description: "",
  value: "",
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

  const onSubmit = (formData: FormTypeOutput) => {
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
                error={form.formState.errors.description !== undefined}
                maxLength={20}
              />
            </View>
            <View style={styles.inputBox}>
              <Typography color={textPrimaryColor} size={16} weight="400">
                Valor
              </Typography>
              <Controller
                control={form.control}
                name="value"
                render={({ field: { value, onBlur, onChange } }) => (
                  <Input
                    placeholder="Informe o valor"
                    value={value}
                    onChangeText={(text) => onChange(moneyMask(text))}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    error={form.formState.errors.value !== undefined}
                  />
                )}
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
                        if (checked) {
                          onChange("expense");
                          form.setValue("category", "");
                        }
                      }}
                      onBlur={onBlur}
                      checked={value === "expense"}
                      error={form.formState.errors.type !== undefined}
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
                        if (checked) {
                          onChange("income");
                          form.setValue("category", "");
                        }
                      }}
                      onBlur={onBlur}
                      checked={value === "income"}
                      error={form.formState.errors.type !== undefined}
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
                    error={form.formState.errors.category !== undefined}
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
                    error={form.formState.errors.date !== undefined}
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
