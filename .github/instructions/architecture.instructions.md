# Tredgate QA Hub — Architecture & Conventions

> This document is the single source of truth for all agents working on this project.
> Every task must follow these conventions. If in doubt, reference this file.

---

## 1. Project Overview

**Tredgate QA Hub** is a frontend-only enterprise QA platform built with React + Vite + Tailwind CSS. It simulates a complex enterprise application for a test automation training course (Playwright). All data lives in `localStorage` — there is no backend/API.

**Purpose**: Provide a realistic, complex application that demonstrates Component Model, Fluent Interface, Fixtures, Business Procedures, Role Polymorphism, and Data Management patterns in test automation.

---

## 2. Tech Stack

| Category  | Library          | Version |
| --------- | ---------------- | ------- |
| Framework | React            | ^19     |
| Language  | TypeScript       | ^5      |
| Build     | Vite             | ^8      |
| Styling   | Tailwind CSS     | ^3.4    |
| Routing   | react-router-dom | ^7      |
| Icons     | lucide-react     | ^0.577  |
| Testing   | Vitest (dev)     | ^2      |

**No other runtime dependencies.** Do not add state management libraries (Redux, Zustand, etc.), UI component libraries (Radix, Headless UI, etc.), or CSS-in-JS libraries. Everything is custom-built with Tailwind utility classes and the custom CSS classes defined in `src/index.css`.

---

## 3. File Structure

```
src/
├── main.tsx                        # Entry point, renders App with RouterProvider
├── App.tsx                         # Root layout: Sidebar + Outlet + Toast
├── index.css                       # Tailwind directives + custom component classes
│
├── components/                     # Shared reusable UI components
│   ├── layout/
│   │   ├── Sidebar.tsx             # Collapsible sidebar navigation (role-aware)
│   │   ├── Breadcrumbs.tsx         # Route-based breadcrumbs
│   │   ├── PageHeader.tsx          # Page title + actions bar
│   │   ├── ProtectedRoute.tsx      # Auth + role gate wrapper for routes
│   │   └── Footer.tsx              # App footer with reset + version
│   ├── data/
│   │   └── DataTable.tsx           # Sortable, filterable, paginated table
│   ├── feedback/
│   │   ├── Modal.tsx               # Dialog/modal overlay
│   │   ├── Toast.tsx               # Toast notification component
│   │   ├── StatusBadge.tsx         # Color-coded status/severity badge
│   │   └── EmptyState.tsx          # Empty/not-found/permission-denied placeholder
│   ├── forms/
│   │   ├── TextInput.tsx           # Text input with label + error
│   │   ├── TextArea.tsx            # Textarea with label + error
│   │   ├── Select.tsx              # Single select dropdown
│   │   ├── MultiSelect.tsx         # Multi-select with checkboxes
│   │   ├── Checkbox.tsx            # Checkbox with label
│   │   ├── RadioGroup.tsx          # Radio button group
│   │   ├── DatePicker.tsx          # Date input (native)
│   │   └── FileUpload.tsx          # Simulated file upload (display only)
│   ├── navigation/
│   │   ├── Tabs.tsx                # Horizontal tab bar with optional badge counts
│   │   └── Wizard.tsx              # Multi-step wizard with step indicator
│   └── display/
│       ├── StatCard.tsx            # Dashboard metric card
│       ├── ActivityTimeline.tsx    # Vertical timeline for history/comments
│       └── UserAvatar.tsx          # Initials-based avatar with role badge
│
├── contexts/
│   ├── AuthContext.tsx             # Current user, role, login/logout
│   └── ToastContext.tsx            # Toast notification state + dispatch
│
├── data/
│   ├── store.ts                    # Generic localStorage CRUD operations
│   ├── seed.ts                     # All seed data (users, projects, defects, etc.)
│   └── entities.ts                 # Entity types, enums, and constant arrays
│
├── hooks/
│   ├── useAuth.ts                  # Shortcut for useContext(AuthContext)
│   ├── useToast.ts                 # Shortcut for useContext(ToastContext)
│   ├── useForm.ts                  # Shared form state: values, errors, touched, validate
│   ├── useStore.ts                 # Generic hook wrapping store.ts for a given entity
│   ├── useDefects.ts               # Defect-specific CRUD + workflow transitions
│   ├── useProjects.ts              # Project-specific CRUD
│   ├── useTestPlans.ts             # Test plan CRUD + test case management
│   ├── useTestRuns.ts              # Test run execution + results
│   └── useUsers.ts                 # User management (admin)
│
├── pages/
│   ├── auth/
│   │   └── Login.tsx
│   ├── dashboard/
│   │   └── Dashboard.tsx           # Role-specific dashboard
│   ├── profile/
│   │   └── Profile.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   ├── ProjectDetail.tsx
│   │   └── ProjectForm.tsx         # Create/Edit wizard
│   ├── defects/
│   │   ├── DefectList.tsx
│   │   ├── DefectDetail.tsx
│   │   └── DefectForm.tsx          # Report/Edit wizard
│   ├── testplans/
│   │   ├── TestPlanList.tsx
│   │   ├── TestPlanDetail.tsx
│   │   ├── TestPlanForm.tsx        # Create/Edit wizard
│   │   └── TestRunExecution.tsx
│   ├── team/
│   │   ├── TeamList.tsx
│   │   └── UserDetail.tsx
│   ├── reports/
│   │   └── Reports.tsx
│   └── settings/
│       └── Settings.tsx
│
└── utils/
    ├── permissions.ts              # Role-based permission checks
    └── workflow.ts                 # Defect state machine + transition rules (single source of truth for defect permissions)
```

