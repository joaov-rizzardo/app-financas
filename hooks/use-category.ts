import { CategoryModel } from "@/models/category.model";
import { useCategoriesQuery } from "./queries/use-categories-query";

export function useCategory() {
  const { data } = useCategoriesQuery();

  const blankCategory: CategoryModel = {
    id: "",
    name: "",
    icon: "",
    transactionType: "expense",
  };

  const getCategory = (id: string, type: "income" | "expense") => {
    if (!data) return blankCategory;
    if (type === "expense") {
      return data.expenseCategories.get(id) || blankCategory;
    }
    return data.incomeCategories.get(id) || blankCategory;
  };

  return { getCategory }
}
