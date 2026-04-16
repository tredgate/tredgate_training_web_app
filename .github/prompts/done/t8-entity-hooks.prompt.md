# Task 8 — Entity Hooks (useStore + Domain Hooks)

> **Layer**: 2 (Shared Logic) · **Depends on**: T1 (store.ts, entities.ts, workflow.ts, permissions.ts) · **Blocking**: All Layer 3 page tasks (T9-T14)
> **Parallelizable** with T3-T7 (shared components)

## Objective

Build the generic `useStore` hook and all domain-specific entity hooks that pages will use for data access. Every page reads and writes data through these hooks — no page should call `store.ts` directly.

## Constraints

- Follow architecture §7 (entity schemas), §8 (workflow), §15 (import conventions).
- All files are `.ts` — no JSX in hooks (they return data/functions, not elements).
- Entity types imported from `src/data/entities.ts` — never redefine.
- Hooks are **named exports** (e.g., `export function useDefects()`), not default exports.
- All mutations should call `useToast` to show success/error notifications.
- Each hook reads from localStorage on mount and re-reads after mutations (no stale data).

## Files to Create

### 1. `src/hooks/useStore.ts`

Generic hook wrapping `store.ts` for any entity. Other hooks compose on top of this.

```ts
import type { EntityKey } from "../data/entities";

export interface UseStoreReturn<T extends { id: number }> {
  items: T[];
  getById: (id: number) => T | null;
  create: (data: Omit<T, "id" | "createdAt" | "updatedAt">) => T;
  update: (id: number, data: Partial<Omit<T, "id" | "createdAt">>) => T;
  remove: (id: number) => void;
  refresh: () => void; // force re-read from localStorage
}

export function useStore<T extends { id: number }>(
  entityKey: EntityKey,
): UseStoreReturn<T>;
```

Implementation:

- Use `useState` to hold the items array.
- `refresh()` re-reads from `store.getAll()` and sets state.
- `create`, `update`, `remove` call the corresponding `store.*` function, then call `refresh()`.
- Call `refresh()` on mount (single `useEffect` with empty deps).

### 2. `src/hooks/useDefects.ts`

Defect-specific hook. Wraps `useStore<Defect>` and adds workflow transitions, comments, and filtering.

```ts
import type {
  Defect,
  DefectStatus,
  Severity,
  Priority,
} from "../data/entities";
import type { AvailableTransition } from "../utils/workflow";

export interface UseDefectsReturn {
  defects: Defect[];
  getById: (id: number) => Defect | null;
  create: (
    data: Omit<
      Defect,
      "id" | "createdAt" | "updatedAt" | "comments" | "history"
    >,
  ) => Defect;
  update: (
    id: number,
    data: Partial<Omit<Defect, "id" | "createdAt">>,
  ) => Defect;
  remove: (id: number) => void;

  // Workflow
  getTransitions: (defect: Defect) => AvailableTransition[];
  transition: (defect: Defect, action: string, userId: number) => Defect;

  // Comments
  addComment: (defectId: number, userId: number, text: string) => Defect;

  // Filtering helpers (return filtered arrays — don't mutate state)
  getByProject: (projectId: number) => Defect[];
  getByStatus: (status: DefectStatus) => Defect[];
  getByAssignee: (userId: number) => Defect[];
  getByReporter: (userId: number) => Defect[];

  refresh: () => void;
}

export function useDefects(): UseDefectsReturn;
```

Implementation details:

- `getTransitions(defect)` calls `getAvailableTransitions(defect.status, currentUserRole)` from `workflow.ts`. Get role via `useAuth()`.
- `transition(defect, action, userId)` calls `executeTransition` from `workflow.ts`, then persists the updated defect via `store.update`, then refreshes.
- `addComment(defectId, userId, text)` reads the defect, appends to `comments[]` with auto-incremented ID and `new Date().toISOString()`, then persists.
- `create` should auto-populate: `comments: []`, `history: [{ action: "created", ... }]`, `status: "new"`, `createdAt`, `updatedAt`.
- Show toast on `create` ("Defect reported"), `transition` ("Status updated to {status}"), `addComment` ("Comment added").

### 3. `src/hooks/useProjects.ts`

```ts
import type { Project } from "../data/entities";

export interface UseProjectsReturn {
  projects: Project[];
  getById: (id: number) => Project | null;
  create: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => Project;
  update: (
    id: number,
    data: Partial<Omit<Project, "id" | "createdAt">>,
  ) => Project;
  remove: (id: number) => void;
  getByStatus: (status: string) => Project[];
  getMemberProjects: (userId: number) => Project[];
  refresh: () => void;
}

export function useProjects(): UseProjectsReturn;
```

Implementation:

- `getMemberProjects(userId)` returns projects where `memberIds.includes(userId)`.
- Show toast on `create` ("Project created"), `update` ("Project updated"), `remove` ("Project deleted").

