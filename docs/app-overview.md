# Tredgate QA Hub — Application Overview

> **Purpose of this document:** reference guide for test-automation engineers writing Playwright tests against this application. Describes what the app does, who uses it, how to log in, what pages exist, and the quirks you need to know.

---

## 1. What is this app?

**Tredgate QA Hub** is a frontend-only enterprise quality-assurance platform. It simulates a complex internal tool used by testers, QA leads, and administrators to manage projects, track defects, plan and execute test runs, and oversee team activity.

The app exists specifically as the **System Under Test (SUT)** for the Tredgate test-automation training course. It is intentionally rich enough to demonstrate the core automation patterns — Component Model, Fluent Interface, Fixtures, Business Procedures, Role Polymorphism, Data Management — without the accidental complexity of a real backend.

**Key characteristics:**

- Single-page application (React 19 + react-router-dom).
- **No backend.** All data lives in the browser's `localStorage`.
- **No real security.** Login accepts the seeded credentials; there is no session expiry, no encryption, no server validation.
- **Deterministic seed data.** Every fresh browser (or after a Reset) starts from the same known state.
- **Every interactive element has a `data-testid`.** These are the stable anchors for Playwright selectors.

---

## 2. Running the app locally

```bash
npm install
npm run dev
```

The development server starts at **`http://localhost:5173`** by default.

Other useful scripts:

| Command              | Purpose                                 |
| -------------------- | --------------------------------------- |
| `npm run build`      | Production build into `dist/`           |
| `npm run preview`    | Serve the production build              |
| `npm run lint`       | ESLint                                  |
| `npm run test`       | Vitest unit tests (runs in watch mode)  |
| `npm run test -- --run` | One-shot Vitest run                  |

---

## 3. Authentication

The app opens on the **Login** page (`/login`). Only the three seeded accounts below are accepted. Any other username/password combination is rejected with an on-screen error.

### Seeded accounts

| Username | Password   | Role       | Full name    | Notes                                          |
| -------- | ---------- | ---------- | ------------ | ---------------------------------------------- |
| `tester` | `test123`  | `tester`   | Tom Tester   | Member of Project Phoenix and Project Pegasus  |
| `lead`   | `lead123`  | `qa_lead`  | Laura Lead   | Leads multiple projects; approves/rejects defects |
| `admin`  | `admin123` | `admin`    | Alex Admin   | Full system access, including Team and Settings |

**No session expiry.** A logged-in session persists in `localStorage` until the user clicks **Logout** in the sidebar, or `localStorage` is cleared.

**Redirect on unauthenticated access.** Visiting any protected URL while logged out redirects to `/login`. After login, the user lands on `/dashboard`.

---

## 4. Roles and permissions

The app enforces **role-based access control** both at the route level (via `ProtectedRoute`) and at the UI level (buttons / menu items hidden or disabled for unauthorised roles).

| Feature / Page        | Tester | QA Lead | Admin |
| --------------------- | :----: | :-----: | :---: |
| Dashboard             |   ✅   |   ✅    |  ✅   |
| Projects (list/view)  |   ✅   |   ✅    |  ✅   |
| Projects (create/edit)|   —    |   ✅    |  ✅   |
| Defects (list/view)   |   ✅   |   ✅    |  ✅   |
| Defects (create)      |   ✅   |   ✅    |  ✅   |
| Defects (edit/assign) |  own   |   ✅    |  ✅   |
| Test Plans (list/view)|   ✅   |   ✅    |  ✅   |
| Test Plans (create/edit) |  — |   ✅    |  ✅   |
| Test Run execution    |   ✅   |   ✅    |  ✅   |
| Team list             |   ✅   |   ✅    |  ✅   |
| Team member detail    |   —    |   —     |  ✅   |
| Reports               |   —    |   ✅    |  ✅   |
| Settings              |   —    |   —     |  ✅   |
| Profile (own)         |   ✅   |   ✅    |  ✅   |

Attempting to access a forbidden route renders a "denied" placeholder with `data-testid="protected-route-denied"`.

---

## 5. Application structure

### 5.1 Global layout

Every authenticated route renders within a common shell:

- **Sidebar** (left) — navigation, logout, collapse toggle.
- **Breadcrumbs** (top) — reflect the current route path.
- **Page header** — page title and optional back button.
- **Page content** — the routed page itself.
- **Footer** — version string and a **Reset Data** button (see §7).
- **Toast** — non-blocking notifications (success / error / warning).

### 5.2 Routes