Additionally, at the `src/` root:

```
src/
├── shared/
│   └── testIds.ts                  # Central registry of all data-testid values
```

### Naming Rules

- **Files**: PascalCase for components (`DataTable.tsx`), camelCase for non-components (`store.ts`, `permissions.ts`)
- **Extensions**: `.tsx` for files containing JSX, `.ts` otherwise
- **Components**: One component per file. Export as `default`. File name = component name. Props interface named `{Component}Props`, defined in the same file.
- **Hooks**: `use` prefix, camelCase (`useDefects.ts`). Export as named export. Generic where it makes sense (e.g. `useForm<T>`, `useStore<T>`).
- **Contexts**: PascalCase, `Context` suffix (`AuthContext.tsx`). Export context + provider.
- **Pages**: PascalCase. Each page is a route-level component.
- **Utils**: camelCase. Export named functions.
- **Types**: Shared entity types live in `src/data/entities.ts`. Do NOT duplicate type definitions across files — import from `entities.ts`.

---

## 4. Data-TestId Convention (CRITICAL)

**Every interactive and meaningful element MUST have a `data-testid` attribute.** This is non-negotiable — the app is a test automation training target.

### Naming Pattern

```
data-testid="{scope}-{element}-{qualifier}"
```

- **scope**: The component/page context (e.g., `login`, `sidebar`, `defect-list`, `project-form`)
- **element**: The element type (e.g., `btn`, `input`, `select`, `link`, `row`, `cell`, `badge`, `tab`, `modal`, `card`, `heading`, `table`)
- **qualifier**: Specific identifier — use the item's semantic meaning, not index (e.g., `submit`, `cancel`, `severity`, `title`, `critical`)

### Examples

```jsx
// Page-level containers
<div data-testid="defect-list-page">
<div data-testid="dashboard-page">

// Navigation
<button data-testid="sidebar-link-dashboard">
<button data-testid="sidebar-link-defects">
<button data-testid="sidebar-btn-logout">
<nav data-testid="breadcrumbs">

// Forms
<input data-testid="defect-form-input-title" />
<textarea data-testid="defect-form-input-description" />
<select data-testid="defect-form-select-severity" />
<button data-testid="defect-form-btn-submit" />
<button data-testid="defect-form-btn-cancel" />
<button data-testid="defect-form-btn-next-step" />
<button data-testid="defect-form-btn-prev-step" />

// Wizard steps
<div data-testid="wizard-step-1">
<div data-testid="wizard-step-indicator" />

// DataTable
<table data-testid="defect-list-table">
<thead data-testid="defect-list-table-header">
<tr data-testid="defect-list-row-{id}">         // Use entity ID
<td data-testid="defect-list-cell-title-{id}">
<td data-testid="defect-list-cell-severity-{id}">
<button data-testid="defect-list-btn-resolve-{id}">  // Unique per row!
<input data-testid="defect-list-input-search" />
<select data-testid="defect-list-select-severity-filter" />
<button data-testid="defect-list-btn-sort-title" />
<nav data-testid="defect-list-pagination" />
<button data-testid="defect-list-btn-page-next" />
<button data-testid="defect-list-btn-page-prev" />
<select data-testid="defect-list-select-page-size" />

// Modals
<div data-testid="modal-confirm-delete">
<button data-testid="modal-btn-confirm">
<button data-testid="modal-btn-cancel">

// Tabs
<div data-testid="project-detail-tabs">
<button data-testid="project-detail-tab-overview">
<button data-testid="project-detail-tab-defects">
<div data-testid="project-detail-tab-panel-overview">

// Status badges
<span data-testid="defect-badge-severity-{id}">
<span data-testid="defect-badge-status-{id}">

// Dashboard cards
<div data-testid="dashboard-card-total-defects">
<div data-testid="dashboard-card-critical-count">

// Activity timeline
<div data-testid="defect-detail-timeline">
<div data-testid="defect-detail-timeline-entry-{index}">

// Toast notifications
<div data-testid="toast-success">
<div data-testid="toast-error">

// User avatar
<div data-testid="user-avatar-{userId}">
```

