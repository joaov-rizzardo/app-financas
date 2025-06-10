import { Timestamp } from "firebase/firestore";

export interface TransactionModel {
  id: string;
  description: string;
  value: number;
  category: string;
  type: "expense" | "income";
  date: Timestamp;
}
