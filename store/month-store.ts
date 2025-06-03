import { create } from "zustand";

type MonthStoreState = {
  month: number;
  year: number;
  increment: () => void;
  decrement: () => void;
};

function incrementMonth(month: number, year: number) {
  if (month >= 11) {
    return { month: 0, year: year + 1 };
  }
  return { month: month + 1, year };
}

function decrementMonth(month: number, year: number) {
  if (month <= 0) {
    return { month: 11, year: year - 1 };
  }
  return { month: month - 1, year };
}

export const useMonthStore = create<MonthStoreState>((set) => ({
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  increment: () =>
    set((state) => {
      return {
        ...state,
        ...incrementMonth(state.month, state.year),
      };
    }),
  decrement: () =>
    set((state) => {
      return {
        ...state,
        ...decrementMonth(state.month, state.year),
      };
    }),
}));