### Rules

1. **Every `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>` MUST have a `data-testid`.**
2. **Every table `<tr>` MUST have a `data-testid` with the entity ID** — never index-based.
3. **Every page root element MUST have a `data-testid`** ending in `-page`.
4. **Every modal MUST have a `data-testid`** on the overlay container.
5. **Avoid duplicate `data-testid` values** — use entity IDs or semantic qualifiers to disambiguate.
6. **List items** use `data-testid="{scope}-row-{entityId}"` — always the entity's `id`, never array index.
7. **Dynamic elements** (buttons that appear/disappear based on role or state) still get `data-testid`.

---

## 5. Routing

Use `react-router-dom` with `createBrowserRouter` and a layout route.

```
/login                          → Login
/                               → Dashboard (redirect from /)
/dashboard                      → Dashboard
/profile                        → Profile
/projects                       → ProjectList
/projects/new                   → ProjectForm (create)
/projects/:projectId            → ProjectDetail
/projects/:projectId/edit       → ProjectForm (edit)
/defects                        → DefectList
/defects/new                    → DefectForm (create)
/defects/:defectId              → DefectDetail
/defects/:defectId/edit         → DefectForm (edit)
/test-plans                     → TestPlanList
/test-plans/new                 → TestPlanForm (create)
/test-plans/:planId             → TestPlanDetail
/test-plans/:planId/edit        → TestPlanForm (edit)
/test-plans/:planId/execute     → TestRunExecution
/team                           → TeamList
/team/:userId                   → UserDetail
/reports                        → Reports
/settings                       → Settings
```

### Route Protection

- `/login` — only when not authenticated
- `/settings`, `/team/:userId` — admin only
- `/team` — admin only for edit actions, all roles can view
- All other routes — any authenticated role

Use `<ProtectedRoute>` (`src/components/layout/ProtectedRoute.tsx`) to wrap all non-`/login` routes.

```jsx
// Props: { children, allowedRoles? }
// - Not authenticated → redirect to /login
// - Authenticated but role not in allowedRoles → render EmptyState with "Permission denied"
<ProtectedRoute>
  <Outlet />
</ProtectedRoute>

<ProtectedRoute allowedRoles={["admin"]}>
  <Settings />
</ProtectedRoute>
```

`data-testid="protected-route-denied"` on the permission-denied state.

---

## 6. Authentication & Roles

### Predefined Users

```js
const USERS = [
  {
    id: 1,
    username: "tester",
    password: "test123",
    role: "tester",
    fullName: "Tom Tester",
    email: "tom@tredgate.com",
  },
  {
    id: 2,
    username: "lead",
    password: "lead123",
    role: "qa_lead",
    fullName: "Laura Lead",
    email: "laura@tredgate.com",
  },
  {
    id: 3,
    username: "admin",
    password: "admin123",
    role: "admin",
    fullName: "Alex Admin",
    email: "alex@tredgate.com",
  },
];
```

### AuthContext Shape

```js
{
  user: { id, username, role, fullName, email } | null,
  isAuthenticated: boolean,
  login(username, password) → boolean,   // validates credentials, sets user
  logout() → void,                       // clears user, navigates to /login
  hasPermission(action) → boolean,       // checks role-based permissions
}
```

### Role Hierarchy

`admin` > `qa_lead` > `tester`

Admin inherits all QA Lead permissions. QA Lead inherits all Tester permissions.

---

## 7. Data Layer

### localStorage Store API (`src/data/store.js`)

Generic CRUD over localStorage, one key per entity type:

```js
// Each entity type has a storage key: "tqh_defects", "tqh_projects", etc.
// Prefix all keys with "tqh_" to avoid collisions.

getAll(entityKey) → array
getById(entityKey, id) → object | null
create(entityKey, data) → object          // auto-generates id
update(entityKey, id, data) → object
remove(entityKey, id) → void
reset(entityKey, seedData) → array        // resets to seed data
resetAll() → void                         // resets everything to seed state
```

### Entity Schemas

All entities use numeric auto-incremented `id`. All have `createdAt` (ISO string). Mutable entities have `updatedAt`.

#### User

```js
{
  id: number,
  username: string,
  password: string,         // plaintext (it's a training app, not production)
  role: "tester" | "qa_lead" | "admin",
  fullName: string,
  email: string,
  avatarColor: string,      // hex color for initials avatar
  projectIds: number[],     // assigned projects
  createdAt: string,
}
```

#### Project

```js
{
  id: number,
  name: string,
  code: string,             // e.g., "PHOENIX", "ATLAS" — uppercase short code
  description: string,
  status: "planning" | "active" | "archived",
  leadId: number,           // QA Lead user ID
  memberIds: number[],      // assigned user IDs
  environments: [           // embedded, not a separate entity
    { id: number, name: string, type: "dev" | "staging" | "production", url: string }
  ],
  createdAt: string,
  updatedAt: string,
}
```

