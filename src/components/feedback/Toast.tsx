import { X } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { TEST_IDS } from "../../shared/testIds";
import type { ToastType } from "../../contexts/ToastContext";

const BORDER_COLORS: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  warning: "border-l-amber-500",
};

const TEST_ID_MAP: Record<ToastType, string> = {
  success: TEST_IDS.toast.success,
  error: TEST_IDS.toast.error,
  warning: TEST_IDS.toast.warning,
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-testid={TEST_ID_MAP[toast.type]}
          className={`glass border-l-4 ${BORDER_COLORS[toast.type]} px-4 py-3 min-w-[300px] max-w-[420px] flex items-start gap-3 transition-opacity duration-300`}
        >
          <span className="flex-1 text-sm text-gray-100">{toast.message}</span>
          <button
            data-testid={TEST_IDS.toast.btnDismiss}
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
