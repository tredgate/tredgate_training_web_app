# Task 11 — Defects Module (List + Detail + Form)

> **Layer**: 3 (Pages) · **Depends on**: T2 (layout), T3 (DataTable), T4 (Modal, EmptyState), T5 (Wizard), T7 (form components, StatusBadge, ActivityTimeline, UserAvatar), T8 (useDefects, useProjects, useUsers) · **Parallelizable** with T9, T10, T12-T14

## Objective

Build the full Defects module: list page with advanced DataTable, detail page with workflow transitions and comments, and create/edit wizard form. This is the most complex module — the defect lifecycle workflow is the primary test automation target for Business Procedures and Role Polymorphism patterns.

## Constraints

- Follow architecture §8 (workflow state machine), §9 (component APIs), §12 (permissions — hide, don't disable).
- Workflow transitions are role-gated via `workflow.ts`. Available transition buttons differ by role and current defect status.
- `defect:create` allowed for all roles. Workflow transitions per §8 table.
- All `data-testid` from `src/shared/testIds.ts`. Extend the registry.
- Use `useForm` hook for all form state. Use `useDefects` hook for all data access.

## Files to Create

### 1. `src/pages/defects/DefectList.tsx`

Replace the T2 placeholder.

#### Layout

```
PageHeader: "Defects"
  actions: { <Link to="/defects/new">Report Defect</Link> }
  // All roles can report defects

DataTable with defect data
```

#### DataTable Configuration

```tsx
<DataTable
  columns={[
    { key: "id", label: "ID", sortable: true,
      render: (val) => `#${val}` },
    { key: "title", label: "Title", sortable: true },
    { key: "projectId", label: "Project", sortable: true,
      render: (val) => projectName(val) },
    { key: "severity", label: "Severity", sortable: true,
      render: (val, row) => <StatusBadge type="severity" value={val} data-testid={defectBadge("severity", row.id)} /> },
    { key: "priority", label: "Priority", sortable: true,
      render: (val, row) => <StatusBadge type="priority" value={val} data-testid={defectBadge("priority", row.id)} /> },
    { key: "status", label: "Status", sortable: true,
      render: (val, row) => <StatusBadge type="status" value={val} data-testid={defectBadge("status", row.id)} /> },
    { key: "assigneeId", label: "Assignee", sortable: false,
      render: (val) => val ? <UserAvatar ... /> : <span className="text-gray-500">Unassigned</span> },
    { key: "updatedAt", label: "Updated", sortable: true,
      render: (val) => formatDate(val) },
  ]}
  data={defects}
  searchable
  searchPlaceholder="Search defects..."
  filters={[
    { key: "severity", label: "Severity", options: DEFECT_SEVERITIES },
    { key: "status", label: "Status", options: DEFECT_STATUSES },
    { key: "priority", label: "Priority", options: DEFECT_PRIORITIES },
    { key: "projectId", label: "Project", options: projectOptions },
  ]}
  pagination
  pageSize={10}
  onRowClick={(row) => navigate(`/defects/${row.id}`)}
  emptyMessage="No defects found"
  testIdPrefix="defect-list"
/>
```

Note: The `projectId` filter needs project names as labels. Build `options` from `useProjects().projects`.

`data-testid="defect-list-page"`, button `data-testid="defect-list-btn-new"`.

### 2. `src/pages/defects/DefectDetail.tsx`

Replace the T2 placeholder. The most complex page in the app.

#### Layout

```
PageHeader: "#{defect.id} — {defect.title}"
  backTo: "/defects"
  actions: {
    // Workflow transition buttons — dynamic per status + role
    transitions.map(t => <button onClick={() => handleTransition(t.action)}>{t.label}</button>)
    // Edit button (if status is editable)
    hasPermission("defect:create") && defect.status !== "closed" &&
      <Link to={`/defects/${id}/edit`}>Edit</Link>
  }

Two-column layout:
  Left (2/3): Detail info + Comments
  Right (1/3): Sidebar info cards
```

#### Transition Buttons

These are the core test automation target. Buttons ONLY appear when the transition is available for the current user's role + defect status.

```tsx
const transitions = useDefects().getTransitions(defect);
// e.g., for a QA Lead viewing a "new" defect: [{ action: "assign", label: "Assign", targetStatus: "assigned" }]

