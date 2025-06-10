import { CategoryService } from "@/services/categories.service";
import { useQuery } from "@tanstack/react-query";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getCategories,
  });
}