| Path                              | Page                 | Access       |
| --------------------------------- | -------------------- | ------------ |
| `/login`                          | Login                | Public       |
| `/dashboard`                      | Dashboard            | All roles    |
| `/profile`                        | Profile (own)        | All roles    |
| `/projects`                       | Project list         | All roles    |
| `/projects/new`                   | Create project       | QA Lead, Admin |
| `/projects/:projectId`            | Project detail       | All roles    |
| `/projects/:projectId/edit`       | Edit project         | QA Lead, Admin |
| `/defects`                        | Defect list          | All roles    |
| `/defects/new`                    | Report defect        | All roles    |
| `/defects/:defectId`              | Defect detail        | All roles    |
| `/defects/:defectId/edit`         | Edit defect          | All roles (own if tester) |
| `/test-plans`                     | Test plan list       | All roles    |
| `/test-plans/new`                 | Create test plan     | QA Lead, Admin |
| `/test-plans/:planId`             | Test plan detail     | All roles    |
| `/test-plans/:planId/edit`        | Edit test plan       | QA Lead, Admin |
| `/test-plans/:planId/execute`     | Execute a test run   | All roles    |
| `/team`                           | Team list            | All roles    |
| `/team/:userId`                   | User detail          | Admin        |
| `/reports`                        | Reports              | QA Lead, Admin |
| `/settings`                       | Settings             | Admin        |
| `/*` (any unknown)                | 404 page             | —            |

### 5.3 Module summaries

#### Dashboard
Role-scoped overview. Shows counters (total defects, open defects, test plans, pass rate), "My Work" tables (assigned defects, recent test runs), QA-lead-only sections (unassigned defects, awaiting verification), admin-only "System Overview" cards, and a recent activity timeline.

#### Projects
CRUD-capable project registry. Each project has a lead, a member list, and one or more environments (dev / staging / production URLs). Project detail shows related defects, test plans, and members.

#### Defects
The main defect workflow. A defect has: title, description, steps to reproduce, severity (critical / major / minor / trivial), priority (P1–P4), status (see §6.2), project, reporter, assignee, environment, related test cases, a comment thread, and an audit-log history of every status transition. Status transitions follow a workflow state machine (e.g. `new → assigned → in_progress → resolved → verified → closed`).

#### Test Plans & Runs
A test plan is a named collection of test cases, each with ordered steps and an expected result. A test run is an execution of a test plan by a specific user; each test case gets a result (`not_run` / `passed` / `failed` / `blocked` / `skipped`). The `/execute` view is a wizard that walks through the cases one-by-one.

#### Team
A roster of all users. Admins can click through to a user detail page (other roles see the list only).

#### Reports
Aggregate views (charts, tables) of defects, test runs, and project health. Visible to QA Lead and Admin only.

#### Settings
System-wide configuration (system name, reset controls, etc.). Admin only.

#### Profile
Logged-in user's own profile view — read and edit their own fields.

---

## 6. Data model

### 6.1 Entities

All type definitions live in `src/data/entities.ts`.

| Entity       | Key fields                                                                            |
| ------------ | ------------------------------------------------------------------------------------- |
| `User`       | id, username, password, role, fullName, email, avatarColor, projectIds, isActive, createdAt |
| `Project`    | id, name, code, description, status, leadId, memberIds, environments[], createdAt, updatedAt |
| `Environment`| id, name, type (`dev`/`staging`/`production`), url                                    |
| `Defect`     | id, projectId, title, description, stepsToReproduce, severity, priority, status, reporterId, assigneeId, environmentId, relatedTestCaseIds, comments[], history[], createdAt, updatedAt |
| `DefectComment` | id, userId, text, createdAt                                                        |
| `DefectHistoryEntry` | id, userId, action, fromStatus, toStatus, details, timestamp                  |
| `TestCase`   | id, name, description, preconditions, steps[], priority                               |
| `TestCaseStep` | stepNumber, action, expectedResult                                                  |
| `TestPlan`   | id, projectId, name, description, status, createdById, assigneeId, testCases[], createdAt, updatedAt |
| `TestRun`    | id, testPlanId, executorId, status, results[], startedAt, completedAt                 |
| `TestRunResult` | testCaseId, status, notes, duration                                                |

### 6.2 Status vocabularies