#### Defect

```js
{
  id: number,
  projectId: number,
  title: string,
  description: string,
  stepsToReproduce: string,
  severity: "critical" | "major" | "minor" | "trivial",
  priority: "P1" | "P2" | "P3" | "P4",
  status: "new" | "assigned" | "in_progress" | "resolved" | "verified" | "closed" | "rejected" | "reopened",
  reporterId: number,
  assigneeId: number | null,
  environmentId: number | null,
  relatedTestCaseIds: number[],
  comments: [
    { id: number, userId: number, text: string, createdAt: string }
  ],
  history: [
    { id: number, userId: number, action: string, fromStatus: string | null, toStatus: string | null, details: string, timestamp: string }
  ],
  createdAt: string,
  updatedAt: string,
}
```

#### TestPlan

```js
{
  id: number,
  projectId: number,
  name: string,
  description: string,
  status: "draft" | "active" | "completed" | "archived",
  createdById: number,
  assigneeId: number | null,
  testCases: [
    {
      id: number,
      name: string,
      description: string,
      preconditions: string,
      steps: [
        { stepNumber: number, action: string, expectedResult: string }
      ],
      priority: "high" | "medium" | "low",
    }
  ],
  createdAt: string,
  updatedAt: string,
}
```

#### TestRun

```js
{
  id: number,
  testPlanId: number,
  executorId: number,
  status: "in_progress" | "completed",
  results: [
    {
      testCaseId: number,
      status: "not_run" | "passed" | "failed" | "blocked" | "skipped",
      notes: string,
      duration: number | null,  // seconds
    }
  ],
  startedAt: string,
  completedAt: string | null,
}
```

---

## 8. Defect Workflow State Machine

```
        ┌──────────┐
        │   New    │ ← Created by any role
        └────┬─────┘
             │ assign (qa_lead, admin)
        ┌────▼─────┐
    ┌───│ Assigned  │───┐
    │   └────┬─────┘   │
    │        │ start    │ reject (qa_lead, admin)
    │   ┌────▼─────┐   │
    │   │In Progress│   │
    │   └────┬─────┘   │
    │        │ resolve  │
    │   ┌────▼─────┐   │      ┌─────────┐
    │   │ Resolved  │   └─────►│Rejected │──► (back to New)
    │   └────┬─────┘          └─────────┘
    │        │ verify (tester, qa_lead)
    │   ┌────▼─────┐
    │   │ Verified  │
    │   └────┬─────┘
    │        │ close (qa_lead, admin)
    │   ┌────▼─────┐
    │   │  Closed   │
    │   └──────────┘
    │
    │   From Verified: reopen (tester, qa_lead) → In Progress
    └── From Assigned: reject (qa_lead, admin) → Rejected
```

### Transition Rules (`src/utils/workflow.js`)

```js
// Single source of truth for defect transition permissions.
// permissions.js delegates to this file — do not duplicate role lists.

// Returns array of allowed transitions for given status + role
getAvailableTransitions(currentStatus, userRole) → [{ action, targetStatus, label }]

// Validates and executes a transition
executeTransition(defect, action, userId) → updatedDefect
```

| From        | Action  | To          | Allowed Roles          |
| ----------- | ------- | ----------- | ---------------------- |
| new         | assign  | assigned    | qa_lead, admin         |
| assigned    | start   | in_progress | tester, qa_lead, admin |
| assigned    | reject  | rejected    | qa_lead, admin         |
| in_progress | resolve | resolved    | tester, qa_lead, admin |
| resolved    | verify  | verified    | tester, qa_lead        |
| verified    | close   | closed      | qa_lead, admin         |
| verified    | reopen  | in_progress | tester, qa_lead        |
| rejected    | reopen  | new         | tester, qa_lead, admin |

---

## 9. Component API Conventions

### General Rules

- All components receive props. No internal data fetching (hooks are used at page level).
- All components are controlled — state lives in the parent/hook, not inside the component.
- All callback props use `on` prefix: `onChange`, `onSubmit`, `onClose`, `onSort`.
- All components accept `className` prop for additional styling (merged, not replaced).
- All components are exported as `default`.

### DataTable Props

```jsx
<DataTable
  data-testid="defect-list-table"
  columns={[
    { key: "title", label: "Title", sortable: true },
    { key: "severity", label: "Severity", sortable: true, render: (value, row) => <StatusBadge ... /> },
    { key: "status", label: "Status", sortable: true },
    { key: "actions", label: "", render: (_, row) => <button ... /> },
  ]}
  data={defects}                    // array of objects
  keyField="id"                     // unique key field name
  searchable={true}                 // show search input
  searchPlaceholder="Search defects..."
  filters={[                        // dropdown filters
    { key: "severity", label: "Severity", options: ["critical", "major", "minor", "trivial"] },
    { key: "status", label: "Status", options: [...] },
  ]}
  pagination={true}                 // enable pagination
  pageSize={10}                     // default page size
  pageSizeOptions={[5, 10, 25, 50]}
  selectable={false}                // row checkboxes
  onRowClick={(row) => navigate(`/defects/${row.id}`)}
  emptyMessage="No defects found"
  testIdPrefix="defect-list"        // prefix for all internal data-testid
/>
```

