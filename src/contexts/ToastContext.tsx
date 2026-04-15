import { createContext, useState, useCallback, useRef, type ReactNode } from "react";

export type ToastType = "success" | "error" | "warning";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: number) => void;
}

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 4000;

export const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      counterRef.current += 1;
      const id = counterRef.current;
      const toast: Toast = { id, type, message };

      setToasts((prev) => {
        const next = [...prev, toast];
        if (next.length > MAX_TOASTS) {
          return next.slice(next.length - MAX_TOASTS);
        }
        return next;
      });

      setTimeout(() => {
        removeToast(id);
      }, duration ?? DEFAULT_DURATION);
    },
    [removeToast],
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
