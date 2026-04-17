// ─── Literal-union types (for TS checking) ──────────────────────────────
export type Role = "tester" | "qa_lead" | "admin";

export type DefectStatus =
  | "new"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "verified"
  | "closed"
  | "rejected"
  | "reopened";
export type Severity = "critical" | "major" | "minor" | "trivial";
export type Priority = "P1" | "P2" | "P3" | "P4";

export type ProjectStatus = "planning" | "active" | "archived";

export type TestPlanStatus = "draft" | "active" | "completed" | "archived";
export type TestCasePriority = "high" | "medium" | "low";
export type TestCaseResultStatus =
  | "not_run"
  | "passed"
  | "failed"
  | "blocked"
  | "skipped";

export type EnvironmentType = "dev" | "staging" | "production";

// ─── Runtime constant arrays (for dropdowns, iteration) ─────────────────

export const ROLES = [
  "tester",
  "qa_lead",
  "admin",
] as const satisfies readonly Role[];

export const DEFECT_STATUSES = [
  "new",
  "assigned",
  "in_progress",
  "resolved",
  "verified",
  "closed",
  "rejected",
  "reopened",
] as const satisfies readonly DefectStatus[];
export const DEFECT_SEVERITIES = [
  "critical",
  "major",
  "minor",
  "trivial",
] as const satisfies readonly Severity[];
export const DEFECT_PRIORITIES = [
  "P1",
  "P2",
  "P3",
  "P4",
] as const satisfies readonly Priority[];

export const PROJECT_STATUSES = [
  "planning",
  "active",
  "archived",
] as const satisfies readonly ProjectStatus[];

export const TEST_PLAN_STATUSES = [
  "draft",
  "active",
  "completed",
  "archived",
] as const satisfies readonly TestPlanStatus[];
export const TEST_CASE_PRIORITIES = [
  "high",
  "medium",
  "low",
] as const satisfies readonly TestCasePriority[];
export const TEST_CASE_RESULT_STATUSES = [
  "not_run",
  "passed",
  "failed",
  "blocked",
  "skipped",
] as const satisfies readonly TestCaseResultStatus[];

export const ENVIRONMENT_TYPES = [
  "dev",
  "staging",
  "production",
] as const satisfies readonly EnvironmentType[];

// ─── Entity interfaces (per architecture §7) ────────────────────────────

export interface User {
  id: number;
  username: string;
  password: string;
  role: Role;
  fullName: string;
  email: string;
  avatarColor: string;
  projectIds: number[];
  isActive: boolean;
  createdAt: string;
}

export interface Environment {
  id: number;
  name: string;
  type: EnvironmentType;
  url: string;
}

export interface Project {
  id: number;
  name: string;
  code: string;
  description: string;
  status: ProjectStatus;
  leadId: number;
  memberIds: number[];
  environments: Environment[];
  createdAt: string;
  updatedAt: string;
}

export interface DefectComment {
  id: number;
  userId: number;
  text: string;
  createdAt: string;
}

export interface DefectHistoryEntry {
  id: number;
  userId: number;
  action: string;
  fromStatus: DefectStatus | null;
  toStatus: DefectStatus | null;
  details: string;
  timestamp: string;
}

export interface Defect {
  id: number;
  projectId: number;
  title: string;
  description: string;
  stepsToReproduce: string;
  severity: Severity;
  priority: Priority;
  status: DefectStatus;
  reporterId: number;
  assigneeId: number | null;
  environmentId: number | null;
  relatedTestCaseIds: number[];
  comments: DefectComment[];
  history: DefectHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: number;
  name: string;
  description: string;
  preconditions: string;
  steps: TestCaseStep[];
  priority: TestCasePriority;
}

export interface TestPlan {
  id: number;
  projectId: number;
  name: string;
  description: string;
  status: TestPlanStatus;
  createdById: number;
  assigneeId: number | null;
  testCases: TestCase[];
  createdAt: string;
  updatedAt: string;
}

export interface TestRunResult {
  testCaseId: number;
  status: TestCaseResultStatus;
  notes: string;
  duration: number | null;
}

export interface TestRun {
  id: number;
  testPlanId: number;
  executorId: number;
  status: "in_progress" | "completed";
  results: TestRunResult[];
  startedAt: string;
  completedAt: string | null;
}

// ─── Entity key union (used by store.ts) ────────────────────────────────
export type EntityKey =
  | "tqh_users"
  | "tqh_projects"
  | "tqh_defects"
  | "tqh_test_plans"
  | "tqh_test_runs";