### Modal Props

```jsx
<Modal
  data-testid="modal-confirm-delete"
  isOpen={showModal}
  onClose={handleClose}
  title="Confirm Delete"
  size="md" // "sm" | "md" | "lg" | "full"
  closeOnBackdrop={true}
  closeOnEscape={true}
>
  {children}
</Modal>
```

### Wizard Props

```jsx
<Wizard
  data-testid="defect-form-wizard"
  steps={[
    { label: "Basic Info", content: <Step1 />, validate: () => boolean },
    { label: "Details", content: <Step2 />, validate: () => boolean },
    { label: "Review", content: <ReviewStep /> },
  ]}
  onComplete={handleSubmit}
  onCancel={handleCancel}
  testIdPrefix="defect-form"
/>
```

### Tabs Props

```jsx
<Tabs
  data-testid="project-detail-tabs"
  tabs={[
    { key: "overview", label: "Overview", badge: null },
    { key: "defects", label: "Defects", badge: 12 },
    { key: "test-plans", label: "Test Plans", badge: 3 },
    { key: "team", label: "Team", badge: null },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
  testIdPrefix="project-detail"
/>
```

### Form Components Pattern

All form components follow the same prop pattern:

```jsx
<TextInput
  data-testid="defect-form-input-title"
  label="Title"
  name="title"
  value={form.title}
  onChange={(e) => setField("title", e.target.value)}
  error={errors.title} // string | null — shown below input
  placeholder="Enter defect title"
  required={true}
  disabled={false}
/>
```

### StatusBadge Props

```jsx
<StatusBadge
  data-testid="defect-badge-severity-42"
  type="severity" // "severity" | "status" | "priority" | "project_status"
  value="critical" // the status/severity value
/>
```

### EmptyState Props

Single component for empty tables, not-found pages, and permission-denied screens.

```jsx
<EmptyState
  data-testid="empty-state-no-defects"
  variant="no-defects"              // used in data-testid: "empty-state-{variant}"
  icon={Bug}                        // lucide icon component
  title="No defects found"
  message="Try adjusting your filters or report a new defect."
  action={<button onClick={...}>Report Defect</button>}  // optional action button
/>
```

Use for: empty DataTable results (`variant="no-results"`), 404 pages (`variant="not-found"`), permission denied (`variant="permission-denied"`).

### useForm Hook API (`src/hooks/useForm.ts`)

All form pages (Login, Profile, ProjectForm, DefectForm, TestPlanForm) must use this hook. ~60 lines, no schema validator, no field-array support.

```ts
const {
  values, // current form values object
  errors, // { fieldName: "Error message" } — populated by validate() / validateFields()
  touched, // { fieldName: true } — tracks which fields have been interacted with
  setField, // (name, value) => void — auto-clears/updates error for that field if one exists
  setFieldTouched, // (name) => void — call on blur
  validate, // () => boolean — runs validate function, returns true if valid
  validateFields, // (fields) => boolean — validates listed fields, marks them touched, returns true if none have errors
  reset, // (newValues?) => void — reset to initialValues or provided values
  handleSubmit, // (onValid) => (e) => void — prevents default, validates, calls onValid(values)
} = useForm(initialValues, validateFn);

// validateFn signature:
// (values) => { fieldName: "Error message", ... } — return empty object if valid
```

**`setField` auto-clear:** When `setField(name, value)` is called and `errors[name]` already has a value, the hook re-runs `validateFn` against the updated values and updates or clears `errors[name]`. Fields with no existing error are not re-validated on keystroke.

**`handleSubmit`:** Marks **all** fields as touched before checking validation, so errors display immediately on a blank form submit.

**Step validation pattern:** Wizard step `validate` closures must be one-liners using `validateFields`:

```ts
validate: () => form.validateFields(["name", "code", "description", "status"]);
```

One `validateFn` per form (the one passed to `useForm`), never per-step validators. `validateFields` runs the full `validateFn`, then filters the result to only the listed fields.

**⚠️ Deprecated pattern — do NOT use:**

```ts
// ❌ WRONG — manually calling validate() + setFieldTouched() per field.
// This "dance" has caused four shipped bugs (T28, T29, T32 audit).
validate: () => {
  const errors = validateStep1(form.values);
  Object.keys(errors).forEach((field) => form.setFieldTouched(field));
  form.validate();
  return Object.keys(errors).length === 0;
};
```

### Dynamic rows outside `useForm`

