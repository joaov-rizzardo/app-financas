import { db } from "@/config/firebase";
import { TransactionModel } from "@/models/transaction.model";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

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
}
