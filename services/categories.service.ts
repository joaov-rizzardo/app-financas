import { db } from "@/config/firebase";
import { CategoryModel } from "@/models/category.model";
import { collection, getDocs } from "firebase/firestore";

export class CategoryService {
  static async getCategories() {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
      } as CategoryModel;
      return data;
    });
  }
}
