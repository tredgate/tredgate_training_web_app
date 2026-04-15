# Task 15 — Fix Cross-Task Consistency Issues in T1, T2, T7, T11, T12, T13, T14

> **Layer**: Cleanup · **Depends on**: T1–T14 prompts already authored · **Blocking**: Implementation of T1, T2, T7, T11, T12, T13, T14

## Objective

Patch all inconsistencies found during review of prompts T1–T14. These edits are to the prompt `.md` files themselves, not to source code. After this task, the whole T1–T14 prompt set is internally coherent and safe to implement.

## Files to Edit

### 1. `.github/prompts/t7-shared-components.prompt.md` — Extend StatusBadge union

T12 uses `type="testplan_status"` and T13 uses `type="role"`. Extend the `StatusBadgeProps` discriminated union to include both variants.

Add these two members to the union:

```ts
| { "data-testid": string; type: "testplan_status"; value: TestPlanStatus; className?: string }
| { "data-testid": string; type: "role";            value: Role;           className?: string }
```

Import `TestPlanStatus` and `Role` from `../../data/entities` alongside the existing type imports.

Also update the **`BadgeType` union** (currently `"severity" | "status" | "priority" | "project_status"`) to include `"testplan_status" | "role"`.

Also add entries to the **`COLORS` record** for both new badge types:

```ts
testplan_status: {
  draft:     "bg-gray-500/20 text-gray-400 border-gray-500/30",
  active:    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  archived:  "bg-gray-500/20 text-gray-400 border-gray-500/30",
},
role: {
  tester:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  qa_lead: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  admin:   "bg-amber-500/20 text-amber-400 border-amber-500/30",
},
```

### 2. `.github/prompts/t14-reports-settings-profile.prompt.md` — Fix EmptyState variant

Section "Access guard" (Settings), currently:

```tsx
return <EmptyState variant="unauthorized" message="Admin access required" />;
```

Change `"unauthorized"` → `"permission-denied"` to match the variant union defined in T4 and the usage in T2.

### 3. `.github/prompts/t12-testplans-runs.prompt.md` + T2 + architecture — Align execution route

T2's router defines `/test-plans/:planId/execute`, but T12 describes `/test-runs/:runId/execute`. Pick the run-scoped URL (semantically correct — a run has its own ID).

- Update the route in T12 section "4. `src/pages/testruns/TestRunExecution.tsx`" to `/test-runs/:runId/execute`.
- **Fix T12 section 4 header**: change `src/pages/testruns/TestRunExecution.tsx` → `src/pages/testplans/TestRunExecution.tsx` to match the file tree in architecture §3 and the placeholder T2 creates.
- Update `.github/prompts/t2-auth-router-layout.prompt.md` router table: change
  ```tsx
  { path: "test-plans/:planId/execute", element: <TestRunExecution /> },
  ```
  to
  ```tsx
  { path: "test-runs/:runId/execute", element: <TestRunExecution /> },
  ```
- Update **architecture doc §5** route table: change
  ```
  /test-plans/:planId/execute     → TestRunExecution
  ```
  to
  ```
  /test-runs/:runId/execute       → TestRunExecution
  ```
- In T12 "Start New Run" section, clarify: the "Execute Test Run" button on TestPlanDetail first creates a new `TestRun` via `useTestRuns().create(...)`, then navigates to `/test-runs/${run.id}/execute`.

### 4. `.github/prompts/t11-defects.prompt.md` — Correct permission key for Edit button

In the DefectDetail layout (PageHeader actions), replace:

```tsx
hasPermission("defect:create") && defect.status !== "closed" && (
  <Link to={`/defects/${id}/edit`}>Edit</Link>
);
```

with:

```tsx
hasPermission("defect:edit") && defect.status !== "closed" && (
  <Link to={`/defects/${id}/edit`}>Edit</Link>
);
```

If `defect:edit` is not yet listed as a `PermissionKey` in T1's `permissions.ts`, add it there as well (same task — T1 patch note below). Map it to `["tester", "qa_lead", "admin"]` (all roles can edit, same as `defect:create`; the status guard in the UI handles the rest).

### 5. `.github/prompts/t11-defects.prompt.md` — Declare missing `defectBadge` testId builder

The DefectList columns reference `defectBadge("severity", row.id)` etc., but the testIds extension only declares `defectDetailBtn` and `defectCommentEntry`. Add:

```ts
export const defectBadge = (
  kind: "severity" | "priority" | "status",
  defectId: number,
): string => `defect-badge-${kind}-${defectId}`;
```

Note: the prefix is `defect-badge-` (not `defect-list-badge-`) to match architecture §9b and §4 examples (`defect-badge-severity-{id}`).

### 6. `.github/prompts/t1-data-layer.prompt.md` — Confirm enum constants & permission keys

