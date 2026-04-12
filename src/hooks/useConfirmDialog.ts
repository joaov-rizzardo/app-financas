import { useState, useCallback, useRef } from 'react';
import type { ConfirmDialogProps, ConfirmDialogVariant } from '@/components/ui/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  icon?: React.ReactNode;
}

type DialogProps = Omit<ConfirmDialogProps, 'onConfirm' | 'onCancel'> & {
  onConfirm: () => void;
  onCancel: () => void;
};

export function useConfirmDialog() {
  const [visible, setVisible]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions]     = useState<ConfirmOptions>({ title: '' });
  const resolveRef = useRef<((result: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsLoading(false);
    setVisible(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  // Resolves the promise but keeps the dialog open so the caller can show
  // a loading indicator while the async action runs, then call close().
  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    if (isLoading) return;
    setVisible(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, [isLoading]);

  const close = useCallback(() => {
    setVisible(false);
    setIsLoading(false);
  }, []);

  const dialogProps: DialogProps = {
    visible,
    isLoading,
    ...options,
    onConfirm: handleConfirm,
    onCancel:  handleCancel,
  };

  return { confirm, dialogProps, setLoading: setIsLoading, close };
}
