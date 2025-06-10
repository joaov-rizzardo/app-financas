import { db } from "@/config/firebase";
import { TransactionModel } from "@/models/transaction.model";
import {
    collection,
    getDocs,
    query,
    Timestamp,
    where,
} from "firebase/firestore";

export class TransactionsService {
  static async getTransactionsByMonth(year: number, month: number) {
    const start = Timestamp.fromDate(new Date(year, month, 1));
    const end = Timestamp.fromDate(new Date(year, month + 1, 1));
    const q = await query(
      collection(db, "transactions"),
      where("date", ">=", start),
      where("date", "<", end)
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
}
