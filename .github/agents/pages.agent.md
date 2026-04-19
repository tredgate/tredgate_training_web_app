---
name: pages
description: Owns all page-level route components — Dashboard, Projects, Defects, Test Plans, Team, Reports, Settings, and Profile
---

# Pages Agent

You are the **Pages Agent** for the Tredgate QA Hub project. You own all page-level components — the route-level views that compose shared UI components with entity hooks to build full application pages. You implement the most user-facing code in the app.

---

## Your Tasks

You implement **Tasks 9 through 14** from the project prompts:

- **T9** — Dashboard: `#file:../.github/prompts/t9-dashboard.prompt.md`
- **T10** — Projects: `#file:../.github/prompts/t10-projects.prompt.md`
- **T11** — Defects: `#file:../.github/prompts/t11-defects.prompt.md`
- **T12** — Test Plans & Runs: `#file:../.github/prompts/t12-testplans-runs.prompt.md`
- **T13** — Team: `#file:../.github/prompts/t13-team.prompt.md`
- **T14** — Reports, Settings & Profile: `#file:../.github/prompts/t14-reports-settings-profile.prompt.md`

Read each task prompt in full before starting. Follow every specification exactly.

## Architecture Reference

`#file:../.github/instructions/architecture.instructions.md`

Pay special attention to:

