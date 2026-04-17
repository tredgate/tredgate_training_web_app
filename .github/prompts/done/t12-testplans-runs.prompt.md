# Task 12 — Test Plans & Test Runs Module

> **Layer**: 3 (Pages) · **Depends on**: T2 (layout), T3 (DataTable), T4 (Modal, EmptyState), T5 (Wizard), T6 (Tabs), T7 (form components, StatusBadge, UserAvatar), T8 (useTestPlans, useTestRuns, useProjects, useUsers) · **Parallelizable** with T9-T11, T13-T14

## Objective

Build the Test Plans module (list + detail + form) and the Test Run Execution page. Test plans contain test cases with steps; test runs execute those plans, recording pass/fail/skip per step and per case. The execution page is a key Playwright target: a step-by-step interactive UI with per-step verdict buttons.

## Constraints

- Follow architecture §9 (component APIs), §10 (page layout), §12 (permissions).
- `testplan:create`, `testplan:edit` require `qa_lead` or `admin`. All roles can execute test runs.
- Test cases are embedded in test plans (§7a — `TestCase[]` inside `TestPlan`). They are NOT a separate collection.
- All `data-testid` from `src/shared/testIds.ts`. Extend the registry.

## Files to Create

### 1. `src/pages/testplans/TestPlanList.tsx`

#### Layout

```
PageHeader: "Test Plans"
  actions: { hasPermission("testplan:create") && <Link to="/test-plans/new">New Test Plan</Link> }

DataTable with test plan data
```

#### DataTable Configuration

```tsx
<DataTable
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "projectId", label: "Project", sortable: true,
      render: (val) => projectName(val) },
    { key: "status", label: "Status", sortable: true,
      render: (val) => <StatusBadge type="testplan_status" value={val} /> },
    { key: "testCases", label: "Test Cases", sortable: false,
      render: (val) => `${val.length} cases` },
    { key: "assigneeId", label: "Assignee", sortable: false,
      render: (val) => val ? <UserAvatar ... /> : "—" },
    { key: "updatedAt", label: "Updated", sortable: true,
      render: (val) => formatDate(val) },
  ]}
  data={testPlans}
  searchable
  searchPlaceholder="Search test plans..."
  filters={[
    { key: "status", label: "Status", options: TESTPLAN_STATUSES },
    { key: "projectId", label: "Project", options: projectOptions },
  ]}
  pagination
  pageSize={10}
  onRowClick={(row) => navigate(`/test-plans/${row.id}`)}
  emptyMessage="No test plans found"
  testIdPrefix="testplan-list"
/>
```

`data-testid="testplan-list-page"`, button `data-testid="testplan-list-btn-new"`.

### 2. `src/pages/testplans/TestPlanDetail.tsx`

#### Layout

```
PageHeader: "{testPlan.name}"
  backTo: "/test-plans"
  actions: {
    hasPermission("testplan:edit") && <Link to={`/test-plans/${id}/edit`}>Edit</Link>
    <button onClick={startNewRun}>Execute Test Run</button>
  }

Tabs: Overview | Test Cases | Execution History
```

#### Overview Tab

- **Plan Info** card (glass): Status badge, description, project link, assignee avatar, created/updated dates.
- **Summary Stats** (inline): Total cases, steps count, last run result (pass/fail).
- `data-testid="testplan-detail-overview"`.

#### Test Cases Tab

Expandable list of test cases. Each test case shows:

- Name, description, priority badge
- Expand to show steps (ordered list): step number, action, expected result.

```
TestCase: "Login with valid credentials"          Priority: P1
  Step 1: Navigate to login page → Login form visible
  Step 2: Enter username "tester" → Username field populated
  Step 3: Click login button → Dashboard displayed
```

Badge on tab: test case count.
`data-testid="testplan-detail-cases"`.

For each test case: `data-testid="testplan-case-{caseIndex}"`.
Expand/collapse: `data-testid="testplan-case-{caseIndex}-toggle"`.

#### Execution History Tab

DataTable of test runs for this plan:

```tsx
columns: [
  { key: "executedBy", label: "Executed By", render: UserAvatar },
  { key: "status", label: "Status", render: StatusBadge },
  {
    key: "results",
    label: "Results",
    render: (results) => `${passed}/${total} passed`,
  },
  { key: "startedAt", label: "Date", render: formatDate },
];
```

Row click → opens the run result detail (a Modal showing full per-case results).
Badge on tab: run count.
`data-testid="testplan-detail-history"`.

#### Start New Run

"Execute Test Run" button creates a new TestRun entity (status: "in_progress"), navigates to `/test-runs/{runId}/execute`.

### 3. `src/pages/testplans/TestPlanForm.tsx`

Used for create and edit.

#### Wizard Steps

**Step 1: Plan Details**

- Name (TextInput, required)
- Project (Select, required)
- Description (TextArea, required)
- Assignee (Select from project members, optional)

**Step 2: Test Cases**
This is the most complex wizard step. Interactive list of test cases, each with nested steps.

```
[+ Add Test Case]

TestCase 1: _______ (name input)   Priority: [Select]
  Description: _______ (textarea)
  Steps:
    1. Action: _______ | Expected: _______  [×]
    2. Action: _______ | Expected: _______  [×]
    [+ Add Step]
  [Remove Case]

TestCase 2: ...
```

- "Add Test Case" appends a new empty case with one empty step.
- "Add Step" appends a step to that case.
- Remove buttons delete case/step.
- Each test case needs: name (required), priority (Select), description (optional), at least 1 step.
- Each step needs: action (required), expectedResult (required).

Validation: at least 1 test case with at least 1 step.

**Step 3: Review**

- Summary of plan details + test cases with step counts.
- Submit button.

#### Form state

