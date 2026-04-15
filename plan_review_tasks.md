## Plan Revision Tasks (for AI Agent)

Context: This is a **training app** for Playwright test automation — not a production enterprise system. Apply the following changes to `plan.md` and use them when scaffolding Phase 1. Skip anything framed as "enterprise security" or "data protection" — the app is deliberately frontend-only with plaintext users in localStorage.

---

### Task 1 — Unify defect permissions & workflow (correctness, not enterprise)

**Problem:** `src/utils/permissions.js` and `src/utils/workflow.js` both define which roles can perform defect transitions. These will drift and break the defect lifecycle demo mid-presentation.

**Action:**
- Make `workflow.js` the single source of truth for transition → allowed roles.
- In `permissions.js`, the `"defect:transition"` entry must call into `workflow.js` (e.g., `getAvailableTransitions(status, role).length > 0`) — do not re-list roles.
- Add a short comment at the top of `workflow.js`: `// Single source of truth for defect transition permissions.`

---

### Task 2 — Add `ProtectedRoute` to Phase 1

**Problem:** Architecture §5 mentions `ProtectedRoute` but the plan's Phase 1 doesn't list it. Without it, route protection gets duplicated into every page via `useEffect` redirects, which flicker badly in demos.

**Action:**
- Create `src/components/layout/ProtectedRoute.jsx` in Phase 1.
- Props: `{ children, allowedRoles? }`. If not authenticated → redirect to `/login`. If authenticated but role not in `allowedRoles` → render `<EmptyState>` with "Permission denied" message.
- Wrap all non-`/login` routes with it in the router config.
- `data-testid="protected-route-denied"` on the denied state.

---

### Task 3 — Add `useForm` hook to Phase 1

**Problem:** Login, Profile, ProjectForm, DefectForm, TestPlanForm will each reinvent form state. A consistent form API is also what makes the Fluent Interface pattern teachable (`.fillTitle().selectSeverity().submit()`).

**Action:**
- Create `src/hooks/useForm.js`.
- API: `const { values, errors, touched, setField, setFieldTouched, validate, reset, handleSubmit } = useForm(initialValues, validate)` where `validate(values) → errorsObject`.
- Keep it small — one file, ~40 lines. **Do not** build a form framework, schema validator, or field-array support.
- All form pages must use this hook.

---

### Task 4 — Add single `EmptyState` component (replaces three)

**Problem:** Architecture §13 calls for empty, not-found, and permission-denied states. Do not build three components.

**Action:**
- Create `src/components/feedback/EmptyState.jsx` with props `{ icon, title, message, action? }`.
- Use it for: empty table results, not-found pages, permission-denied screens.
- `data-testid="empty-state-{variant}"` where variant comes from a prop.

---

### Task 5 — Add central test-id registry

**Problem:** Test IDs scattered as magic strings across 50+ files. One rename breaks dozens of student test specs. For a **training** app, teaching a centralized test-id registry is especially valuable — it's the pattern we want learners to copy.

**Action:**
- Create `src/shared/testIds.js` exporting a nested constant object:
  ```js
  export const TEST_IDS = {
    login: { page: "login-page", inputUsername: "login-input-username", ... },
    defectList: { page: "defect-list-page", table: "defect-list-table", ... },
    // ...
  };
  ```
- All components and pages import from this file. No raw `data-testid="..."` strings in JSX.
- For dynamic IDs (per-row), export small builder functions: `defectListRow(id) => `defect-list-row-${id}``.

---

### Task 6 — Phase 1 hard gate

**Problem:** Plan says Phase 2 and Phase 3 run in parallel. They both depend on DataTable, Wizard, Modal, form components. If those APIs wobble during Phase 2, Phase 3 gets rework.

**Action:**
- Add an explicit checkpoint at the end of Phase 1 in `plan.md`: **"Shared component APIs frozen. Any change after this point requires updating all callers in the same commit."**
- No page work in Phase 2/3 begins until: DataTable, Modal, Wizard, Tabs, all form components, StatusBadge, Toast, EmptyState, ProtectedRoute, useForm, testIds.js are done and reviewed.

---

### Task 7 — Fix file count estimate in plan

**Problem:** `plan.md` §Technical Approach says "~30-35 new files". Architecture §3 enumerates ~55. Expectation mismatch will cause phase slippage.

**Action:**
- Update the line in `plan.md` to: **"~55-60 new files, organized by feature modules per architecture §3"**.

---

### Explicitly NOT doing (keep the plan simple)

Do **not** add any of the following — they were considered and rejected as overkill for a training app:

- ❌ Repository pattern per entity (keep generic `store.js`)
- ❌ Error boundary component
- ❌ Feature-folder layout refactor (keep layer-based structure from architecture §3)
- ❌ Reusable validator module (inline `if (!x) errors.x = "Required"` is fine)
- ❌ Seed data versioning / `SEED_VERSION`
- ❌ Route lazy loading / code splitting
- ❌ Barrel exports (`index.js` re-exports)
- ❌ Feature flags, ADRs, changelog
- ❌ Separate NotFound and PermissionDenied components (use EmptyState)
- ❌ PropTypes, TypeScript, unit tests for the app itself

---

### Order of execution

1. Update `plan.md` (Tasks 6, 7 — text edits).
2. During Phase 1 scaffolding, implement Tasks 1, 2, 3, 4, 5 as part of the foundation.
3. Verify the Phase 1 gate checklist before starting Phase 2.
