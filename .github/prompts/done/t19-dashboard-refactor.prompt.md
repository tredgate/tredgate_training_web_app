# T19 — Dashboard Refactor: Data Hook + Column Factories + Sub-components

**Agent:** `@pages`
**Depends on:** T9 ✅, T21 ✅ (i18n)

---

## Goal

`src/pages/dashboard/Dashboard.tsx` has grown to ~500 lines with three overlapping problems:

1. **Role branching is duplicated 4 times** — defects counts, test plans count, pass-rate runs, activity timeline each re-ask "is user tester / qa_lead / admin?" and reapply the same scope predicates.
2. **Column arrays are ~80% duplicated** — `defectColumns`, `unassignedColumns`, `verificationColumns` share title / project / severity rendering and differ only in the extra column and `data-testid`.
3. **The component does four jobs** — data filtering, column config, lookup helpers, and rendering, all inline.

We are refactoring this in **three ordered phases**, each ending in its own commit. Do NOT collapse them into a single commit — the phase boundaries are the review checkpoints.

The result must be behaviourally identical: same DOM, same `data-testid`s, same rendered data for every role. No new dependencies. No `any`, no `@ts-ignore`.

---

## Phase 1 — Extract `useDashboardData(user)` hook

**New file:** `src/hooks/useDashboardData.ts`

Move all role-based filtering and derived values out of `Dashboard.tsx` into this hook. The hook takes the authenticated user and returns a single object with clean, ready-to-render arrays and scalars.

**Suggested return shape** (adjust names if something reads better):

```ts
{
  totalDefectsCount: number;
  openDefectsCount: number;
  testPlansCount: number;
  passRate: number; // 0–100

  myDefectsForTable: Defect[];       // assigned to me, top 5
  myTestRuns: TestRun[];             // executed by me, top 5, newest first
  unassignedDefects: Defect[];       // qa_lead + admin only; [] for tester
  awaitingVerification: Defect[];    // qa_lead + admin only; [] for tester

  recentActivityEntries: ActivityEntry[]; // last 10, scoped by role

  // Admin-only counters are fine to compute here too, or leave inline —
  // your call. If they stay inline, they must not use any role branching.
}
```

Inside the hook, encapsulate role scoping via **one internal helper** — e.g. `getScope(user, projects)` returning predicates like `defectInScope(d)`, `planInScope(p)`, `runInScope(r)`. Every downstream `.filter()` uses those predicates. The `if (role === 'tester') ... else if ...` chain appears **once**, inside `getScope`, and nowhere else.

The hook may call `useAuth`, `useDefects`, `useProjects`, `useTestPlans`, `useTestRuns`, `useUsers` internally — or accept them as arguments. Either is fine; pick whichever keeps `Dashboard.tsx` cleaner.

**Unit tests (required):** `src/hooks/useDashboardData.test.ts` (or a pure-logic sibling file if the role-scope function is extracted). Cover:

- Tester scope: only sees own reported/assigned defects, own runs, no unassigned/verification rows.
- QA Lead scope: sees defects in their led/member projects, unassigned list non-empty when applicable.
- Admin scope: sees everything.
- Pass-rate math: 0 when no results, correct rounding with mixed pass/fail.

This fits architecture §17 — the scope logic is pure and deserves Vitest coverage.

**Phase 1 commit:** `refactor(dashboard): extract useDashboardData hook with role scoping`

At this point `Dashboard.tsx` should be ~200 lines shorter. Column arrays and JSX stay untouched.

---

## Phase 2 — Column factories

**New file:** `src/pages/dashboard/_columns.tsx` (co-located, underscore prefix marks it internal)

Replace the four column arrays with factory functions:

```ts
buildDefectColumns(variant: 'my' | 'unassigned' | 'verification', helpers): Column<Defect>[]
buildTestRunColumns(helpers): Column<TestRun>[]
```

The `helpers` object carries the lookup functions (`getProjectName`, `getUserName`, `getTestPlanName`) so the factory stays pure and testable. The `variant` parameter controls:

- which extra column is appended (reporter / assignee / none),
- which `data-testid` the StatusBadges use.

Do NOT over-generalise. If a column is truly unique to one variant, a `switch` inside the factory is fine — don't invent a config DSL.

**Phase 2 commit:** `refactor(dashboard): extract column factories`

---

## Phase 3 — Split JSX into sub-components

Extract the render tree into sub-components, **co-located** in `src/pages/dashboard/_components/` (underscore = not a reusable shared component; Dashboard-only). The page itself remains the single default export.

**Suggested split:**

| Component         | Contents                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| `DashboardStats`  | The 4-card top grid (total / open / plans / pass rate)                  |
| `MyWork`          | "My Assigned Defects" + "My Recent Runs" sections (visible to all roles)|
| `QALeadSections`  | Unassigned + Awaiting Verification tables (qa_lead + admin only)        |
| `AdminOverview`   | "System Overview" 3-card grid (admin only)                              |
| `RecentActivity`  | Timeline section                                                        |

Rules:

- Every sub-component is **purely presentational**. No hooks except `useNavigate` where truly needed. Data comes in via props.
- All `data-testid` attributes preserved **exactly** — don't rename anything.
- No single sub-component exceeds ~60 lines (excluding imports).
- `Dashboard.tsx` after this phase should read top-to-bottom like a table of contents:
  ```tsx
  const data = useDashboardData(user);
  return (
    <div data-testid={TEST_IDS.dashboard.page} ...>
      <PageHeader ... />
      <DashboardStats {...data} />
      <MyWork {...data} />
      {(user.role === 'qa_lead' || user.role === 'admin') && <QALeadSections {...data} />}
      {user.role === 'admin' && <AdminOverview ... />}
      <RecentActivity entries={data.recentActivityEntries} />
    </div>
  );
  ```

**Phase 3 commit:** `refactor(dashboard): split render tree into sub-components`

---

## Non-goals (do NOT do any of this)

- Do NOT change any `data-testid` value. Playwright tests depend on exact strings.
- Do NOT change the rendered DOM structure (classNames, wrapper divs, heading levels). Pure extraction only.
- Do NOT introduce `any`, `@ts-ignore`, or runtime schema validation (no Zod/Yup).
- Do NOT move sub-components into `src/components/` — they are Dashboard-local.
- Do NOT touch i18n strings in `src/i18n/en.ts`. If the hook needs a fallback string (e.g. "Unknown Project"), reuse the existing `t.dashboard.unknownProject` etc.
- Do NOT add new npm dependencies.
- Do NOT bundle multiple phases into one commit.

---

## Done criteria (all phases)

- [ ] Three commits landed in order (hook → columns → sub-components).
- [ ] `src/pages/dashboard/Dashboard.tsx` under ~120 lines total.
- [ ] No role-branching (`if (role === ...)`) outside `useDashboardData`'s internal scope helper.
- [ ] `npx tsc --noEmit` passes clean.
- [ ] `npm run build` succeeds.
- [ ] `npm run test -- --run` passes — existing tests + the new `useDashboardData` tests.
- [ ] Dashboard renders identically in the browser for all three roles (tester / qa_lead / admin). Spot-check each.
- [ ] `STATUS.md` row flipped to ✅ done with Phase 3's commit SHA.
- [ ] Prompt file `git mv`'d to `.github/prompts/done/`.
