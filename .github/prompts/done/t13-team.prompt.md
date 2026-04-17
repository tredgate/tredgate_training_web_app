# Task 13 — Team Module (User List + User Detail)

> **Layer**: 3 (Pages) · **Depends on**: T2 (layout), T3 (DataTable), T4 (Modal, EmptyState), T7 (StatusBadge, UserAvatar, form components), T8 (useUsers, useProjects, useDefects) · **Parallelizable** with T9-T12, T14

## Objective

Build the Team module: a user list page and a user detail/edit page. This is a simpler module — users are read from seed data, not created at runtime. The admin can edit role and project assignments. All roles can view the team.

## Constraints

- Follow architecture §12 (permissions).
- `user:edit_role` requires `admin`. All roles can view team list.
- No user creation or deletion at runtime — users come from seed data.
- `useUsers` hook is read-only except for the `update` method (admin only).
- All `data-testid` from `src/shared/testIds.ts`. Extend the registry.

## Files to Create

### 1. `src/pages/team/TeamList.tsx`

#### Layout

```
PageHeader: "Team"
  actions: none (no user creation)

DataTable with user data
```

#### DataTable Configuration

```tsx
<DataTable
  columns={[
    {
      key: "avatar",
      label: "",
      sortable: false,
      render: (_, row) => <UserAvatar user={row} size="sm" />,
    },
    { key: "fullName", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (val) => <StatusBadge type="role" value={val} />,
    },
    {
      key: "projectIds",
      label: "Projects",
      sortable: false,
      render: (val) => `${val.length} projects`,
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (val) =>
        val ? (
          <span className="text-green-400">Active</span>
        ) : (
          <span className="text-red-400">Inactive</span>
        ),
    },
  ]}
  data={users}
  searchable
  searchPlaceholder="Search team members..."
  filters={[
    { key: "role", label: "Role", options: USER_ROLES },
    {
      key: "isActive",
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ]}
  pagination
  pageSize={10}
  onRowClick={(row) => navigate(`/team/${row.id}`)}
  emptyMessage="No team members found"
  testIdPrefix="team-list"
/>
```

`data-testid="team-list-page"`.

### 2. `src/pages/team/UserDetail.tsx`

Route: `/team/:userId`.

#### Layout

```
PageHeader: "{user.fullName}"
  backTo: "/team"
  actions: {
    role === "admin" && currentUser.id !== user.id &&
      <button onClick={toggleEditMode}>Edit Role</button>
  }

Two-column layout:
  Left (2/3): User info + Activity
  Right (1/3): Projects & Stats
```

#### Left Column

**Profile card** (glass):

- Large UserAvatar
- Full name, email, role badge
- `data-testid="user-detail-profile"`.

**Activity section**:

- Recent defects reported by this user (last 5). Small list with defect title, status badge, date. Each links to `/defects/{id}`.
- Recent test runs executed by this user (last 5). Small list with plan name, status, date.
- `data-testid="user-detail-activity"`.

#### Right Column

**Projects card** (glass):

- List of projects the user belongs to. Each shows project name (link to `/projects/{id}`), role in that project (lead or member).
- `data-testid="user-detail-projects"`.

**Stats card** (glass):

- Defects reported: count
- Defects assigned: count
- Test runs executed: count
- `data-testid="user-detail-stats"`.

#### Edit Mode (admin only)

When "Edit Role" is clicked, toggle inline editing:

- Role field becomes a `Select` with role options (tester / qa_lead / admin).
- Project assignments become a `MultiSelect` with all projects.
- Save / Cancel buttons appear.
- Save calls `useUsers().update(...)`, shows toast, exits edit mode.

`data-testid="user-detail-btn-edit"`, `data-testid="user-detail-select-role"`, `data-testid="user-detail-select-projects"`, `data-testid="user-detail-btn-save"`, `data-testid="user-detail-btn-cancel"`.

**Guard**: Admin cannot edit their own role (prevents lock-out). The Edit button is hidden when viewing own profile (use Profile page instead — T14).

#### Not found

If `userId` doesn't match, render `<EmptyState variant="not-found" />`.

### `src/shared/testIds.ts` — Extend

```ts
teamList: {
  page: "team-list-page",
},
userDetail: {
  page: "user-detail-page",
  profile: "user-detail-profile",
  activity: "user-detail-activity",
  projects: "user-detail-projects",
  stats: "user-detail-stats",
  btnEdit: "user-detail-btn-edit",
  selectRole: "user-detail-select-role",
  selectProjects: "user-detail-select-projects",
  btnSave: "user-detail-btn-save",
  btnCancel: "user-detail-btn-cancel",
},
```

## Verification Checklist

### TeamList

- [ ] DataTable renders all seed users
- [ ] Search filters by name/email
- [ ] Role filter works
- [ ] Active/Inactive status filter works
- [ ] Row click navigates to `/team/{id}`
- [ ] UserAvatar renders for each row
- [ ] Role badges display with correct colours

### UserDetail

- [ ] Shows user profile (name, email, role, avatar)
- [ ] Activity section shows recent defects and test runs
- [ ] Projects card lists user's project assignments
- [ ] Stats card shows correct counts
- [ ] "Edit Role" button visible for admin only
- [ ] "Edit Role" button hidden when viewing own profile (admin)
- [ ] Edit mode shows role Select and projects MultiSelect
- [ ] Save updates user and shows toast
- [ ] Cancel exits edit mode without saving
- [ ] Non-existent user shows EmptyState

## Do NOT

- Do not add user creation or deletion
- Do not add password management
- Do not add user invitation/onboarding flows
- Do not add permissions editing beyond role assignment
- Use TypeScript (strict). No `any`, no `@ts-ignore`.
