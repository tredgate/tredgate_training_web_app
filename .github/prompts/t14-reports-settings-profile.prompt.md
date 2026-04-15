# Task 14 — Reports, Settings & Profile Pages

> **Layer**: 3 (Pages) · **Depends on**: T2 (layout), T3 (DataTable), T4 (Modal), T6 (Tabs), T7 (form components, StatusBadge, StatCard), T8 (all entity hooks) · **Parallelizable** with T9-T13

## Objective

Build three remaining pages: Reports (tabbed analytics view), Settings (admin-only data management), and Profile (current user's own profile). These are the final pages needed for the complete ~18-page app.

## Constraints

- Follow architecture §10 (page layout), §12 (permissions).
- Reports: all roles can view, but data scope varies by role (same pattern as Dashboard).
- Settings: admin-only. Redirect or show unauthorized message for other roles.
- Profile: all roles can view/edit their own profile.
- No chart libraries — display data in tables, stat cards, and lists.
- All `data-testid` from `src/shared/testIds.ts`. Extend the registry.

## Files to Create

### 1. `src/pages/reports/Reports.tsx`

#### Layout

```
PageHeader: "Reports"
  actions: none

Tabs: Defect Trends | Test Coverage | Team Workload
```

#### Defect Trends Tab

Summary of defect data across the system (scoped by role).

**Filter bar** at top:

- Project filter (Select — "All Projects" + project list)
- Date range: From (DatePicker) and To (DatePicker)
- `data-testid="reports-filter-project"`, `data-testid="reports-filter-date-from"`, `data-testid="reports-filter-date-to"`.

**Stats row** (4 StatCards):

- Total Defects (in filter scope)
- Open Defects (status not closed/verified)
- Critical Defects (severity: critical)
- Average Time to Resolve (calculate from history timestamps — difference between "new" and "resolved" entries, or show "N/A" if no resolved defects)

`data-testid="reports-defect-stats"`.

**Defects by Severity** table:
| Severity | Count | % of Total |
|----------|-------|-----------|
| Critical | 2 | 20% |
| Major | 4 | 40% |
| Minor | 3 | 30% |
| Trivial | 1 | 10% |

`data-testid="reports-severity-table"`.

**Defects by Status** table:
| Status | Count | % of Total |
|--------|-------|-----------|

`data-testid="reports-status-table"`.

**Defects by Project** table:
| Project | Total | Open | Resolved | Closed |
|---------|-------|------|----------|--------|

`data-testid="reports-project-table"`.

#### Test Coverage Tab

**Stats row** (3 StatCards):

- Total Test Plans
- Total Test Cases (across all plans)
- Overall Pass Rate (from completed test runs)

`data-testid="reports-coverage-stats"`.

**Test Plans Summary** table:
| Plan Name | Project | Cases | Runs | Last Run Status | Pass Rate |
|-----------|---------|-------|------|-----------------|-----------|

`data-testid="reports-plans-table"`.

Pass rate per plan: look at the latest completed test run for each plan.

#### Team Workload Tab

**Team Members Summary** table:
| Name | Role | Assigned Defects | Reported Defects | Test Runs Executed | Open Items |
|------|------|-----------------|-----------------|-------------------|-----------|

`data-testid="reports-workload-table"`.

**Top Reporters** — top 5 users by defects reported (small list).
`data-testid="reports-top-reporters"`.

**Top Executors** — top 5 users by test runs executed.
`data-testid="reports-top-executors"`.

### 2. `src/pages/settings/Settings.tsx`

Admin-only page. Route: `/settings`.

#### Access guard

```tsx
const { user } = useAuth();
if (user.role !== "admin") {
  return <EmptyState variant="unauthorized" message="Admin access required" />;
}
```

#### Layout

```
PageHeader: "Settings"

Cards for each action group
```

#### Data Management Card (glass)

- **Reset to Seed Data** button: Clears all localStorage `tqh_*` keys and reloads the page. This re-triggers seed initialization.
  - Confirm with a Modal: "This will reset all data to the initial seed state. This cannot be undone."
  - `data-testid="settings-btn-reset"`.

- **Clear All Data** button: Clears all localStorage `tqh_*` keys WITHOUT re-seeding. Page reload will create fresh seed.
  - Confirm with a Modal.
  - `data-testid="settings-btn-clear"`.

- **Export Data** button: Creates a JSON blob of all `tqh_*` localStorage entries and triggers a download as `tqh-export-{timestamp}.json`.
  - `data-testid="settings-btn-export"`.

- **Import Data** button: FileUpload that accepts `.json`, parses it, validates it has expected keys, writes to localStorage, reloads page.
  - Confirm with a Modal before importing.
  - `data-testid="settings-btn-import"`.

#### System Info Card (glass)

Read-only info:

- App version (from package.json or hardcoded)
- Total localStorage usage (calculate bytes)
- Entity counts: users, projects, defects, test plans, test runs
- `data-testid="settings-system-info"`.

### 3. `src/pages/profile/Profile.tsx`

Current user's profile page. Route: `/profile`. All roles.

#### Layout

```
PageHeader: "My Profile"

Two-column:
  Left: Profile form
  Right: Activity summary
```

#### Left Column — Profile Card (glass)

- Large UserAvatar (display initials or icon)
- Full Name (TextInput — editable)
- Email (TextInput — editable)
- Role (read-only — displayed as StatusBadge)
- Username (read-only — displayed as text)

"Save Changes" button. Updates user via `useUsers().update(...)`, shows toast.
Only `fullName` and `email` are editable. Role and username are read-only.

`data-testid="profile-page"`, `data-testid="profile-input-name"`, `data-testid="profile-input-email"`, `data-testid="profile-btn-save"`.

#### Right Column — My Activity (glass)

- **My Defects**: count of defects reported by current user.
- **Assigned to Me**: count of defects assigned to current user.
- **My Test Runs**: count of test runs executed by current user.
- **My Projects**: list of project names user belongs to.
- `data-testid="profile-activity"`.

### `src/shared/testIds.ts` — Extend

```ts
reports: {
  page: "reports-page",
  filterProject: "reports-filter-project",
  filterDateFrom: "reports-filter-date-from",
  filterDateTo: "reports-filter-date-to",
  defectStats: "reports-defect-stats",
  severityTable: "reports-severity-table",
  statusTable: "reports-status-table",
  projectTable: "reports-project-table",
  coverageStats: "reports-coverage-stats",
  plansTable: "reports-plans-table",
  workloadTable: "reports-workload-table",
  topReporters: "reports-top-reporters",
  topExecutors: "reports-top-executors",
},
settings: {
  page: "settings-page",
  btnReset: "settings-btn-reset",
  btnClear: "settings-btn-clear",
  btnExport: "settings-btn-export",
  btnImport: "settings-btn-import",
  systemInfo: "settings-system-info",
},
profile: {
  page: "profile-page",
  inputName: "profile-input-name",
  inputEmail: "profile-input-email",
  btnSave: "profile-btn-save",
  activity: "profile-activity",
},
```

## Verification Checklist

### Reports

- [ ] Three tabs render: Defect Trends, Test Coverage, Team Workload
- [ ] Project filter scopes data in Defect Trends tab
- [ ] Date range filters apply to defect data
- [ ] Severity table shows correct counts and percentages
- [ ] Status table shows correct counts
- [ ] Project breakdown table shows per-project defect stats
- [ ] Test Coverage stats calculate correctly from seed data
- [ ] Plans table shows correct case/run counts
- [ ] Team Workload table shows per-user stats
- [ ] All tables have correct `data-testid`

### Settings

- [ ] Non-admin users see unauthorized EmptyState
- [ ] Admin sees all settings cards
- [ ] "Reset to Seed Data" shows confirmation modal, resets localStorage, reloads
- [ ] "Clear All Data" shows confirmation modal, clears localStorage
- [ ] "Export Data" downloads JSON file
- [ ] "Import Data" accepts JSON file with confirmation
- [ ] System Info shows entity counts and storage usage

### Profile

- [ ] Shows current user's info (name, email, role, username)
- [ ] Name and email fields are editable
- [ ] Role and username are read-only
- [ ] Save button updates user and shows toast
- [ ] Activity summary shows correct counts
- [ ] Projects list shows user's project memberships

## Do NOT

- Do not add chart libraries (Chart.js, Recharts, etc.) — tables and stat cards only
- Do not add theme switching or appearance settings
- Do not add notification preferences
- Do not add password change functionality
- Do not add data validation on import beyond checking for expected keys
- Use TypeScript (strict). No `any`, no `@ts-ignore`.
