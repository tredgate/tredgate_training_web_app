## Plan: Expand App into Enterprise QA Platform

Expand the current single-entity defect tracker into a multi-module enterprise QA platform ("Tredgate QA Hub") with Projects, Defects, Test Plans, Team Management, and Reports. 3 user roles with role-gated workflows. Complex reusable UI components. All frontend-only with localStorage. Target: ~18 pages demonstrating Component Model, Fluent Interface, Fixtures, Business Procedures, and Role Polymorphism for test automation training.

---

### Application Modules (~18 pages)

**Module 1: Auth & Profile** (2 pages)

- **Login** (enhance existing) — Add role selection via predefined users (`tester/test123`, `lead/lead123`, `admin/admin123`), "remember me" checkbox
- **Profile** (new) — View/edit profile, notification preferences

**Module 2: Dashboard** (1 page, role-specific)

- Tester: my open defects, my test runs, recent activity
- QA Lead: project health, unassigned defects, approval queue
- Admin: system stats, user activity, all projects

**Module 3: Projects** (3 pages)

- **Projects List** — DataTable with sorting/filtering/pagination
- **Project Detail** — Tabbed view: Overview | Defects | Test Plans | Team
- **Create/Edit Project** — Multi-step wizard (4 steps)

**Module 4: Defects** (3 pages, enhanced from existing)

- **Defects List** — Advanced DataTable with filters, search, bulk actions
- **Defect Detail** — Status timeline, comments, role-gated state transitions, related test cases
- **Report Defect** — Multi-step wizard (4 steps)

**Module 5: Test Plans & Execution** (4 pages)

- **Test Plans List** — DataTable by project/status
- **Test Plan Detail** — Tabs: Overview | Test Cases (nested table) | Execution History
- **Create Test Plan** — Wizard
- **Test Run Execution** — Interactive step-by-step execution UI

**Module 6: Team** (2 pages)

- **Team List** — User DataTable with roles, projects
- **User Detail** (admin-only) — Edit role, assignments, activity

**Module 7: Reports & Settings** (3 pages)

- **Reports** — Tabbed: Defect Trends | Test Coverage | Team Workload, with filters
- **Settings** (admin-only) — Environments, workflow config, data management
- **Enhanced Dashboard** with role-specific widgets

---

### User Roles & Permissions

| Capability         |         Tester         |        QA Lead        | Admin |
| ------------------ | :--------------------: | :-------------------: | :---: |
| Report defects     |           ✅           |          ✅           |  ✅   |
| Assign defects     |           ❌           |          ✅           |  ✅   |
| Defect transitions | Create, Verify, Reopen | Assign, Reject, Close |  All  |
| Create test plans  |           ❌           |          ✅           |  ✅   |
| Execute test runs  |           ✅           |          ✅           |  ✅   |
| Manage projects    |           ❌           |     Own projects      |  All  |
| Manage users       |           ❌           |          ❌           |  ✅   |
| System settings    |           ❌           |          ❌           |  ✅   |

---

### Defect Lifecycle Workflow

`New → Assigned → In Progress → Resolved → Verified → Closed`
with branches: `Rejected` (back to New) and `Reopened` (back to In Progress)

Each transition gated by role — this is the core **Business Procedure** demo for the presentation.

---

### Reusable UI Components (Component Model targets)

1. **DataTable** — Sortable columns, filters, pagination, row selection, empty/loading states
2. **Modal/Dialog** — Confirmation, form modals, close on escape/backdrop
3. **MultiStepWizard** — Step indicator, next/back, per-step validation, review step
4. **Tabs** — Horizontal with badge counts
5. **StatusBadge** — Color-coded for status/severity/priority
6. **Form Components** — TextInput, TextArea, Select, MultiSelect, DatePicker, Checkbox, RadioGroup
7. **Sidebar Navigation** — Collapsible, role-aware menu items, breadcrumbs
8. **Toast Notifications** — Success/error/warning, auto-dismiss
9. **ActivityTimeline** — For defect history / comments
10. **StatCard** — Dashboard metrics with trends
11. **UserAvatar** — Initials-based with role indicator

---

### Test Automation Pattern Mapping

| Presentation Pattern    | App Feature                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| **Component Model**     | DataTable, Modal, Wizard, Tabs → reusable component objects              |
| **Fluent Interface**    | Multi-step wizards → `.fillTitle().selectSeverity().nextStep().submit()` |
| **Fixtures**            | 3 roles → `test.use({ role: 'admin' })` Playwright fixtures              |
| **Business Procedures** | Full defect lifecycle spanning multiple roles                            |
| **Role Polymorphism**   | Dashboard/nav/actions differ per role → polymorphic page objects         |
| **Data Management**     | Seed data reset, environment config, shared test data                    |

---

### Implementation Phases

**Phase 1: Foundation** (must complete first — HARD GATE)

0. Convert project to TypeScript: add `typescript`, `@types/react`, `@types/react-dom`; create strict `tsconfig.json`; rename existing `.jsx`/`.js` to `.tsx`/`.ts`; define entity types in `src/data/entities.ts` (see architecture §16b)
1. Add `react-router-dom`, set up routing with layout
2. Create AuthContext with role-based login; add `ProtectedRoute` wrapper
3. Build Sidebar navigation (role-aware), Breadcrumbs, Toast
4. Create data layer: localStorage store, seed data, entity definitions
5. Build core components: DataTable, Modal, Wizard, Tabs, FormComponents, StatusBadge, EmptyState
6. Add shared utilities: `useForm` hook, `src/shared/testIds.js` registry
7. Unify defect permissions: `workflow.js` is single source of truth; `permissions.js` delegates
8. Set up Vitest + unit tests for `workflow.js`, `permissions.js`, `useForm.js`, `store.js`, `seed.js` (see architecture §17)

**Phase 1 Gate — shared component APIs frozen.** No Phase 2/3 work begins until all foundation components, hooks, and registries above are complete and reviewed. Any change to a shared component API after this point requires updating all callers in the same commit.

**Phase 2: Projects** (_parallel with Phase 3, after Phase 1_) 6. Projects List with DataTable 7. Project Detail with Tabs 8. Create/Edit Project wizard 9. Wire project data

**Phase 3: Enhanced Defects** (_parallel with Phase 2, after Phase 1_) 10. Overhaul DefectList with advanced DataTable 11. Defect Detail with timeline, comments, state transitions 12. ReportDefect as multi-step wizard 13. Defect lifecycle workflow with role-gated transitions

**Phase 4: Test Plans** (_depends on Phase 2 + 3_) 14. Test Plans List, Detail, Create wizard 15. Test Run Execution UI 16. Link test results ↔ defects

**Phase 5: Team, Reports & Settings** (_parallel with Phase 4_) 17. Team List + User Detail (admin-only) 18. Reports with tabbed views and filters 19. Settings page, enhanced Dashboard

**Phase 6: Polish** (_depends on all above_) 20. Rich seed data (2-3 projects, 10-15 defects, test plans) 21. Deliberate test automation traps/challenges 22. Theme consistency, final walkthrough

---

### Technical Approach

- **New runtime dependency**: `react-router-dom` (replaces hand-rolled navigation)
- **New devDependencies**: `typescript`, `@types/react`, `@types/react-dom`, `vitest`
- Keep Vite + React + Tailwind stack, cyberpunk theme
- ~55-60 new files, organized per architecture §3
- All data in localStorage, seeded on first load

### Scope Boundaries

- **Included**: 7 modules, ~18 pages, 3 roles, full defect workflow, reusable components, seed data
- **Excluded**: Real API/backend, real auth, real file uploads, i18n, mobile-first design
