import type { DefectStatus, Role, Defect } from "../data/entities";

export type TransitionAction =
  | "assign"
  | "start"
  | "reject"
  | "resolve"
  | "verify"
  | "close"
  | "reopen";

interface TransitionRule {
  from: DefectStatus;
  action: TransitionAction;
  to: DefectStatus;
  roles: readonly Role[];
  label: string;
}

const TRANSITIONS: readonly TransitionRule[] = [
  {
    from: "new",
    action: "assign",
    to: "assigned",
    roles: ["qa_lead", "admin"],
    label: "Assign",
  },
  {
    from: "assigned",
    action: "start",
    to: "in_progress",
    roles: ["tester", "qa_lead", "admin"],
    label: "Start Work",
  },
  {
    from: "assigned",
    action: "reject",
    to: "rejected",
    roles: ["qa_lead", "admin"],
    label: "Reject",
  },
  {
    from: "in_progress",
    action: "resolve",
    to: "resolved",
    roles: ["tester", "qa_lead", "admin"],
    label: "Resolve",
  },
  {
    from: "resolved",
    action: "verify",
    to: "verified",
    roles: ["tester", "qa_lead"],
    label: "Verify",
  },
  {
    from: "verified",
    action: "close",
    to: "closed",
    roles: ["qa_lead", "admin"],
    label: "Close",
  },
  {
    from: "verified",
    action: "reopen",
    to: "in_progress",
    roles: ["tester", "qa_lead"],
    label: "Reopen",
  },
  {
    from: "rejected",
    action: "reopen",
    to: "new",
    roles: ["tester", "qa_lead", "admin"],
    label: "Reopen",
  },
];

export interface AvailableTransition {
  action: TransitionAction;
  targetStatus: DefectStatus;
  label: string;
}

export function getAvailableTransitions(
  currentStatus: DefectStatus,
  userRole: Role,
): AvailableTransition[] {
  return TRANSITIONS.filter(
    (t) => t.from === currentStatus && t.roles.includes(userRole),
  ).map((t) => ({ action: t.action, targetStatus: t.to, label: t.label }));
}

export function executeTransition(
  defect: Defect,
  action: TransitionAction,
  userId: number,
): Defect {
  const rule = TRANSITIONS.find(
    (t) => t.from === defect.status && t.action === action,
  );
  if (!rule) {
    throw new Error(
      `Invalid transition: cannot "${action}" from "${defect.status}"`,
    );
  }

  const now = new Date().toISOString();
  const historyMaxId = defect.history.reduce(
    (max, entry) => Math.max(max, entry.id),
    0,
  );

  return {
    ...defect,
    status: rule.to,
    updatedAt: now,
    history: [
      ...defect.history,
      {
        id: historyMaxId + 1,
        userId,
        action: rule.label,
        fromStatus: defect.status,
        toStatus: rule.to,
        details: `Status changed from ${defect.status} to ${rule.to}`,
        timestamp: now,
      },
    ],
  };
}
