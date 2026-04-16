import { useEffect } from "react";
import type { JSX } from "react";
import { X } from "lucide-react";

export type ModalSize = "sm" | "md" | "lg" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  "data-testid": string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  children,
  footer,
  "data-testid": testId,
}: ModalProps): JSX.Element | null {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-3xl",
    full: "max-w-full mx-4",
  };

  return (
    <div
      data-testid={testId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all"
      onClick={() => closeOnBackdrop && onClose()}
    >
      <div
        className={`glass p-0 w-full ${sizeClasses[size]} rounded-xl transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2
            data-testid={`${testId}-title`}
            className="text-lg font-semibold text-white"
          >
            {title}
          </h2>
          <button
            data-testid={`${testId}-btn-close`}
            onClick={onClose}
            className="btn-ghost p-1 text-lg leading-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
