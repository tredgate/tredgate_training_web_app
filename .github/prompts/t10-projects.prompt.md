# Task 10 — Projects Module (List + Detail + Form)

> **Layer**: 3 (Pages) · **Depends on**: T2 (layout), T3 (DataTable), T4 (Modal, EmptyState), T5 (Wizard), T6 (Tabs), T7 (form components, StatusBadge, UserAvatar), T8 (useProjects, useUsers, useDefects, useTestPlans) · **Parallelizable** with T9, T11-T14

## Objective

Build the full Projects module: list page with DataTable, detail page with tabbed view, and create/edit wizard form. Projects are the top-level organizational entity — defects, test plans, and team members are scoped to projects.

## Constraints

- Follow architecture §5 (routing), §9 (component APIs), §10 (page layout), §12 (permissions).
- `project:create` and `project:edit` require `qa_lead` or `admin`. `project:delete` requires `admin`. All roles can view.
- All `data-testid` from `src/shared/testIds.ts`. Extend the registry.
- Use `useForm` hook for all form state in the wizard steps.

## Files to Create

### 1. `src/pages/projects/ProjectList.tsx`

Replace the T2 placeholder.

#### Layout

```
PageHeader: "Projects"
  actions: { hasPermission("project:create") && <Link to="/projects/new">New Project</Link> }

DataTable with project data
```

#### DataTable Configuration

```tsx
<DataTable
  columns={[
    { key: "code", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "status", label: "Status", sortable: true,
      render: (val) => <StatusBadge type="project_status" value={val} /> },
    { key: "leadId", label: "Lead", sortable: false,
      render: (val) => <UserAvatar ... /> },
    { key: "memberIds", label: "Members", sortable: false,
      render: (val) => `${val.length} members` },
    { key: "updatedAt", label: "Last Updated", sortable: true,
      render: (val) => formatDate(val) },
  ]}
  data={projects}
  searchable
  searchPlaceholder="Search projects..."
  filters={[
    { key: "status", label: "Status", options: PROJECT_STATUSES },
  ]}
  pagination
  pageSize={10}
  onRowClick={(row) => navigate(`/projects/${row.id}`)}
  emptyMessage="No projects found"
  testIdPrefix="project-list"
/>
```

`data-testid="project-list-page"`, button `data-testid="project-list-btn-new"`.

### 2. `src/pages/projects/ProjectDetail.tsx`

Replace the T2 placeholder.

#### Layout

```
PageHeader: "{project.name}" with subtitle "{project.code}"
  backTo: "/projects"
  actions: {
    hasPermission("project:edit") && <Link to={`/projects/${id}/edit`}>Edit</Link>
    hasPermission("project:delete") && <button onClick={confirmDelete}>Delete</button>
  }

Tabs: Overview | Defects | Test Plans | Team
```

#### Overview Tab

- **Project Info** card (glass): Status badge, description, created/updated dates.
- **Environments** card: Table of project environments (name, type, URL). `data-testid="project-detail-env-table"`.
- **Quick Stats**: Defect count, test plan count, team size — small inline stats.

#### Defects Tab

DataTable of defects filtered by `projectId`. Same columns as DefectList (T11) but scoped. Row click → `/defects/{id}`.
Badge on tab: defect count.
`data-testid="project-detail-defects-table"`.

#### Test Plans Tab

DataTable of test plans filtered by `projectId`. Columns: Name, Status (badge), Test Cases count, Last Updated.
Badge on tab: test plan count.
`data-testid="project-detail-plans-table"`.

#### Team Tab

List of team members assigned to the project. Show `UserAvatar`, fullName, role badge, email.
Badge on tab: member count.
`data-testid="project-detail-team-list"`.

#### Delete confirmation

Use `Modal` component:

```tsx
<Modal
  data-testid="modal-confirm-delete-project"
  title="Delete Project"
  size="sm"
>
  <p>Are you sure you want to delete "{project.name}"?</p>
  <footer>
    <button className="btn-ghost" onClick={close}>
      Cancel
    </button>
    <button className="btn-neon-red" onClick={handleDelete}>
      Delete
    </button>
  </footer>
</Modal>
```

On delete: remove project, show toast, navigate to `/projects`.

#### Not found

If `projectId` from URL params doesn't match any project, render `<EmptyState variant="not-found" />`.

