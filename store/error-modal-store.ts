import { create } from "zustand";

type ErrorModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useErrorModalStore = create<ErrorModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
