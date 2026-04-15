# Task 1 — Data Layer: Store, Entities, Seed Data, Workflow, Permissions

> **Layer**: 1 (Foundation) · **Depends on**: Architecture doc only · **Blocking**: All other tasks

## Objective

Build the entire data layer that every other module depends on. This includes the generic localStorage CRUD store, entity constant definitions, the defect workflow state machine, the role-based permission system, the `useForm` hook, and the initial seed data.

## Constraints

- Follow `.github/instructions/architecture.instructions.md` strictly — all entity schemas, store API, workflow transitions, and permission definitions are specified there.
- **No React components** in this task. Only plain TypeScript modules and one hook (`useForm`).
- **No runtime dependencies.** Only `typescript` and `vitest` as devDependencies.
- All files `.ts` (not `.tsx`) except... none — this task has zero JSX. All `.ts`.
- Entity types defined in `entities.ts` are the **single source of truth** — every other task imports from here, never redefines.
- All localStorage keys prefixed with `tqh_` (e.g., `tqh_defects`, `tqh_projects`).
- Plaintext passwords — this is a training app, not production.

## Prerequisites

### Install dev dependencies

```bash
npm install --save-dev typescript vitest
```

### Create `tsconfig.json` (project root)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict — per architecture §16b */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src"]
}
```

### Create `tsconfig.node.json` (project root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    "strict": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["vite.config.ts"]
}
```

### Rename `vite.config.js` → `vite.config.ts`

Content stays the same — Vite supports `.ts` config natively.

### Update `index.html`

Change the entry point from `.jsx` to `.tsx`:

```html
<script type="module" src="/src/main.tsx"></script>
```

### Add scripts to `package.json`

Add to `"scripts"`:

```json
"typecheck": "tsc --noEmit",
"test": "vitest run",
"test:watch": "vitest"
```

## Files to Create

### 1. `src/data/entities.ts`

Single source of truth for all entity types, enums, and constant arrays. Every other file in the project imports types from here. Follow architecture §7 (schemas) and §16b (TypeScript strategy).

```ts
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
// Use `as const` so the array type is the literal union, not string[].

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
  password: string; // plaintext — training app
  role: Role;
  fullName: string;
  email: string;
  avatarColor: string;
  projectIds: number[];
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
```

### 2. `src/data/store.ts`

Generic localStorage CRUD, typed with TS generics. API per architecture §7:

```ts
import type { EntityKey } from "./entities";

interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt?: string;
}

export function getAll<T extends BaseEntity>(key: EntityKey): T[];
export function getById<T extends BaseEntity>(
  key: EntityKey,
  id: number,
): T | null;
export function create<T extends BaseEntity>(
  key: EntityKey,
  data: Omit<T, "id" | "createdAt" | "updatedAt">,
): T;
export function update<T extends BaseEntity>(
  key: EntityKey,
  id: number,
  data: Partial<Omit<T, "id" | "createdAt">>,
): T;
export function remove(key: EntityKey, id: number): void;
export function reset<T extends BaseEntity>(key: EntityKey, seedData: T[]): T[];
export function resetAll(): void;
```

Entity keys to support: `tqh_users`, `tqh_projects`, `tqh_defects`, `tqh_test_plans`, `tqh_test_runs`.

Implementation notes:

- `getAll` returns `[]` if key doesn't exist.
- `create` auto-increments `id` based on `Math.max(...ids, 0) + 1`.
- `resetAll` must know all entity keys and their seed data — import from `seed.ts`.

### 3. `src/data/seed.ts`

Export seed data for all entities. Must be rich enough for demos:

- **3 users** — exactly as defined in architecture §6 (tester/test123, lead/lead123, admin/admin123). Add `avatarColor` and `projectIds`.
- **3 projects** — "Project Phoenix" (active), "Project Atlas" (active), "Project Nebula" (planning). Each with 2-3 environments, assigned members, a QA lead.
- **12-15 defects** — spread across projects. Must include defects in every lifecycle state (new, assigned, in_progress, resolved, verified, closed, rejected, reopened). Each with at least 1 comment and 2-3 history entries. Use humorous QA-themed titles/descriptions matching the existing app tone.
- **3 test plans** — one per project (except Nebula). Include 4-6 test cases each with multi-step procedures.
- **2 test runs** — one completed (mixed results), one in-progress.

Export as typed arrays (using interfaces from `entities.ts`):

```ts
import type { User, Project, Defect, TestPlan, TestRun } from "./entities";

export const SEED_USERS: User[] = [
  /* ... */
];
export const SEED_PROJECTS: Project[] = [
  /* ... */
];
export const SEED_DEFECTS: Defect[] = [
  /* ... */
];
export const SEED_TEST_PLANS: TestPlan[] = [
  /* ... */
];
export const SEED_TEST_RUNS: TestRun[] = [
  /* ... */
];

export function initializeSeedData(): void {
  // Only seeds if localStorage is empty (first visit).
  // For each entity key: if missing, write the seed array.
}
```

Type-checking on seed arrays is a major win — any entity shape drift against `entities.ts` fails at compile time.

