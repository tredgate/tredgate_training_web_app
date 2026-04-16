import type { JSX } from 'react';import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  "data-testid": string;
  variant?: "no-data" | "not-found" | "permission-denied";
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  "data-testid": testId,
  variant = "no-data",
  icon: Icon,
  title,
  message,
  action,
  className = "",
}: EmptyStateProps): JSX.Element {
  return (
    <div
      data-testid={testId}
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <div className="rounded-full bg-white/5 p-4 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 text-center max-w-sm mb-6">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