Fields in user-managed arrays (environments in ProjectForm, test cases + steps in TestPlanForm) are **not** managed by `useForm`. They live in local `useState`. This is intentional — `useForm` does not support field arrays, and adding that would double the API surface for a 3-form app.

When implementing dynamic rows, follow this pattern:

1. **Parallel error state.** Store row errors in a `useState` array with one entry per row, shaped to match the row's fields (e.g. `Array<{ name?: string; type?: string }>`). For list-level errors ("at least one X required"), use a separate `useState<string | null>`.
2. **Populate errors before returning `false`.** The step's `validate` closure must set the error state arrays before returning — otherwise the Wizard blocks advance but no errors are visible.
3. **Render errors via shared components where possible.** `TextInput` and `Select` accept an `error` prop and render the error `<p>` with `data-testid={testId}-error`. For raw `<input>` elements not using shared components, render a `<p>` inline with `text-red-400 text-sm mt-1` classes.
4. **Clear errors on field change.** When a row field changes, clear that field's error entry — mirrors `useForm.setField` auto-clear. When a row is added or removed, update the error array accordingly (append `{}` on add, splice on remove).
5. **Register all testIds.** Every error element needs a `data-testid` registered in `src/shared/testIds.ts`, following the `{field-testid}-error` convention.

**Reference implementations:**

- `src/pages/projects/ProjectForm.tsx` Step 3 (Environments) — `envErrors` + `envListError` state.
- `src/pages/testplans/TestPlanForm.tsx` Step 2 (Test Cases) — `testCaseErrors` + `stepErrors` + `testCaseListError` state.

---

## 9b. Test ID Registry (`src/shared/testIds.ts`)

**All `data-testid` values MUST be imported from this file.** No raw `data-testid="..."` strings in JSX.

```js
// Static IDs — nested object by scope
export const TEST_IDS = {
  login: {
    page: "login-page",
    inputUsername: "login-input-username",
    inputPassword: "login-input-password",
    btnSubmit: "login-btn-submit",
    // ...
  },
  sidebar: {
    nav: "sidebar-nav",
    linkDashboard: "sidebar-link-dashboard",
    linkDefects: "sidebar-link-defects",
    btnLogout: "sidebar-btn-logout",
    // ...
  },
  defectList: {
    page: "defect-list-page",
    table: "defect-list-table",
    inputSearch: "defect-list-input-search",
    // ...
  },
  // ... one key per page/component scope
};

// Dynamic IDs — builder functions for per-entity test IDs
export const defectListRow = (id) => `defect-list-row-${id}`;
export const defectListCell = (column, id) =>
  `defect-list-cell-${column}-${id}`;
export const defectListBtn = (action, id) => `defect-list-btn-${action}-${id}`;
export const defectBadge = (type, id) => `defect-badge-${type}-${id}`;
// ... similar builders for other entities
```

Usage in components:

```jsx
import { TEST_IDS, defectListRow } from "../../shared/testIds";

<div data-testid={TEST_IDS.defectList.page}>
<tr data-testid={defectListRow(defect.id)}>
```

---

## 10. Styling Conventions

### Theme

- **Background**: `bg-slate-950` (body), `bg-white/5` (cards/glass)
- **Text**: `text-gray-100` (primary), `text-gray-400` (secondary), `text-gray-500` (muted)
- **Accent primary**: `neon-purple` (`#a855f7`) — actions, active states, primary buttons
- **Accent secondary**: `electric-blue` (`#3b82f6`) — links, info badges, secondary buttons
- **Error/danger**: `red-500` — delete actions, critical badges, errors
- **Success**: `emerald-500` — success badges, resolved/closed states
- **Warning**: `amber-500` — warning badges, major severity

### Custom Classes (defined in `src/index.css`)

- `.glass` — Frosted glass card: `bg-white/5 backdrop-blur-md border border-white/10 rounded-xl`
- `.btn-neon` — Base button: `px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 cursor-pointer`
- `.btn-neon-purple` — Primary button (purple glow)
- `.btn-neon-blue` — Secondary button (blue glow)
- `.input-dark` — Form input styling (dark bg, purple focus ring)

### New Classes to Add

- `.btn-neon-red` — Danger button (red glow) for destructive actions
- `.btn-neon-green` — Success button (green glow) for positive actions
- `.btn-ghost` — Transparent background, subtle hover — for toolbar/secondary actions

### Card Pattern

```jsx
<div className="glass p-6">{/* card content */}</div>
```

### Page Layout Pattern

```jsx
export default function SomePage() {
  return (
    <div data-testid="some-page">
      <PageHeader title="Page Title" actions={<button>Action</button>} />
      <div className="space-y-6">{/* page content */}</div>
    </div>
  );
}
```

---

## 11. Sidebar Navigation Structure

The sidebar renders menu items based on the current user's role.