### 4. `src/utils/workflow.ts`

Defect state machine per architecture §8.

```ts
// Single source of truth for defect transition permissions.
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
] as const;

export interface AvailableTransition {
  action: TransitionAction;
  targetStatus: DefectStatus;
  label: string;
}

export function getAvailableTransitions(
  currentStatus: DefectStatus,
  userRole: Role,
): AvailableTransition[];

export function executeTransition(
  defect: Defect,
  action: TransitionAction,
  userId: number,
): Defect;
// executeTransition must: validate the transition is allowed for the defect's
// current status, update status, append to defect.history[], update updatedAt.
// Throws if the transition is not allowed.
```

### 5. `src/utils/permissions.ts`

Role-based permissions per architecture §12. Must delegate defect transition checks to `workflow.ts`.

```ts
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

export function hasPermission(
  userRole: Role,
  action: PermissionKey,
  context?: DefectStatus,
): boolean;
// `context` is only read when action === "defect:transition"
// (it's the defect's current status — delegates to workflow.ts).
```

### 6. `src/hooks/useForm.ts`

Shared form hook per architecture §9 and §16b. Generic over the values shape. ~40 lines max.

```ts
import type { FormEvent } from "react";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  setField: <K extends keyof T>(name: K, value: T[K]) => void;
  setFieldTouched: (name: keyof T) => void;
  validate: () => boolean;
  reset: (newValues?: T) => void;
  handleSubmit: (onValid: (values: T) => void) => (e: FormEvent) => void;
}

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validateFn: (values: T) => FormErrors<T>,
): UseFormReturn<T>;
```

- `validateFn(values)` returns `{ fieldName: "Error message" }` — empty object means valid.
- `handleSubmit(onValid)` returns an event handler that calls `e.preventDefault()`, runs `validate()`, and calls `onValid(values)` if valid.
- `reset(newValues?)` resets to `initialValues` or provided values, clears errors and touched.

### 7. `src/shared/testIds.ts`

Create the initial test ID registry per architecture §9b. For this task, define test IDs for:

- `login` scope (page, inputUsername, inputPassword, btnSubmit, checkboxRemember)
- `sidebar` scope (nav, linkDashboard, linkProjects, linkDefects, linkTestPlans, linkTeam, linkReports, linkSettings, btnLogout, btnCollapse)
- `footer` scope (btnReset, version)
- `breadcrumbs` scope (nav, link)
- `toast` scope (success, error, warning, btnDismiss)
- `emptyState` scope (container)
- `protectedRoute` scope (denied)

Also export builder functions for dynamic IDs that will be needed (leave these as-is, page tasks will extend later):

```ts
export const buildTestId = (
  scope: string,
  element: string,
  qualifier: string,
): string => `${scope}-${element}-${qualifier}`;
```

## Verification Checklist

- [ ] `tsconfig.json` exists with `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`
- [ ] `typescript` and `vitest` are in `devDependencies`
- [ ] `vite.config.ts` exists (renamed from `.js`)
- [ ] `index.html` references `/src/main.tsx`
- [ ] `store.ts` — can `create`, `getAll`, `getById`, `update`, `remove` for any entity key
- [ ] `seed.ts` — `initializeSeedData()` populates all entity keys when localStorage is empty
- [ ] `seed.ts` — calling `initializeSeedData()` twice does NOT overwrite existing data
- [ ] `workflow.ts` — `getAvailableTransitions("new", "tester")` returns `[]` (testers can't assign)
- [ ] `workflow.ts` — `getAvailableTransitions("new", "qa_lead")` returns `[{ action: "assign", ... }]`
- [ ] `workflow.ts` — `executeTransition(defect, "assign", userId)` updates status and appends history
- [ ] `permissions.ts` — `hasPermission("tester", "defect:create")` returns `true`
- [ ] `permissions.ts` — `hasPermission("tester", "user:manage")` returns `false`
- [ ] `permissions.ts` — `hasPermission("qa_lead", "defect:transition", "new")` returns `true` (delegates to workflow.ts)
- [ ] `useForm` — `setField` updates values, `validate` populates errors, `handleSubmit` prevents default and validates
- [ ] `testIds.ts` — all scopes export correct string constants
- [ ] `entities.ts` — all constants match architecture §7 entity schemas
- [ ] No external dependencies added
- [ ] No React components created (only hooks + plain TS modules)
- [ ] `tsc --noEmit` passes with zero errors under strict mode
- [ ] Seed arrays type-check against entity interfaces (any shape drift fails compilation)
- [ ] No `any`, no `@ts-ignore`, no `@ts-expect-error`

## Do NOT

- Do not create any React components (those are separate tasks)
- Use TypeScript (strict) per architecture §16b — types on all exports. Do not add PropTypes, JSDoc, or runtime schema validators (Zod/Yup/etc). No `any`, no `@ts-ignore`.
- Do not add `console.log`
- Do not add try/catch around localStorage operations
- Do not add a `SEED_VERSION` or migration system
- Do not create barrel exports (`index.ts`)
