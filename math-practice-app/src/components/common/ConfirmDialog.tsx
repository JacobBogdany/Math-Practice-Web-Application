import type { ReactNode } from 'react';
import { Button } from './Button';
import './ConfirmDialog.css';

export interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="confirm-dialog__backdrop" role="presentation">
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <h2 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h2>
        <div id="confirm-dialog-message" className="confirm-dialog__message">
          {message}
        </div>
        <div className="confirm-dialog__actions">
          <Button variant="coral" block onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="grape" block onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
