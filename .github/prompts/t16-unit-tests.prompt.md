# Task 16 — Unit Tests for Pure Logic Modules

> **Layer**: Cross-cutting · **Depends on**: T1 (data layer complete — store, entities, workflow, permissions, useForm, seed) · **Parallelizable** with T2-T14 (once T1 is done)

## Objective

Write Vitest unit tests for the five pure logic modules specified in architecture §17. These tests protect the load-bearing logic from regressions during ongoing development. They are NOT a substitute for Playwright UI tests — they exist so the training app doesn't ship with a broken defect workflow.

## Constraints

- Follow architecture §17 exactly — test only the listed modules.
- **No component tests.** No routing tests. No visual tests. Playwright owns the UI.
- Mock `localStorage` — never hit real browser storage. Use `vi.stubGlobal` or an in-memory mock.
- **No `@testing-library/react`** — avoid adding devDeps. Test `useForm` by extracting its pure logic or using a minimal `renderHook` wrapper with `vi.fn`.
- Keep tests terse: no shared fixtures, no test helpers, each test self-contained.
- All tests must pass in under 2 seconds total.
- Colocate test files next to source: `workflow.test.ts` next to `workflow.ts`.

## Files to Create

### 1. `src/utils/workflow.test.ts`

Test the defect state machine from `workflow.ts`.

#### Test structure

```ts
import { describe, it, expect } from "vitest";
import { getTransitions, canTransition } from "./workflow";

describe("workflow", () => {
  describe("getTransitions", () => {
    // For each (status, role) pair, verify the correct transition set
  });

  describe("canTransition", () => {
    // Valid transitions
    // Invalid transitions (wrong role, wrong status)
  });
});
```

#### Required coverage

Per the state machine table in architecture §8:

| Current Status | Role                | Expected Transitions |
| -------------- | ------------------- | -------------------- |
| `new`          | `qa_lead`           | `assign`             |
| `new`          | `admin`             | `assign`             |
| `new`          | `tester`            | (none)               |
| `assigned`     | `tester` (assignee) | `start`              |
| `assigned`     | `qa_lead`           | `reassign`           |
| `in_progress`  | `tester` (assignee) | `resolve`            |
| `resolved`     | `qa_lead`           | `verify`, `reject`   |
| `resolved`     | `admin`             | `verify`, `reject`   |
| `verified`     | `qa_lead`           | `close`              |
| `verified`     | `admin`             | `close`              |
| `rejected`     | `tester` (assignee) | `start`              |
| `closed`       | `qa_lead`           | `reopen`             |
| `closed`       | `admin`             | `reopen`             |

**Invalid transition tests:**

- Tester cannot assign
- Tester cannot verify
- `in_progress` defect cannot be directly closed
- `new` defect cannot be resolved
- Non-assignee cannot start work

### 2. `src/utils/permissions.test.ts`

Test the role-based permission system from `permissions.ts`.

#### Required coverage

| Permission        | tester   | qa_lead       | admin |
| ----------------- | -------- | ------------- | ----- |
| `defect:create`   | ✅       | ✅            | ✅    |
| `defect:edit`     | own only | project scope | ✅    |
| `project:create`  | ❌       | ✅            | ✅    |
| `project:edit`    | ❌       | ✅            | ✅    |
| `project:delete`  | ❌       | ❌            | ✅    |
| `testplan:create` | ❌       | ✅            | ✅    |
| `testplan:edit`   | ❌       | ✅            | ✅    |
| `user:edit_role`  | ❌       | ❌            | ✅    |

Test each permission key against each role. Verify `hasPermission` returns the correct boolean.

### 3. `src/hooks/useForm.test.ts`

Test the `useForm` hook's pure logic. **Do NOT use `@testing-library/react`.**

Strategy: if `useForm` contains pure helper functions (validate, setField logic), test those directly. If not, create a minimal test wrapper:

```ts
import { describe, it, expect } from "vitest";
// Test the validation logic, field update logic, etc.
```

#### Required coverage

- `setField` updates the correct field value
- `validate` populates `errors` for fields that fail validation rules
- `validate` clears errors for fields that pass
- `touched` tracking: fields are marked touched after `setField`
- `reset` restores initial values and clears errors/touched
- `handleSubmit` blocks submission when validation fails
- `handleSubmit` calls the callback when validation passes

### 4. `src/data/store.test.ts`

Test the generic localStorage CRUD operations from `store.ts`.

#### Setup

```ts
import { beforeEach, describe, it, expect, vi } from "vitest";

// Mock localStorage
const mockStorage = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
});

beforeEach(() => mockStorage.clear());
```

#### Required coverage

- `getAll` returns empty array when key doesn't exist
- `getAll` returns parsed items when key exists
- `create` adds an item and persists it
- `getById` returns the correct item
- `getById` returns `undefined` for non-existent ID
- `update` modifies the item and persists the change
- `remove` deletes the item and persists the change
- Round-trip: create → getById → update → getAll shows updated item
- ID auto-generation: created items get unique IDs

### 5. `src/data/seed.test.ts`

Test seed data shape and referential integrity from `seed.ts`.

#### Required coverage

**Shape validation:**

- All seed users have: id, username, fullName, email, role, isActive
- All seed projects have: id, name, code, status, leadId, memberIds
- All seed defects have: id, title, projectId, severity, priority, status, reporterId
- All seed test plans have: id, name, projectId, status, testCases (non-empty array)
- All seed test runs have: id, testPlanId, executedById, status

**Referential integrity:**

- Every `defect.projectId` references an existing project
- Every `defect.reporterId` references an existing user
- Every `defect.assigneeId` (if set) references an existing user
- Every `project.leadId` references an existing user with role `qa_lead` or `admin`
- Every `project.memberIds` entry references an existing user
- Every `testPlan.projectId` references an existing project
- Every `testRun.testPlanId` references an existing test plan
- Every `testRun.executedById` references an existing user

**Seed data sanity:**

- At least 3 users exist (one per role)
- At least 2 projects exist
- At least 5 defects exist (enough to demonstrate filtering)
- At least 2 test plans exist
- At least 1 test run exists
- Defects span multiple statuses (not all "new")
- Login credentials work: tester/test123, lead/lead123, admin/admin123

## Verification Checklist

- [ ] All 5 test files created and colocated with source
- [ ] `npm run test` runs all tests and passes
- [ ] All tests complete in under 2 seconds
- [ ] `localStorage` is mocked — no side effects on real storage
- [ ] Workflow test covers every transition in the §8 state machine
- [ ] Permissions test covers every permission key × role combination
- [ ] Store test verifies full CRUD round-trip
- [ ] Seed test validates shape and referential integrity
- [ ] No imports from React components or page files

## Do NOT

- Do not test React components (DataTable, Modal, forms, pages, etc.)
- Do not test routing, navigation, or URL matching
- Do not test Tailwind classes or visual styling
- Do not test toast behaviour or modal animations
- Do not install `@testing-library/react` or any other test dependency beyond `vitest`
- Do not create shared test utilities, fixtures, or helper files
- Use TypeScript (strict). No `any`, no `@ts-ignore`.