{
  transitions.map((t) => (
    <button
      key={t.action}
      data-testid={`defect-detail-btn-${t.action}`}
      className={transitionButtonClass(t.action)} // assign/start → btn-neon-blue, resolve → btn-neon-green, reject → btn-neon-red, etc.
      onClick={() => handleTransition(t)}
    >
      {t.label}
    </button>
  ));
}
```

Button colors:

- `assign`, `start` → `btn-neon-blue`
- `resolve`, `verify`, `close` → `btn-neon-green`
- `reject` → `btn-neon-red`
- `reopen` → `btn-neon-purple`

**Assign modal**: When clicking "Assign", show a `Modal` with a `Select` to pick the assignee (team members of the project). `data-testid="modal-assign-defect"`, `data-testid="modal-assign-select-assignee"`.

#### Left Column: Detail Info

**Description section** (glass card):

- Title (h2), Description (paragraph), Steps to Reproduce (paragraph or `<pre>`).
- `data-testid="defect-detail-description"`.

**Comments section** (glass card):

- List existing comments with user avatar, name, timestamp, text.
- "Add Comment" form at bottom: TextArea + Submit button.
- `data-testid="defect-detail-comments"`, `data-testid="defect-detail-input-comment"`, `data-testid="defect-detail-btn-add-comment"`.

#### Right Column: Sidebar

**Status card** (glass):

- Current status (large StatusBadge)
- Severity, Priority (StatusBadge each)
- `data-testid="defect-detail-card-status"`.

**Assignment card** (glass):

- Reporter: UserAvatar + name
- Assignee: UserAvatar + name (or "Unassigned")
- `data-testid="defect-detail-card-assignment"`.

**Details card** (glass):

- Project name (link to project detail)
- Environment name
- Related test cases (list or count)
- Created date, Updated date
- `data-testid="defect-detail-card-details"`.

**History timeline** (glass):

- `ActivityTimeline` with all history entries for this defect.
- `data-testid="defect-detail-timeline"`.

#### Not found

If `defectId` from URL params doesn't match, render `<EmptyState variant="not-found" />`.

### 3. `src/pages/defects/DefectForm.tsx`

Replace the T2 placeholder. Used for both create and edit.

#### Wizard Steps

**Step 1: Basic Info**

- Title (TextInput, required)
- Project (Select from projects, required)
- Severity (Select: critical/major/minor/trivial, required)
- Priority (Select: P1/P2/P3/P4, required)

Validation: all required.

**Step 2: Details**

- Description (TextArea, required)
- Steps to Reproduce (TextArea, required)
- Environment (Select from selected project's environments — dynamic, updates when project changes)

Validation: description and stepsToReproduce required.

**Step 3: Assignment & Links**

- Assignee (Select from project members — optional, can be assigned later via workflow)
- Related Test Cases (MultiSelect from test cases in project's test plans — optional)

No required validation on this step.

**Step 4: Review**

- Read-only summary of all fields. Show StatusBadge for severity/priority.
- Submit creates/updates defect.

#### Create vs Edit

- **Create**: Auto-set `reporterId` to current user, `status: "new"`, add initial history entry.
- **Edit**: Pre-fill all fields. Cannot change `reporterId`.
- After submit: toast, navigate to `/defects/{id}`.

`testIdPrefix="defect-form"`.

### `src/shared/testIds.ts` — Extend

```ts
defectList: {
  page: "defect-list-page",
  btnNew: "defect-list-btn-new",
},
defectDetail: {
  page: "defect-detail-page",
  btnEdit: "defect-detail-btn-edit",
  description: "defect-detail-description",
  comments: "defect-detail-comments",
  inputComment: "defect-detail-input-comment",
  btnAddComment: "defect-detail-btn-add-comment",
  cardStatus: "defect-detail-card-status",
  cardAssignment: "defect-detail-card-assignment",
  cardDetails: "defect-detail-card-details",
  timeline: "defect-detail-timeline",
},
defectForm: {
  page: "defect-form-page",
  inputTitle: "defect-form-input-title",
  selectProject: "defect-form-select-project",
  selectSeverity: "defect-form-select-severity",
  selectPriority: "defect-form-select-priority",
  inputDescription: "defect-form-input-description",
  inputSteps: "defect-form-input-steps",
  selectEnvironment: "defect-form-select-environment",
  selectAssignee: "defect-form-select-assignee",
  selectTestCases: "defect-form-select-test-cases",
},

// Dynamic builders:
export const defectDetailBtn = (action: string): string =>
  `defect-detail-btn-${action}`;
export const defectCommentEntry = (commentId: number): string =>
  `defect-detail-comment-${commentId}`;
```

## Verification Checklist

### DefectList

- [ ] DataTable renders all seed defects
- [ ] Search filters by title (case-insensitive)
- [ ] Severity, status, priority, project filters work (AND-combined)
- [ ] StatusBadge renders with correct colors for each severity/status/priority
- [ ] Row click navigates to `/defects/{id}`
- [ ] "Report Defect" button visible for all roles
- [ ] Pagination works with seed data

### DefectDetail

- [ ] Shows correct defect info (title, description, steps, status, severity, priority)
- [ ] Transition buttons match current user role + defect status:
  - Tester viewing "assigned" defect assigned to them: "Start Work" button
  - QA Lead viewing "new" defect: "Assign" button
  - QA Lead viewing "resolved" defect: "Verify" button
  - Admin viewing "verified" defect: "Close" button
  - Tester viewing "new" defect: NO transition buttons
- [ ] "Assign" button opens modal with assignee selector
- [ ] Clicking a transition button changes status, updates history, shows toast
- [ ] Comments list renders existing comments
- [ ] Adding a comment appends to list and shows toast
- [ ] History timeline shows all state transitions
- [ ] Non-existent defect ID shows EmptyState not-found
- [ ] Edit button navigates to edit form

### DefectForm

- [ ] Create mode: empty form, 4-step wizard
- [ ] Edit mode: pre-filled from existing defect
- [ ] Step 1 validation enforces required fields
- [ ] Step 2 environment select updates when project selection changes
- [ ] Step 3 assignee select shows project members only
- [ ] Step 4 review shows all entered data with badges
- [ ] Submit creates defect with status "new" and history entry
- [ ] Cancel navigates back

## Do NOT

- Do not add file attachment upload (simulated or real)
- Do not add defect duplication feature
- Do not add bulk status transitions
- Do not add defect linking (parent/child relationships)
- Use TypeScript (strict). No `any`, no `@ts-ignore`.