```js
const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["tester", "qa_lead", "admin"],
  },
  {
    key: "projects",
    label: "Projects",
    icon: FolderKanban,
    path: "/projects",
    roles: ["tester", "qa_lead", "admin"],
  },
  {
    key: "defects",
    label: "Defects",
    icon: Bug,
    path: "/defects",
    roles: ["tester", "qa_lead", "admin"],
  },
  {
    key: "test-plans",
    label: "Test Plans",
    icon: ClipboardList,
    path: "/test-plans",
    roles: ["tester", "qa_lead", "admin"],
  },
  {
    key: "team",
    label: "Team",
    icon: Users,
    path: "/team",
    roles: ["tester", "qa_lead", "admin"],
  },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
    roles: ["qa_lead", "admin"],
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ["admin"],
  },
];
```

---

## 12. Permission Checks (`src/utils/permissions.ts`)

`workflow.ts` is the **single source of truth** for defect transition permissions. `permissions.ts` must delegate to it — never re-list defect transition roles.

```js
import { getAvailableTransitions } from "./workflow";

// Central permission definitions
const PERMISSIONS = {
  "defect:create":       ["tester", "qa_lead", "admin"],
  // Defect assignment/transition permissions live in workflow.ts — delegate, don't duplicate
  "defect:assign":       (role) => getAvailableTransitions("new", role).some(t => t.action === "assign"),
  "defect:transition":   (role, status) => getAvailableTransitions(status, role).length > 0,
  "project:create":      ["qa_lead", "admin"],
  "project:edit":        ["qa_lead", "admin"],
  "project:delete":      ["admin"],
  "testplan:create":     ["qa_lead", "admin"],
  "testplan:execute":    ["tester", "qa_lead", "admin"],
  "user:manage":         ["admin"],
  "settings:manage":     ["admin"],
  "reports:view":        ["qa_lead", "admin"],
};

// Usage
hasPermission(userRole, "defect:assign") → boolean
hasPermission(userRole, "defect:transition", currentStatus) → boolean
```

Role-gated UI elements: **hide the element entirely** (do not render), don't just disable it. This forces test automation to handle presence/absence checks.

---

## 13. Error Handling

- **Form validation**: Inline errors below each field. Show on blur + on submit attempt. Use `useForm` hook.
- **Not found**: Use `<EmptyState variant="not-found" />` in the page area (not a separate 404 page).
- **Permission denied**: Use `<EmptyState variant="permission-denied" />` with back button. `ProtectedRoute` renders this automatically for role-gated routes.
- **Empty results**: Use `<EmptyState variant="no-results" />` — DataTable uses this internally via `emptyMessage` prop.
- **Toast notifications**: Success on create/update/delete. Error on failed validation or operation.

Do NOT build separate NotFound or PermissionDenied components — `EmptyState` handles all cases.

