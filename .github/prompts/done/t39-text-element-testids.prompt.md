# T32 — Add `data-testid` to All Text/Display Elements

## Goal

Add `data-testid` attributes to all text-bearing display elements (`h1`–`h6`, `p`, `span`, `label`, `dd`, `dt`, `li`, informational `div`) across every page so Playwright tests can assert on them.

## Scope

All page files under `src/pages/`:

| Page module | Files | Estimated gaps |
| --- | --- | --- |
| Login | `auth/Login.tsx` | ~2 (title, tagline) |
| Dashboard | `dashboard/Dashboard.tsx`, `_components/*.tsx`, `_columns.tsx` | ~3 |
| Profile | `profile/Profile.tsx` | ~9 |
| Projects | `projects/ProjectList.tsx`, `ProjectDetail.tsx`, `ProjectForm.tsx` | ~8 |
| Defects | `defects/DefectList.tsx`, `DefectDetail.tsx`, `DefectForm.tsx` | ~10 |
| Test Plans | `testplans/TestPlanList.tsx`, `TestPlanDetail.tsx`, `TestPlanForm.tsx`, `TestRunExecution.tsx` | ~16 |
| Team | `team/TeamList.tsx`, `UserDetail.tsx` | ~7 |
| Reports | `reports/Reports.tsx` | ~5 |
| Settings | `settings/Settings.tsx` | ~14 |

## Rules

1. Follow the `data-testid` convention from architecture §4: `{scope}-{element}-{qualifier}`.
2. Every new test ID string must be registered in `src/shared/testIds.ts` — no raw strings in `.tsx` files.
3. Use semantic qualifiers (e.g., `heading-title`, `text-description`, `label-role`) — not positional indices.
4. For dynamic/repeated text elements, use builder functions in `testIds.ts`.
5. Do **not** add test IDs to elements that already have them.
6. Do **not** refactor, rename, or restructure any existing code — only add `data-testid` attributes and the corresponding `TEST_IDS` entries.
7. Import `TEST_IDS` (and builders if needed) in each page file.
8. `npm run build` must pass after all changes.

## Execution

Split across subagent sessions — one per page module. Each session:
1. Reads the page file(s).
2. Identifies all text-bearing elements missing `data-testid`.
3. Adds entries to `testIds.ts`.
4. Adds `data-testid={TEST_IDS.*}` references in the page file(s).

## Depends on

T9–T14 (all pages must exist).

## Acceptance

- `npm run build` passes.
- `npx tsc --noEmit` passes.
- Every `h1`–`h6`, `p`, `span`, `label`, and informational `div` in page files has a `data-testid`.
- No raw test ID strings in `.tsx` files — all reference `TEST_IDS` or a builder function.
