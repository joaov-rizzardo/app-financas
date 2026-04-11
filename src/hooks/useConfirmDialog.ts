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

/**
 * Usage:
 *   const { confirm, dialogProps } = useConfirmDialog();
 *
 *   const deleted = await confirm({
 *     title: 'Excluir item?',
 *     message: 'Esta ação não pode ser desfeita.',
 *     confirmLabel: 'Excluir',
 *     variant: 'danger',
 *     icon: <Trash2 size={28} color={colors.danger} />,
 *   });
 *   if (deleted) { ... }
 *
 *   // In JSX:
 *   <ConfirmDialog {...dialogProps} />
 */
export function useConfirmDialog() {
  const [visible, setVisible]   = useState(false);
  const [options, setOptions]   = useState<ConfirmOptions>({ title: '' });
  // useRef avoids the React setState-as-updater trap with function values
  const resolveRef = useRef<((result: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setVisible(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setVisible(false);
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setVisible(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  const dialogProps: DialogProps = {
    visible,
    ...options,
    onConfirm: handleConfirm,
    onCancel:  handleCancel,
  };

  return { confirm, dialogProps };
}
