import { CategoryModel } from "@/models/category.model";
import { CategoryService } from "@/services/categories.service";
import { useQuery } from "@tanstack/react-query";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const categories = await CategoryService.getCategories();
      const expenseCategories: Map<string, CategoryModel> = new Map<
        string,
        CategoryModel
      >();
      const incomeCategories: Map<string, CategoryModel> = new Map<
        string,
        CategoryModel
      >();
      categories.forEach((category) =>
        category.transactionType === "expense"
          ? expenseCategories.set(category.id, category)
          : incomeCategories.set(category.id, category)
      );
      return {
        expenseCategories,
        incomeCategories,
      };
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
