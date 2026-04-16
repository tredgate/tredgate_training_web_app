import type { JSX } from "react";
import type { LucideIcon } from "lucide-react";

export type EmptyStateVariant =
  | "no-results"
  | "not-found"
  | "permission-denied"
  | "no-defects"
  | "no-projects"
  | "no-test-plans"
  | "no-users"
  | (string & {});

export interface EmptyStateProps {
  variant: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  variant,
  icon: Icon,
  title,
  message,
  action,
  className = "",
}: EmptyStateProps): JSX.Element {
  return (
    <div
      data-testid={`empty-state-${variant}`}
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      {Icon && (
        <div className="rounded-full bg-white/5 p-4 mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-gray-400 text-center max-w-sm mb-6">
          {message}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
