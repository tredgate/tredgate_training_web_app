# T19 — Dashboard Refactor: Split to Sub-functions

**Agent:** `@pages`
**Depends on:** T9 ✅

---

## Goal

`src/pages/dashboard/Dashboard.tsx` has grown too large. Split it into clearly named helper functions (or small sub-components) while keeping the page as the single export. The result must be easier to read top-to-bottom without losing behaviour.

---

## Scope

- Read `src/pages/dashboard/Dashboard.tsx` in full before making changes.
- Extract logical sections into named functions **within the same file** (or a co-located `_components/` subfolder if a chunk is large enough to justify it — use your judgement, see §Decision below).
- Every extracted unit must remain purely presentational: no hooks called outside the top-level component.
- All `data-testid` attributes must be preserved exactly as-is.
- TypeScript strict mode must continue to pass (`npx tsc --noEmit`).
- No new dependencies.

### Candidate sections to extract

| Section                     | Candidate name   |
| --------------------------- | ---------------- |
| Stats row (StatCard grid)   | `DashboardStats` |
| Recent defects table/list   | `RecentDefects`  |
| Quick-action buttons        | `QuickActions`   |
| Activity / test-run summary | `RecentActivity` |

Adjust names and boundaries based on what you actually find in the file.

---

## Decision point

If any extracted chunk is ≥ 80 lines and would be useful to other pages (not just Dashboard), create it as a shared component under `src/components/`. Otherwise keep it local in the same file or a co-located file. Document your decision with a one-line comment above the function/component.

---

## Done criteria

- [ ] Dashboard renders identically in the browser (same DOM structure, same `data-testid`s).
- [ ] No single function/section in `Dashboard.tsx` exceeds ~60 lines (excluding imports).
- [ ] `npx tsc --noEmit` passes (source files only).
- [ ] `npm run build` succeeds.
- [ ] `npm run test -- --run` still passes (171 tests).