### 3. `src/pages/projects/ProjectForm.tsx`

Replace the T2 placeholder. Used for both create and edit (detect via `useParams` — if `projectId` present, it's edit mode).

#### Wizard Steps

**Step 1: Basic Info**

- Project Name (TextInput, required)
- Project Code (TextInput, required, uppercase, max 10 chars)
- Description (TextArea, required)
- Status (Select: planning/active/archived — default "planning" for new)

Validation: name, code, description required. Code must be uppercase letters only.

**Step 2: Team Assignment**

- QA Lead (Select from users with role `qa_lead` or `admin`)
- Team Members (MultiSelect from all users)

Validation: lead required.

**Step 3: Environments**

- List of environments with add/remove. Each environment: Name (TextInput), Type (Select: dev/staging/production), URL (TextInput).
- "Add Environment" button adds an empty row.
- Remove button (×) on each row.

Validation: at least 1 environment, each must have name and type.

**Step 4: Review**

- Read-only summary of all fields entered. Displayed in a structured layout (not a form).
- "Submit" button on wizard calls `onComplete`.

#### Form state

Use `useForm` for the flat fields (name, code, description, status, leadId). Manage environments as a separate `useState` array (useForm doesn't support field arrays).

#### Create vs Edit

- **Create** (`/projects/new`): Empty initial values. `onComplete` calls `useProjects().create(...)`.
- **Edit** (`/projects/:projectId/edit`): Pre-fill form from existing project. `onComplete` calls `useProjects().update(...)`.
- After submit: toast notification, navigate to `/projects/{id}`.
- If edit and project not found: `<EmptyState variant="not-found" />`.

`testIdPrefix="project-form"` for all wizard/form test IDs.

### `src/shared/testIds.ts` — Extend

```ts
projectList: {
  page: "project-list-page",
  btnNew: "project-list-btn-new",
},
projectDetail: {
  page: "project-detail-page",
  btnEdit: "project-detail-btn-edit",
  btnDelete: "project-detail-btn-delete",
  envTable: "project-detail-env-table",
  defectsTable: "project-detail-defects-table",
  plansTable: "project-detail-plans-table",
  teamList: "project-detail-team-list",
},
projectForm: {
  page: "project-form-page",
  inputName: "project-form-input-name",
  inputCode: "project-form-input-code",
  inputDescription: "project-form-input-description",
  selectStatus: "project-form-select-status",
  selectLead: "project-form-select-lead",
  selectMembers: "project-form-select-members",
  btnAddEnv: "project-form-btn-add-env",
},
// Dynamic builders:
export const projectFormEnvRow = (index: number): string =>
  `project-form-env-row-${index}`;
export const projectFormEnvRemove = (index: number): string =>
  `project-form-btn-remove-env-${index}`;
```

## Verification Checklist

### ProjectList

- [ ] Renders DataTable with all projects from seed data
- [ ] Search filters projects by name/code
- [ ] Status filter works
- [ ] Row click navigates to `/projects/{id}`
- [ ] "New Project" button visible for qa_lead/admin, absent for tester
- [ ] StatusBadge renders correctly for each project status

### ProjectDetail

- [ ] Shows project info with correct name, code, status
- [ ] Back button navigates to `/projects`
- [ ] Tabs switch between Overview, Defects, Test Plans, Team
- [ ] Tab badges show correct counts
- [ ] Defects tab shows only defects for this project
- [ ] Test Plans tab shows only plans for this project
- [ ] Team tab shows assigned members with avatars
- [ ] Edit button visible for qa_lead/admin, absent for tester
- [ ] Delete button visible for admin only
- [ ] Delete modal confirms before deleting
- [ ] Non-existent project ID shows EmptyState not-found

### ProjectForm

- [ ] Create mode: form starts empty, wizard has 4 steps
- [ ] Edit mode: form pre-fills from existing project
- [ ] Step 1 validation: required fields enforced
- [ ] Step 2: Lead select populated with qa_lead/admin users
- [ ] Step 3: Can add/remove environments
- [ ] Step 4: Review shows all entered data
- [ ] Submit creates/updates project and navigates to detail
- [ ] Cancel navigates back without saving

## Do NOT

- Do not add drag-and-drop for team member ordering
- Do not add project archiving workflow (just a status change)
- Do not add project duplication feature
- Use TypeScript (strict). No `any`, no `@ts-ignore`.