### 4. `src/hooks/useTestPlans.ts`

```ts
import type { TestPlan, TestCase } from "../data/entities";

export interface UseTestPlansReturn {
  testPlans: TestPlan[];
  getById: (id: number) => TestPlan | null;
  create: (data: Omit<TestPlan, "id" | "createdAt" | "updatedAt">) => TestPlan;
  update: (
    id: number,
    data: Partial<Omit<TestPlan, "id" | "createdAt">>,
  ) => TestPlan;
  remove: (id: number) => void;

  // Test case management (embedded in test plan)
  addTestCase: (planId: number, testCase: Omit<TestCase, "id">) => TestPlan;
  updateTestCase: (
    planId: number,
    testCaseId: number,
    data: Partial<Omit<TestCase, "id">>,
  ) => TestPlan;
  removeTestCase: (planId: number, testCaseId: number) => TestPlan;

  getByProject: (projectId: number) => TestPlan[];
  refresh: () => void;
}

export function useTestPlans(): UseTestPlansReturn;
```

Implementation:

- Test cases are embedded in the `testCases[]` array on the TestPlan entity.
- `addTestCase` auto-increments the test case ID within the plan: `Math.max(...plan.testCases.map(tc => tc.id), 0) + 1`.
- Show toast on plan `create`/`update`/`remove` and test case `add`/`remove`.

### 5. `src/hooks/useTestRuns.ts`

```ts
import type { TestRun, TestRunResult } from "../data/entities";

export interface UseTestRunsReturn {
  testRuns: TestRun[];
  getById: (id: number) => TestRun | null;
  create: (data: Omit<TestRun, "id" | "startedAt" | "completedAt">) => TestRun;
  update: (id: number, data: Partial<Omit<TestRun, "id">>) => TestRun;

  // Execution helpers
  updateResult: (
    runId: number,
    testCaseId: number,
    result: Partial<TestRunResult>,
  ) => TestRun;
  completeRun: (runId: number) => TestRun;

  getByPlan: (testPlanId: number) => TestRun[];
  getByExecutor: (userId: number) => TestRun[];
  refresh: () => void;
}

export function useTestRuns(): UseTestRunsReturn;
```

Implementation:

- `create` auto-sets `startedAt: new Date().toISOString()`, `completedAt: null`, `status: "in_progress"`.
- `updateResult` finds the result for `testCaseId` in the run's `results[]` and merges the partial update.
- `completeRun` sets `status: "completed"` and `completedAt: new Date().toISOString()`.
- Show toast on `create` ("Test run started"), `completeRun` ("Test run completed").

### 6. `src/hooks/useUsers.ts`

```ts
import type { User, Role } from "../data/entities";

export interface UseUsersReturn {
  users: User[];
  getById: (id: number) => User | null;
  update: (id: number, data: Partial<Omit<User, "id" | "createdAt">>) => User;
  getByRole: (role: Role) => User[];
  getProjectMembers: (projectId: number) => User[];
  refresh: () => void;
}

export function useUsers(): UseUsersReturn;
```

Implementation:

- No `create` or `remove` — users are seeded only. Admin can edit role/projects but not create/delete users (this is a training app, not a user management system).
- `getProjectMembers(projectId)` returns users where `projectIds.includes(projectId)`.
- Show toast on `update` ("User updated").

### `src/shared/testIds.ts` — No extensions needed

Entity hooks don't render UI, so no new test IDs.

## Verification Checklist

- [ ] `useStore` — `items` returns all entities, `create`/`update`/`remove` persist to localStorage and refresh state
- [ ] `useDefects` — `create` auto-populates comments, history, status; `transition` calls `executeTransition` and persists
- [ ] `useDefects` — `addComment` appends to comments array with auto-ID
- [ ] `useDefects` — `getByProject`, `getByStatus`, `getByAssignee` return correct subsets
- [ ] `useProjects` — `getMemberProjects` returns projects for a given user
- [ ] `useTestPlans` — `addTestCase`/`removeTestCase` modify embedded array and persist
- [ ] `useTestRuns` — `updateResult` modifies the correct result entry; `completeRun` sets status + timestamp
- [ ] `useUsers` — no `create`/`remove` exposed; `update` works; `getByRole` filters correctly
- [ ] All hooks show toast notifications on mutations
- [ ] All hooks use types from `entities.ts` — no redefined interfaces
- [ ] `tsc --noEmit` passes with zero errors
- [ ] No `any`, no `@ts-ignore`

## Do NOT

- Do not add React components or JSX
- Do not call `store.ts` functions directly from pages — pages must go through hooks
- Do not add caching, memoization, or `useMemo` — data is synchronous and small
- Do not add pagination/sorting/filtering logic in hooks — that's handled by `DataTable`
- Do not add `console.log`
- Use TypeScript (strict) per architecture §16b. No PropTypes, no JSDoc, no `any`.
