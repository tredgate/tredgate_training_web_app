# Task 17 — E2E Smoke Validation (On-Demand)

> **Layer**: Validation (not implementation) · **Depends on**: Any subset of T9–T14 marked ✅ in STATUS.md · **Parallelizable**: No — runs alone against a live dev server
> **Trigger**: **On-demand only.** Do NOT run automatically when a task is marked ✅. The user will explicitly request this task.

## Objective

Validate the running app against its advertised behaviour using the Playwright MCP server. This is a **smoke pass**, not a test suite. Confirm the golden paths work for each role, confirm role-gated UI matches architecture §12, confirm `data-testid` registry is wired to the DOM. Catch integration regressions unit tests can't see.

This task does **NOT**:

- Replace the student-facing Playwright training tests (those are written by students).
- Modify any source code. If bugs are found, a follow-up fix prompt is created — Vera reviews it, the user approves it, another agent implements it.
- Do pixel-perfect visual checks, content assertions beyond testIds, or performance benchmarking.

## Prerequisites (check before starting)

1. `.github/prompts/STATUS.md` shows at least one of T9–T14 as `✅ done`. If all Phase 3 tasks are still pending, abort and report back — there's nothing to smoke-test yet.
2. `npm install` has run (node_modules present).
3. Dev server starts cleanly via `npm run dev` — capture the local URL (usually `http://localhost:5173`).
4. `src/shared/testIds.ts` exists and is importable — the agent reads testIds from this registry, never hardcodes them.

If any prerequisite fails, stop and report which one.

## Role Matrix — Login + Sidebar Visibility

For each of the three seeded users, log in and assert sidebar contents match architecture §11.

| Role     | Username / Password  | Sidebar must show                                                  | Sidebar must NOT show |
|----------|----------------------|--------------------------------------------------------------------|-----------------------|
| tester   | `tester` / `test123` | Dashboard, Projects, Defects, Test Plans, Team                     | Reports, Settings     |
| qa_lead  | `qa_lead` / `qa123`  | Dashboard, Projects, Defects, Test Plans, Team, Reports            | Settings              |
| admin    | `admin` / `admin123` | Dashboard, Projects, Defects, Test Plans, Team, Reports, Settings  | —                     |

(Exact credentials — confirm against `src/data/seed.ts`. If seed uses different values, use those.)

For each role, after login:

- Assert URL is `/dashboard`.
- Assert `data-testid="dashboard-page"` is present in DOM.
- Assert each expected sidebar item has its `data-testid` from the registry.
- Assert disallowed sidebar items are **absent from DOM** (not just hidden — per §12 "hide, don't disable").

## Golden Paths — One per Role

Run only the paths for which the relevant page task is ✅ in STATUS.md. Skip gracefully with a "not ready" note if the page isn't implemented yet.

### Tester golden path — Report a Defect

_Requires T11 ✅._

1. Login as tester.
2. Click sidebar "Defects" → assert `data-testid="defect-list-page"`.
3. Click "Report Defect" button.
4. Walk through all 4 wizard steps, filling minimum required fields. Use any valid project and environment.
5. Submit on Step 4 → assert success toast appears (`data-testid="toast-success"`).
6. Assert navigation to `/defects/{newId}` — detail page loads with the title just entered.
7. Back to defect list → assert the new defect row is present (search by title).

### QA Lead golden path — Assign and Start a Defect

_Requires T11 ✅._

1. Login as qa_lead.
2. Navigate to `/defects` → open any defect with status `new`.
3. Assert "Assign" transition button is visible (`data-testid="defect-detail-btn-assign"`).
4. Click "Assign" → modal opens (`data-testid="modal-assign-defect"`).
5. Select an assignee → confirm.
6. Assert status badge updated to `assigned`, toast shown, history timeline has a new entry.

### Admin golden path — Settings + User Role Edit

_Requires T13 ✅ and T14 ✅._