Use `useForm` for flat fields (name, projectId, description, assigneeId). Manage `testCases` as a separate `useState<TestCase[]>` — complex nested array.

`testIdPrefix="testplan-form"`.

### 4. `src/pages/testruns/TestRunExecution.tsx`

The interactive test execution page. Route: `/test-runs/:runId/execute`.

#### Layout

```
PageHeader: "Executing: {testPlan.name}"
  backTo: `/test-plans/${testPlan.id}`

Progress bar: "Case 2 of 5 — Step 3 of 4"

Current test case card (large, glass):
  Case Name + Description
  Steps list:
    ✅ Step 1: "Navigate to login"          [Passed]
    ✅ Step 2: "Enter credentials"           [Passed]
    ➡️ Step 3: "Click submit"               [Pass] [Fail] [Skip]
    ⬜ Step 4: "Verify dashboard"

Navigation:
  [Previous Case]  [Next Case]  [Complete Run]
```

#### Behaviour

1. Display one test case at a time, all steps visible.
2. Steps above the current step show their result (pass/fail/skip icon + badge).
3. Current step is highlighted with verdict buttons: **Pass** (green), **Fail** (red), **Skip** (yellow).
4. Clicking a verdict button:
   - Records the result for that step in the `TestRun.results` array.
   - If `fail`, show a `Modal` prompt for a note (TextInput, optional — why it failed).
   - Advances to the next step automatically.
5. If all steps in a case are done, auto-advance to next case.
6. Navigation buttons allow moving between cases (can revisit completed cases).
7. "Complete Run" button (only enabled when all cases have been executed):
   - Sets `TestRun.status` to "completed" (or "failed" if any case failed).
   - Sets `completedAt`.
   - Toast notification.
   - Navigates to test plan detail page.

#### Per-case summary

When all steps in a case are done, show a small summary:

- Passed: X, Failed: Y, Skipped: Z
- Overall: Passed / Failed

#### Progress bar

```tsx
const totalSteps = testPlan.testCases.flatMap((c) => c.steps).length;
const completedSteps = run.results.length;
// Visual: completedSteps / totalSteps as percentage bar
```

`data-testid="testrun-execution-page"`, `data-testid="testrun-progress-bar"`.

Per-step buttons: `data-testid="testrun-step-{caseIdx}-{stepIdx}-pass"`, `...-fail"`, `...-skip"`.
Navigation: `data-testid="testrun-btn-prev-case"`, `data-testid="testrun-btn-next-case"`, `data-testid="testrun-btn-complete"`.

### `src/shared/testIds.ts` — Extend

```ts
testplanList: {
  page: "testplan-list-page",
  btnNew: "testplan-list-btn-new",
},
testplanDetail: {
  page: "testplan-detail-page",
  btnEdit: "testplan-detail-btn-edit",
  btnExecute: "testplan-detail-btn-execute",
  overview: "testplan-detail-overview",
  cases: "testplan-detail-cases",
  history: "testplan-detail-history",
},
testplanForm: {
  page: "testplan-form-page",
  inputName: "testplan-form-input-name",
  selectProject: "testplan-form-select-project",
  inputDescription: "testplan-form-input-description",
  selectAssignee: "testplan-form-select-assignee",
  btnAddCase: "testplan-form-btn-add-case",
},
testrunExecution: {
  page: "testrun-execution-page",
  progressBar: "testrun-progress-bar",
  btnPrevCase: "testrun-btn-prev-case",
  btnNextCase: "testrun-btn-next-case",
  btnComplete: "testrun-btn-complete",
},

// Dynamic builders:
export const testplanCase = (caseIndex: number): string =>
  `testplan-case-${caseIndex}`;
export const testplanCaseToggle = (caseIndex: number): string =>
  `testplan-case-${caseIndex}-toggle`;
export const testplanFormCaseRow = (caseIndex: number): string =>
  `testplan-form-case-${caseIndex}`;
export const testplanFormStepRow = (caseIndex: number, stepIndex: number): string =>
  `testplan-form-case-${caseIndex}-step-${stepIndex}`;
export const testrunStepBtn = (caseIdx: number, stepIdx: number, verdict: "pass" | "fail" | "skip"): string =>
  `testrun-step-${caseIdx}-${stepIdx}-${verdict}`;
```

## Verification Checklist

### TestPlanList

- [ ] DataTable renders all seed test plans
- [ ] Search and filters work
- [ ] "New Test Plan" button visible for qa_lead/admin only
- [ ] Row click navigates to detail

### TestPlanDetail

- [ ] Overview shows plan info with status badge
- [ ] Test Cases tab lists all cases with expandable steps
- [ ] Expanding a case shows step details
- [ ] Execution History tab shows past runs
- [ ] "Execute Test Run" creates a run and navigates to execution page
- [ ] Edit button respects role permissions

### TestPlanForm

- [ ] Create mode: empty, 3-step wizard
- [ ] Edit mode: pre-filled with existing cases and steps
- [ ] Can add/remove test cases
- [ ] Can add/remove steps within test cases
- [ ] Validation enforces at least 1 case with 1 step
- [ ] Submit creates/updates plan and navigates to detail

### TestRunExecution

- [ ] Shows current test case with all steps
- [ ] Current step has Pass/Fail/Skip buttons
- [ ] Clicking a verdict records result and advances
- [ ] Fail button prompts for optional note
- [ ] Progress bar updates as steps complete
- [ ] Can navigate between cases
- [ ] "Complete Run" finishes the run and navigates back
- [ ] All verdict buttons have correct `data-testid`

## Do NOT

- Do not add test case reordering via drag-and-drop
- Do not add test case import/export
- Do not add test run comparison between runs
- Do not add time tracking per step
- Use TypeScript (strict). No `any`, no `@ts-ignore`.