Do NOT add try/catch around localStorage operations. Do NOT add loading spinners (there's no async data fetching).

---

## 14. Seed Data Requirements

Seed data must be rich enough to demonstrate all features:

- **3 users** (one per role) — as defined in section 6
- **3 projects** in different statuses (active, active, planning)
- **12-15 defects** spread across projects, in various lifecycle states (some new, some assigned, some resolved, etc.), with comments and history entries
- **3-4 test plans** with 4-6 test cases each, in different statuses
- **2-3 test runs** with mixed pass/fail results
- **Realistic but humorous data** — keep the quirky QA theme from the original app

Seed data is loaded on first visit (no data in localStorage) and on explicit reset.

---

## 15. Import Conventions

```jsx
// 1. React / library imports
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 2. Icons
import { Bug, Plus, Search } from "lucide-react";

// 3. Contexts / hooks
import { useAuth } from "../../hooks/useAuth";
import { useDefects } from "../../hooks/useDefects";

// 4. Components
import DataTable from "../../components/data/DataTable";
import Modal from "../../components/feedback/Modal";
import StatusBadge from "../../components/feedback/StatusBadge";

// 5. Utils
import { hasPermission } from "../../utils/permissions";
```

---

## 16. Things NOT To Do

- ✅ DO use TypeScript — `.ts`/`.tsx` everywhere. `strict: true` in `tsconfig.json`. No `any` except at well-justified boundaries (e.g. JSON parse before validation).
- ❌ Do NOT add PropTypes — TypeScript handles this
- ❌ Do NOT use `// @ts-ignore` or `// @ts-expect-error` to silence errors — fix the type instead
- ✅ DO add unit tests for **pure logic only** (see §17) — the app's UI is a Playwright target, but regressions in workflow/permissions/useForm/store break the demo
- ❌ Do NOT add comments explaining what code does — keep code self-documenting
- ❌ Do NOT add `console.log` statements
- ❌ Do NOT add real API calls or `fetch` — everything is localStorage
- ❌ Do NOT add loading states or skeleton screens — data is synchronous
- ❌ Do NOT use `index` as `key` in lists — always use entity `id`
- ❌ Do NOT add external CSS files per component — use Tailwind utilities + `index.css` classes
- ❌ Do NOT add environment variables — the app has no configuration

---

## 16b. TypeScript Strategy

The entity enums and cross-entity references in §7 make TS earn its keep. Strict mode is non-negotiable.

### `tsconfig.json` requirements

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Where types live

**`src/data/entities.ts`** is the single source of truth for all entity types and enums:

```ts
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
// ... etc.

export interface Defect {
  id: number;
  projectId: number;
  title: string;
  // ... full schema from §7
}

export interface Project {
  /* ... */
}
export interface TestPlan {
  /* ... */
}
export interface TestRun {
  /* ... */
}
export interface User {
  /* ... */
}
```

Pages and hooks `import type { Defect } from "../../data/entities"`.

### Generic conventions

- `useForm<T extends Record<string, unknown>>(initial: T, validate: (v: T) => Partial<Record<keyof T, string>>)` — form values fully typed per usage.
- `useStore<T extends { id: number }>(key: string)` — entity CRUD returns typed arrays.
- `store.ts` signatures: `getAll<T>(key: string): T[]`, `create<T>(key: string, data: Omit<T, "id" | "createdAt">): T`, etc.

### Permission key typing

Permission keys are a string literal union — callers get autocomplete and typos become compile errors:

```ts
export type PermissionKey =
  | "defect:create"
  | "defect:assign"
  | "defect:transition"
  | "project:create";
// ...

export function hasPermission(
  role: Role,
  key: PermissionKey,
  status?: DefectStatus,
): boolean;
```

### Component props

One `Props` interface per component, defined in the same file, exported only if consumed elsewhere.

```tsx
interface DataTableProps<T extends { id: number }> {
  columns: Array<Column<T>>;
  data: T[];
  onRowClick?: (row: T) => void;
  // ...
}

export default function DataTable<T extends { id: number }>(
  props: DataTableProps<T>,
) {
  /* ... */
}
```

### No runtime type validation

This is a training app with seed data we control — do **not** add Zod/Yup/io-ts. Trust the types. The only validation is form validation (user input), handled by `useForm`.

---

## 17. Unit Testing Strategy

Unit tests protect the load-bearing logic from regressions during ongoing development. They are **not** a substitute for the Playwright tests students will write against the UI — they exist so we don't ship a broken defect workflow to a live training session.

### Tool

**Vitest** — zero-config with Vite, no additional runtime deps beyond `vitest` as a devDependency.

```bash
npm install --save-dev vitest
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

### What to test

Only **pure logic modules**. These are small, deterministic, and regression-prone:

| Module                     | What to cover                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/utils/workflow.ts`    | Every transition in the state machine table (§8); role gating for each; invalid transitions rejected      |
| `src/utils/permissions.ts` | Each permission key against each role; correct delegation to `workflow.ts` for defect transitions         |
| `src/hooks/useForm.ts`     | setField updates, validate() populates errors, touched tracking, reset, handleSubmit blocks on invalid    |
| `src/data/store.ts`        | create/update/remove/getById round-trips; reset restores seed; id auto-increment                          |
| `src/data/seed.ts`         | Shape validation: required fields present, referenced IDs exist (e.g. defect.projectId matches a project) |

### What NOT to test

- ❌ React components (DataTable, Modal, Wizard, forms, pages) — Playwright owns this
- ❌ Routing — Playwright owns this
- ❌ Styling / Tailwind classes
- ❌ Toast behavior, modal animations, visual state
- ❌ Integration between hook + page — that's the training app's own behavior, tested via Playwright

### File layout

Colocated next to the source file:

```
src/utils/workflow.ts
src/utils/workflow.test.ts
src/utils/permissions.ts
src/utils/permissions.test.ts
src/hooks/useForm.ts
src/hooks/useForm.test.ts
src/data/store.ts
src/data/store.test.ts
src/data/seed.test.ts
```

### Conventions

- Use `describe` blocks per function, `it` per scenario.
- Mock `localStorage` via `vi.stubGlobal` or a minimal in-memory mock for `store.test.ts`. Do NOT hit real localStorage in tests.
- For `useForm`, use `@testing-library/react`'s `renderHook` **only if** it's already available — otherwise test the hook logic by extracting pure functions. Prefer the latter to avoid a new devDep.
- Keep tests terse. No setup helpers, no shared fixtures across files. Each test is self-contained.
- Tests should run in under 2 seconds total.

### When to add a test

- Adding a new workflow transition → add test in the same commit.
- Adding a new permission key → add test in the same commit.
- Fixing a bug in any of the listed modules → add a regression test for the bug.

### When NOT to add a test

- Adding a new page, component, or form layout.
- Changing styling, copy, or test IDs.
- Adding seed data entries (unless the seed structure changes).