1. Login as admin.
2. Click sidebar "Settings" → assert `data-testid="settings-page"`.
3. Assert Data Management card renders (reset / clear / export / import buttons all have correct testIds — do NOT click destructive buttons).
4. Navigate to `/team` → assert `data-testid="team-list-page"`.
5. Click a non-admin user row → assert `data-testid="user-detail-page"`.
6. Assert "Edit Role" button visible (`data-testid="user-detail-btn-edit"`).
7. Click it → assert role Select appears. Do NOT save (no state mutation needed for smoke).

## `data-testid` Coverage Spot-Check

For each page visited during the run, assert the page-level testId from `src/shared/testIds.ts` is present in the DOM. If a testId is declared in the registry but missing from the rendered page, that's a bug — log it.

List of page-level testIds to check (whichever were visited):
`dashboard-page`, `project-list-page`, `project-detail-page`, `project-form-page`, `defect-list-page`, `defect-detail-page`, `defect-form-page`, `testplan-list-page`, `testplan-detail-page`, `testplan-form-page`, `testrun-execution-page`, `team-list-page`, `user-detail-page`, `reports-page`, `settings-page`, `profile-page`.

## Output Format

Structured report — no prose, no filler. Return exactly this shape:

```
## E2E Smoke Report — {timestamp}

Dev server: {url}
Tasks covered: T9, T11, T13, T14   ← whichever were ✅ at run time

### Role matrix
- [x] tester   — login ok, sidebar ok
- [x] qa_lead  — login ok, sidebar ok
- [ ] admin    — FAIL: sidebar missing "Settings" item (expected testid sidebar-item-settings)

### Golden paths
- [x] Tester: Report a Defect         — ok (defect #42 created)
- [ ] QA Lead: Assign and Start       — FAIL at step 4: modal did not open (testid modal-assign-defect not found in DOM). Screenshot: {path}
- [~] Admin: Settings + Role Edit     — skipped (T13 not yet ✅)

### testId coverage
- [x] All visited page-level testIds present in DOM.
- [ ] Missing: defect-detail-card-assignment (declared in registry, absent on /defects/3)

### Summary
2 failures, 1 skipped, 5 passed.
```

Use `[x]` pass, `[ ]` fail, `[~]` skipped.

## Bug-Found Protocol

For each failure:

1. Capture a screenshot (Playwright MCP provides this) — save to `.playwright-mcp/smoke-{timestamp}/`.
2. Do **NOT** patch the bug yourself. Instead:
3. Create a new prompt file: `.github/prompts/tN-fix-{short-name}.prompt.md` (where N is the next free task number). Include:
   - What broke (exact testId / selector, expected vs actual).
   - Which task introduced the area (e.g., "affects T11 DefectDetail").
   - Reproduction steps.
   - Screenshot path.
4. Add a row to `.github/prompts/STATUS.md` for the new fix task with status `⬜ pending`, Notes: "found by T17 smoke on {date}".
5. Tag Vera in the report: "→ fix prompt created: tN-fix-{name}. Review before implementing."

## Do NOT

- Do not run this task automatically after another task is marked ✅ — wait for explicit user request.
- Do not modify any file under `src/`.
- Do not write or modify Playwright test files under `tests/` or `e2e/` — those are for students.
- Do not click destructive buttons (Settings → Reset / Clear / Delete modals).
- Do not make content assertions beyond testIds and toast visibility. (No "assert heading text equals X".)
- Do not take pixel-diff snapshots.
- Do not run performance or accessibility audits (separate concern).
- Do not mark this task ✅ in STATUS.md on completion — it's a recurring on-demand check, not a one-shot task. Leave it as `⬜ pending` and append the run timestamp in Notes.

## STATUS.md entry

Add this row once (if not already present):

```
| T17  | E2E Smoke Validation (on-demand)   | ⬜ pending  | Any of T9–T14 ✅| —          | —          | —       | Runs on demand; never auto-triggered |
```

After each run, update the Notes column: `Last run: {date} — {n} pass / {n} fail / {n} skip`.