- **Defect status:** `new`, `assigned`, `in_progress`, `resolved`, `verified`, `closed`, `rejected`, `reopened`
- **Defect severity:** `critical`, `major`, `minor`, `trivial`
- **Defect priority:** `P1`, `P2`, `P3`, `P4`
- **Project status:** `planning`, `active`, `archived`
- **Test plan status:** `draft`, `active`, `completed`, `archived`
- **Test case priority:** `high`, `medium`, `low`
- **Test run result:** `not_run`, `passed`, `failed`, `blocked`, `skipped`
- **Environment type:** `dev`, `staging`, `production`

---

## 7. Data persistence and reset

### 7.1 localStorage keys

All entity collections are serialised as JSON arrays under these keys (prefix `tqh_` = Tredgate QA Hub):

| Key               | Contents        |
| ----------------- | --------------- |
| `tqh_users`       | `User[]`        |
| `tqh_projects`    | `Project[]`     |
| `tqh_defects`     | `Defect[]`      |
| `tqh_test_plans`  | `TestPlan[]`    |
| `tqh_test_runs`   | `TestRun[]`     |

The auth session state is stored separately (under its own key used by the `AuthContext`).

### 7.2 Seeding

On application start, if any of the five keys is missing from `localStorage`, the seed data in `src/data/seed.ts` is written. If all keys exist, seeding is skipped — the existing data is used.

**Current seed snapshot:**

- 3 users (see §3)
- 3 projects (Phoenix, plus others)
- 14 defects (mix of statuses, severities, priorities)
- 3 test plans
- 2 test runs

### 7.3 Reset behaviour

The **Reset Data** button in the footer (`data-testid="footer-btn-reset"`) wipes all five `tqh_*` keys from `localStorage` and reloads the page, which re-triggers seeding. This is the recommended way to return to a known state between tests — but for automated tests, clearing `localStorage` directly from Playwright is faster and avoids the reload flash.

---

## 8. Testability

### 8.1 `data-testid` conventions

Every interactive element — inputs, buttons, rows, cells, tabs, modals, toasts, navigation links — carries a `data-testid` attribute. **These are the stable selector anchors for Playwright.** Prefer `getByTestId()` over CSS or text-based selectors.

### 8.2 Test ID registry

All IDs used in the app are defined centrally in **[`src/shared/testIds.ts`](../src/shared/testIds.ts)**. Helper functions like `dataTableRow(prefix, id)` and `dataTableCell(prefix, id, columnKey)` build composite IDs for repeated elements (rows, cells, timeline entries).

If you are writing Page Objects, you can mirror this structure and import the same string constants if you prefer — or hard-code the strings on the test side if you want the test suite independent of the SUT's internals.

### 8.3 ID format

IDs follow a predictable shape: `<module>-<element>` or `<module>-<element>-<modifier>`, all kebab-case. Examples:

- `login-input-username`
- `sidebar-link-defects`
- `dashboard-card-open-defects`
- `defect-detail-tab-comments`
- `footer-btn-reset`

### 8.4 i18n

All user-facing strings live in `src/i18n/en.ts` (single-language for now). If you write text-based assertions, prefer the exact strings from that file so a future locale change does not break every test at once.

---

## 9. Quirks and gotchas

- **Client-side routing.** Use `page.goto("/defects")` etc. — there is no server-rendered fallback, so hitting unknown paths renders the in-app 404 component (not a browser error page).
- **Seed data rules.** Once `localStorage` is populated, the seed will not run again. If you change `seed.ts` and refresh, you will still see the old data until you click Reset (or clear storage).
- **Role-hidden UI.** Buttons for forbidden actions are not disabled — they are **not rendered at all**. A tester account will not see a "New Project" button, so testing the negative case means checking *absence*, not *disabled state*.
- **Timestamps are ISO strings.** All `createdAt`, `updatedAt`, `timestamp` fields are ISO-8601 strings serialised into JSON. Parse them when comparing dates.
- **IDs are numeric and auto-incremented.** Store helpers assign a new `id` as `max(existing) + 1`. Tests that rely on specific IDs should reset data first.
- **No real network.** There are no XHR / fetch calls to intercept. If your test framework expects a network waterfall, there is nothing to wait for beyond React rendering.

---

## 10. Source-of-truth references

When this document drifts from reality, the code wins. Cross-check against:

- `src/data/entities.ts` — entity types and status enums
- `src/data/seed.ts` — current seed data
- `src/main.tsx` — router definition (all routes)
- `src/shared/testIds.ts` — every `data-testid` used in the app
- `src/i18n/en.ts` — all user-facing strings
- `.github/instructions/architecture.instructions.md` — developer-facing conventions (for deeper dives)
