'use client';

import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';

export interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const iconColors = {
    danger: 'text-accent-danger',
    warning: 'text-yellow-500',
    primary: 'text-accent-primary',
  };

  const buttonStyles = {
    danger: 'bg-accent-danger hover:bg-accent-danger/90 focus-visible:ring-accent-danger',
    warning: 'bg-yellow-500 hover:bg-yellow-600 focus-visible:ring-yellow-500',
    primary: '',
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalHeader>
        <div className="flex items-center gap-3">
          {variant === 'danger' && (
            <div className={`p-2 rounded-full bg-accent-danger/10 ${iconColors[variant]}`}>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          )}
          {variant === 'warning' && (
            <div className={`p-2 rounded-full bg-yellow-500/10 ${iconColors[variant]}`}>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          )}
          <span>{title}</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <p className="text-foreground/70">{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        {variant === 'primary' ? (
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        ) : (
          <button
            className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-all shadow-sm
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background
              disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${buttonStyles[variant]}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
}
