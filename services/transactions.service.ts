import { db } from "@/config/firebase";
import { TransactionModel } from "@/models/transaction.model";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

type AddTransactionArgs = {
  date: Date;
  description: string;
  value: number;
  type: "expense" | "income";
  category: string;
};

export class TransactionsService {
  static async getTransactionsByMonth(
    year: number,
    month: number,
    day?: number
  ) {
    const start = Timestamp.fromDate(new Date(year, month, 1));
    const end =
      day === undefined
        ? Timestamp.fromDate(new Date(year, month + 1, 1))
        : Timestamp.fromDate(new Date(year, month, day + 1));
    const q = await query(
      collection(db, "transactions"),
      where("date", ">=", start),
      where("date", "<", end),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
      } as TransactionModel;
      return data;
    });
  }

  static async addTransaction(args: AddTransactionArgs) {
    await addDoc(collection(db, "transactions"), {
      value: args.value,
      description: args.description,
      type: args.type,
      category: args.category,
      date: Timestamp.fromDate(args.date),
    });
  }
}