T1 already exports these constant arrays (verified present in the prompt):

- `ROLES` — ✅ present
- `PROJECT_STATUSES` — ✅ present
- `DEFECT_SEVERITIES` — ✅ present
- `DEFECT_STATUSES` — ✅ present
- `DEFECT_PRIORITIES` — ✅ present
- `TEST_PLAN_STATUSES` — ✅ present (note the underscored name, see fix 8 below)
- `TestRunStatus` — ⚠️ not a standalone exported type; it is inline in `TestRun.status` as `"in_progress" | "completed"`. No standalone constant array exists. This is acceptable — only two values, no dropdown needed.

Also add to T1's `permissions.ts` `PermissionKey` union:

- `"defect:edit"` → `["tester", "qa_lead", "admin"]` (used by T11)
- `"testplan:edit"` → `["qa_lead", "admin"]` (used by T12 — see fix 7 below)

### 7. `.github/prompts/t12-testplans-runs.prompt.md` — Add `testplan:edit` permission key to T1

T12's TestPlanDetail uses `hasPermission("testplan:edit")` for the Edit button, but T1's `PermissionKey` union only lists `"testplan:create"`. Add `"testplan:edit"` to the union in T1's `permissions.ts`, mapped to `["qa_lead", "admin"]` (same as `testplan:create`).

### 8. `.github/prompts/t12-testplans-runs.prompt.md` + T13 — Fix constant name references

T1 exports `TEST_PLAN_STATUSES` (underscored), but T12 references `TESTPLAN_STATUSES` (no underscore). T1 exports `ROLES`, but T13 references `USER_ROLES`.

Fix the downstream references to match T1's actual exports:

- T12: `TESTPLAN_STATUSES` → `TEST_PLAN_STATUSES`
- T13: `USER_ROLES` → `ROLES`

### 9. `.github/prompts/t14-reports-settings-profile.prompt.md` — Fix Reports access description

T14 says: _"Reports: all roles can view, but data scope varies by role."_ This contradicts both architecture §11 (sidebar shows Reports for `qa_lead` + `admin` only) and T2 (route wrapped with `<ProtectedRoute allowedRoles={["qa_lead", "admin"]}>`).

Change the T14 Reports constraint to: _"Reports: qa_lead and admin only (consistent with T2 route protection and architecture §11)."_

## Minor Clarifications (optional but recommended)

### T12 — Test run status "failed"

T12 references a `"failed"` run status in "Complete Run" behaviour. T8's `completeRun` only sets `"completed"`. Choose one:

- **(A)** Add `"failed"` to `TestRunStatus` in T1 entities and have `completeRun` accept a final status argument.
- **(B)** Keep a single `"completed"` status and derive pass/fail from `results[]` at render time.

Recommend **(B)** — simpler, no schema change. Update T12 "Complete Run" bullet to read: _"Sets `TestRun.status` to `completed` regardless of outcome. Pass/fail is derived from `results[]`."_

## Verification Checklist

- [ ] T7 `StatusBadgeProps` includes `testplan_status` and `role` variants with proper entity types
- [ ] T7 `BadgeType` union includes `"testplan_status" | "role"`
- [ ] T7 `COLORS` record includes entries for `testplan_status` and `role`
- [ ] T14 Settings access guard uses `variant="permission-denied"`
- [ ] T14 Reports constraint says `qa_lead` + `admin` only (matches T2 + architecture §11)
- [ ] T12 execution route is `/test-runs/:runId/execute` and T2 router matches
- [ ] T12 section 4 header references `src/pages/testplans/TestRunExecution.tsx` (not `testruns/`)
- [ ] Architecture doc §5 route table updated to `/test-runs/:runId/execute`
- [ ] T12 "Execute Test Run" button creates the run before navigating
- [ ] T11 Edit button uses `hasPermission("defect:edit")`
- [ ] T11 testIds `defectBadge` builder uses prefix `defect-badge-` (per architecture §9b)
- [ ] T1 permissions.ts `PermissionKey` includes `"defect:edit"` → all roles
- [ ] T1 permissions.ts `PermissionKey` includes `"testplan:edit"` → `qa_lead`, `admin`
- [ ] T12 references `TEST_PLAN_STATUSES` (not `TESTPLAN_STATUSES`)
- [ ] T13 references `ROLES` (not `USER_ROLES`)
- [ ] T12 test run status policy resolved (option B — derive pass/fail from results[])

## Do NOT

- Do not change any source code under `src/` — this task edits prompt files only (plus the architecture doc where noted).
- Do not rename existing testIds already declared in earlier tasks.
- Do not introduce new EmptyState variants; reuse those defined in T4.
- Do not add a `"failed"` run status unless explicitly opting for option (A).
- Do not add alias constants (`USER_ROLES`, `TESTPLAN_STATUSES`) — fix the downstream references instead.
