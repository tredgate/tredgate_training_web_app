import type { JSX } from "react";
import type {
  Role,
  Severity,
  DefectStatus,
  Priority,
  ProjectStatus,
  TestPlanStatus,
  TestCasePriority,
  TestCaseResultStatus,
} from "../../data/entities";

export type BadgeType =
  | "severity"
  | "status"
  | "priority"
  | "project_status"
  | "role"
  | "testplan_status"
  | "testcase_priority"
  | "testrun_status"
  | "testcase_result";

export type StatusBadgeProps =
  | {
      "data-testid": string;
      type: "severity";
      value: Severity;
      className?: string;
    }
  | {
      "data-testid": string;
      type: "status";
      value: DefectStatus;
      className?: string;
    }
  | {
      "data-testid": string;
      type: "priority";
      value: Priority;
      className?: string;
    }
  | {
      "data-testid": string;
      type: "project_status";
      value: ProjectStatus;
      className?: string;
    }
  | {
      "data-testid": string;
      type: "role";
      value: Role;
      className?: string;
    }
  | {
      "data-testid": string;
      type: "testplan_status";
      value: TestPlanStatus;
      className?: string;
    }
  | {
      "data-testid": string;
      type: "testcase_priority";
      value: TestCasePriority;
      className?: string;
    }
  | {
      "data-testid": string;
      type: "testrun_status";
      value: "in_progress" | "completed";
      className?: string;
    }
  | {
      "data-testid": string;
      type: "testcase_result";
      value: TestCaseResultStatus;
      className?: string;
    };

const COLORS: Record<BadgeType, Record<string, string>> = {
  severity: {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    major: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    minor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    trivial: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  status: {
    new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    assigned: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    verified: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    reopened: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  priority: {
    P1: "bg-red-500/20 text-red-400 border-red-500/30",
    P2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    P3: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    P4: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  project_status: {
    planning: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    archived: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  role: {
    tester: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    qa_lead: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  testplan_status: {
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    completed: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    archived: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  testcase_priority: {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  testrun_status: {
    in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  testcase_result: {
    not_run: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    passed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    blocked: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    skipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
};

function formatLabel(value: string): string {
  if (value.startsWith("P")) return value;
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({
  "data-testid": testId,
  type,
  value,
  className = "",
}: StatusBadgeProps): JSX.Element {
  const colorClass =
    COLORS[type][value as string] ||
    "bg-gray-500/20 text-gray-400 border-gray-500/30";

  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {formatLabel(value)}
    </span>
  );
}
