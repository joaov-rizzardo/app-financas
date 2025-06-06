import { ButtonVariants } from "@/components/ui/button/button.component";
import { create } from "zustand";

type ConfirmModalProps = {
  title?: string;
  description: string;
  primaryButtonText?: string;
  primaryButtonVariant?: ButtonVariants;
  primaryButtonAction: () => void;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
};

type ConfirmModalState = {
  isOpen: boolean;
  open: (props: ConfirmModalProps) => void;
  close: () => void;
} & ConfirmModalProps;

const initialState = {
  isOpen: false,
  title: undefined,
  description: "",
  primaryButtonText: undefined,
  primaryButtonAction: () => {},
  primaryButtonVariant: undefined,
  secondaryButtonAction: () => {},
};

export const useConfirmModalStore = create<ConfirmModalState>((set) => ({
  ...initialState,
  open: (props: ConfirmModalProps) =>
    set({
      isOpen: true,
      ...props,
    }),
  close: () =>
    set({
      ...initialState,
    }),
}));
