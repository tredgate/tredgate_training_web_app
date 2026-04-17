# Task 9 — Dashboard Page

> **Layer**: 3 (Pages) · **Depends on**: T2 (layout shell), T7 (StatCard, ActivityTimeline, StatusBadge), T8 (all entity hooks) · **Parallelizable** with T10-T14

## Objective

Build the role-specific Dashboard page. This is the landing page after login. Each role sees different widgets with data relevant to their responsibilities. Uses StatCard for metrics, DataTable for lists, and StatusBadge for severity/status rendering.

## Constraints

- Follow architecture §10 (page layout pattern), §12 (permission checks — hide, don't disable).
- All `data-testid` from `src/shared/testIds.ts`. Extend the registry.
- Data comes from entity hooks (`useDefects`, `useProjects`, `useTestPlans`, `useTestRuns`, `useUsers`).
- Role-specific sections: render ONLY sections the current role should see (check with `useAuth`).

## File to Create

### `src/pages/dashboard/Dashboard.tsx`

Replace the placeholder from T2.

#### Layout

```
PageHeader: "Dashboard" (no actions)

Top row: 4 StatCards in a grid (2x2 on md, 4x1 on lg)

Middle: Role-specific sections (see below)

Bottom: Recent Activity timeline
```

#### StatCards (all roles see these, but data scope differs)

| Card          | Tester                    | QA Lead                    | Admin          |
| ------------- | ------------------------- | -------------------------- | -------------- |
| Total Defects | My reported defects count | All defects in my projects | All defects    |
| Open Defects  | My open (assigned to me)  | Open in my projects        | All open       |
| Test Plans    | Plans I'm assigned to     | Plans in my projects       | All plans      |
| Pass Rate     | My test run pass %        | Project avg pass %         | Overall pass % |

```tsx
// Icons: Bug, AlertTriangle, ClipboardList, CheckCircle (from lucide-react)
// Trend: optional — e.g., { value: "+3", positive: false } for defect count
```

`data-testid`: `dashboard-card-total-defects`, `dashboard-card-open-defects`, `dashboard-card-test-plans`, `dashboard-card-pass-rate`.

#### Tester-specific sections

1. **My Assigned Defects** — Small DataTable showing defects assigned to current user. Columns: Title, Project, Severity (StatusBadge), Status (StatusBadge), Priority. Row click → navigate to `/defects/{id}`. Max 5 rows, no pagination. `data-testid="dashboard-my-defects-table"`.

2. **My Recent Test Runs** — Small DataTable showing test runs by current user. Columns: Test Plan Name, Status, Results (e.g., "4/6 passed"), Date. Row click → navigate to test plan. Max 5 rows. `data-testid="dashboard-my-runs-table"`.

#### QA Lead-specific sections (in addition to tester sections)

3. **Unassigned Defects** — Defects with `status: "new"` in projects where user is lead. DataTable with: Title, Project, Severity, Reporter, Created. Row click → `/defects/{id}`. `data-testid="dashboard-unassigned-table"`.

4. **Awaiting Verification** — Defects with `status: "resolved"` in my projects. Small DataTable. `data-testid="dashboard-verification-table"`.

#### Admin-specific sections (sees everything)

Admin sees all of the above (scoped to all data, not just their projects), plus:

5. **System Overview** — Additional StatCards row: Total Users, Total Projects, Active Projects. `data-testid="dashboard-card-total-users"`, `dashboard-card-total-projects"`, `dashboard-card-active-projects`.

#### Recent Activity (all roles)

`ActivityTimeline` with the last 10 history entries across all defects (scoped by role). Merge defect histories, sort by timestamp desc, take first 10.

`data-testid="dashboard-activity-timeline"`.

#### Computed values

Pass rate calculation:

```ts
// For a set of test runs:
const totalCases = runs.flatMap((r) => r.results).length;
const passedCases = runs
  .flatMap((r) => r.results)
  .filter((r) => r.status === "passed").length;
const passRate =
  totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;
// Display as "67%" in the StatCard
```

### `src/shared/testIds.ts` — Extend

```ts
// Dashboard scope
dashboard: {
  page: "dashboard-page",
  cardTotalDefects: "dashboard-card-total-defects",
  cardOpenDefects: "dashboard-card-open-defects",
  cardTestPlans: "dashboard-card-test-plans",
  cardPassRate: "dashboard-card-pass-rate",
  cardTotalUsers: "dashboard-card-total-users",
  cardTotalProjects: "dashboard-card-total-projects",
  cardActiveProjects: "dashboard-card-active-projects",
  myDefectsTable: "dashboard-my-defects-table",
  myRunsTable: "dashboard-my-runs-table",
  unassignedTable: "dashboard-unassigned-table",
  verificationTable: "dashboard-verification-table",
  activityTimeline: "dashboard-activity-timeline",
},
```

## Verification Checklist

- [ ] Page renders with `data-testid="dashboard-page"`
- [ ] 4 StatCards render with correct values for the logged-in role
- [ ] Tester sees: My Assigned Defects + My Recent Test Runs tables
- [ ] QA Lead sees: all tester sections + Unassigned Defects + Awaiting Verification
- [ ] Admin sees: all sections + System Overview stat cards
- [ ] DataTable rows are clickable and navigate to correct detail pages
- [ ] StatusBadge renders correctly for severity and status columns
- [ ] ActivityTimeline shows recent entries sorted by timestamp
- [ ] Pass rate calculates correctly (handles 0 runs gracefully)
- [ ] Role-specific sections are fully absent (not just hidden) for unauthorized roles
- [ ] All interactive elements have `data-testid`

## Do NOT

- Do not add charts or graph visualizations (that's the Reports page)
- Do not add refresh/polling — data is synchronous
- Do not hardcode data — all values computed from entity hooks
- Do not add separate components for each role section — keep it in one file with conditional rendering
- Use TypeScript (strict). No `any`, no `@ts-ignore`.