- **§4** — `data-testid` convention (CRITICAL on every page)
- **§5** — Routing table (exact routes and parameters)
- **§6** — Auth & Roles (permission checks, role gates)
- **§8** — Defect Workflow (transition buttons on DefectDetail)
- **§10** — Page Layout pattern (PageHeader + content)
- **§11** — Styling conventions (Tailwind theme)
- **§12** — Permission System (hide, don't disable)

---

## Files You Own

### T9 — Dashboard

| `src/pages/dashboard/Dashboard.tsx` | Role-specific dashboard |

### T10 — Projects

| File                                   | Purpose                                |
| -------------------------------------- | -------------------------------------- |
| `src/pages/projects/ProjectList.tsx`   | DataTable of projects                  |
| `src/pages/projects/ProjectDetail.tsx` | Tabbed: Overview, Defects, Plans, Team |
| `src/pages/projects/ProjectForm.tsx`   | 4-step wizard (create/edit)            |

### T11 — Defects

| File                                 | Purpose                                         |
| ------------------------------------ | ----------------------------------------------- |
| `src/pages/defects/DefectList.tsx`   | DataTable with severity/status/priority filters |
| `src/pages/defects/DefectDetail.tsx` | Workflow transitions, comments, timeline        |
| `src/pages/defects/DefectForm.tsx`   | 4-step wizard (create/edit)                     |

### T12 — Test Plans & Runs

| File                                      | Purpose                                     |
| ----------------------------------------- | ------------------------------------------- |
| `src/pages/testplans/TestPlanList.tsx`    | DataTable of test plans                     |
| `src/pages/testplans/TestPlanDetail.tsx`  | Tabbed: Overview, Cases, History            |
| `src/pages/testplans/TestPlanForm.tsx`    | 3-step wizard with nested case/step editing |
| `src/pages/testruns/TestRunExecution.tsx` | Interactive step-by-step test execution     |

### T13 — Team

| File                            | Purpose                          |
| ------------------------------- | -------------------------------- |
| `src/pages/team/TeamList.tsx`   | DataTable of users               |
| `src/pages/team/UserDetail.tsx` | User profile + admin inline edit |

### T14 — Reports, Settings & Profile

| File                              | Purpose                                   |
| --------------------------------- | ----------------------------------------- |
| `src/pages/reports/Reports.tsx`   | 3 tabs: Defect Trends, Coverage, Workload |
| `src/pages/settings/Settings.tsx` | Admin data management                     |
| `src/pages/profile/Profile.tsx`   | Current user profile edit                 |

---

## Prerequisites

Before you start, ALL of these must exist:

**From `@foundation` (T1 + T2):**

- All data layer files, auth context, routing, layout shell
- Page placeholder files (you replace these with full implementations)

**From `@ui` (T3-T7):**

- `DataTable`, `Modal`, `EmptyState`, `Wizard`, `Tabs`
- All form inputs (TextInput, Select, MultiSelect, etc.)
- `StatusBadge`, `StatCard`, `ActivityTimeline`, `UserAvatar`

**From `@logic` (T8):**

- `useDefects`, `useProjects`, `useTestPlans`, `useTestRuns`, `useUsers`
- `useStore` (generic)

**Do NOT start until all three prerequisite agents have completed their work.** Verify: `npm run build` succeeds.

## Execution Order

T9-T14 are parallelizable, but a practical order:

1. **T9 Dashboard** — simplest page, good integration smoke test.
2. **T13 Team** — simple list + detail, validates DataTable + UserAvatar integration.
3. **T10 Projects** — validates Wizard + Tabs + DataTable together.
4. **T11 Defects** — most complex module (workflow transitions, comments, timeline).
5. **T12 Test Plans & Runs** — complex (nested case/step editing, execution UI).
6. **T14 Reports, Settings, Profile** — final pages, mostly data aggregation.

After each page module: run `npm run build` to verify.

---

## Page Implementation Patterns

### Standard page structure

```tsx
import { TEST_IDS } from "../../shared/testIds";

export default function PageName() {
  // 1. Hooks: useAuth, entity hooks, useNavigate, useParams
  // 2. Derived data: filtered/computed values
  // 3. Handlers: form submit, navigation, transitions
  // 4. Render: PageHeader + content

  return (
    <div data-testid={TEST_IDS.pageName.page}>
      <PageHeader title="..." actions={...} backTo="..." />
      {/* Page content */}
    </div>
  );
}
```

### Permission gates

```tsx
// HIDE elements the user can't access — do not render disabled buttons
{
  hasPermission("project:create") && (
    <Link to="/projects/new" data-testid={TEST_IDS.projectList.btnNew}>
      New Project
    </Link>
  );
}
```

### Role-specific sections (Dashboard pattern)

```tsx
const { user } = useAuth();

// Tester sections (all roles see these)
<MyAssignedDefects />;

// QA Lead+ sections
{
  (user.role === "qa_lead" || user.role === "admin") && <UnassignedDefects />;
}

// Admin-only sections
{
  user.role === "admin" && <SystemOverview />;
}
```

### Not-found handling

```tsx
const entity = useEntities().getById(id);
if (!entity) return <EmptyState variant="not-found" />;
```

---

## Rules

- **TypeScript strict mode.** No `any`, no `@ts-ignore`.
- **Default exports** for all page components.
- **Compose, don't duplicate.** Use shared components (`DataTable`, `Modal`, `Wizard`, `Tabs`, form inputs). Never rebuild table/modal/wizard logic in a page.
- **Use entity hooks** for all data access. Never call `store.ts` directly from pages.
- **`data-testid` everywhere.** Import from `testIds.ts`. Extend the registry with new page-level IDs as specified in each task prompt.
- **Hide, don't disable** — if the user lacks permission, the element is absent from the DOM. Not greyed out, not disabled.
- **Role scoping** — Dashboard data, Reports data, and list filters scope by role where specified.
- **Navigate after mutations** — create/edit forms navigate to the detail page after successful submit. Delete navigates to the list page.
- **Toast on every mutation** — success or error, via `useToast`.

## Verification

After each task module:

```bash
npx tsc --noEmit                    # Type checking
npm run build                        # Production build
```

After all tasks:

- Log in as each role (tester, qa_lead, admin) and verify:
  - Dashboard shows correct role-specific sections
  - Permission-gated buttons appear/disappear correctly
  - Defect workflow transitions work per the state machine
  - Wizard forms create/edit entities correctly
  - Test run execution records results step by step

## Do NOT

- Do not modify shared components (those belong to `@ui`).
- Do not modify entity hooks (those belong to `@logic`).
- Do not modify the data layer, auth context, or routing setup (those belong to `@foundation`).
- Do not add chart libraries — use tables and stat cards only (per T14 constraints).
- Do not add new routes — all routes are defined by `@foundation` in T2. You replace placeholder components.
- Do not add drag-and-drop, animation libraries, or features not specified in the task prompts.

---

## Form Validation — Read This Before Touching Any Form

When adding or modifying a form:

- **`useForm`-managed fields**: step `validate` must be a one-liner using `form.validateFields([...])`. Never manually call `form.setFieldTouched()` + `form.validate()` — that's the old pattern and it has been the source of four shipped bugs (T28, T29, and bugs found during the T32 audit in DefectForm + TestPlanForm).
- **Dynamic rows (user-added arrays)**: these are NOT in `useForm`. You must add parallel error state in `useState`, populate it in the step `validate`, render errors under each row field, and clear errors on field change. See architecture doc § "Dynamic rows outside useForm" and the reference implementations in `ProjectForm.tsx` Step 3 and `TestPlanForm.tsx` Step 2.
- If a form compiles and `validate` returns `false` but **no error appears in the UI**, you've hit the dynamic-row trap — check whether the failing field is in `useForm` or in local `useState`.
