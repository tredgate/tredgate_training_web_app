import type { Role, DefectStatus } from "../data/entities";
import { getAvailableTransitions } from "./workflow";

export type PermissionKey =
  | "defect:create"
  | "defect:assign"
  | "defect:transition"
  | "project:create"
  | "project:edit"
  | "project:delete"
  | "testplan:create"
  | "testplan:execute"
  | "user:manage"
  | "settings:manage"
  | "reports:view";

type PermissionDef =
  | readonly Role[]
  | ((role: Role, context?: DefectStatus) => boolean);

const PERMISSIONS: Record<PermissionKey, PermissionDef> = {
  "defect:create": ["tester", "qa_lead", "admin"],
  "defect:assign": (role) =>
    getAvailableTransitions("new", role).some((t) => t.action === "assign"),
  "defect:transition": (role, status) =>
    status !== undefined
      ? getAvailableTransitions(status, role).length > 0
      : false,
  "project:create": ["qa_lead", "admin"],
  "project:edit": ["qa_lead", "admin"],
  "project:delete": ["admin"],
  "testplan:create": ["qa_lead", "admin"],
  "testplan:execute": ["tester", "qa_lead", "admin"],
  "user:manage": ["admin"],
  "settings:manage": ["admin"],
  "reports:view": ["qa_lead", "admin"],
};

export function hasPermission(
  userRole: Role,
  action: PermissionKey,
  context?: DefectStatus,
): boolean {
  const def = PERMISSIONS[action];
  if (typeof def === "function") {
    return def(userRole, context);
  }
  return def.includes(userRole);
}
