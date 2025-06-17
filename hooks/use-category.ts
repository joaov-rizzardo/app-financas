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

  const getCategories = (type: "income" | "expense") => {
    if(!data) return [];
        if (type === "expense") {
      return Array.from(data.expenseCategories.values());
    }
    return Array.from(data.incomeCategories.values());

  }

  return { getCategory, getCategories }
}
