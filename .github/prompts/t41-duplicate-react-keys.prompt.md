# T41 — Bug: Duplicate React Keys Across Pages

## Problem

React console warnings appear at runtime:

```
Encountered two children with the same key, `2`. Keys should be unique so that
components maintain their identity across updates. Non-unique keys may cause
children to be duplicated and/or omitted — the behavior is unsupported and
could change in a future version.
```

This is observed on the Defects page and potentially other pages. Duplicate keys cause React to mis-identify list children, leading to stale renders, duplicated DOM nodes, and intermittent Playwright test crashes when the framework interacts with ghost elements.

## Root Cause (suspected)

Lists rendered with `.map()` are using a non-unique value as the `key` prop — likely an array index, a shared foreign-key ID (e.g., `projectId`), or a field value that isn't unique across siblings. The `key` must be unique **among siblings** in the same list.

## Scope — Full Audit

Audit **every** `.map()` call that renders JSX across all pages and components:

1. `src/pages/defects/` — DefectList, DefectDetail, DefectForm
2. `src/pages/projects/` — ProjectList, ProjectDetail, ProjectForm
3. `src/pages/testplans/` — TestPlanList, TestPlanDetail, TestPlanForm, TestRunExecution
4. `src/pages/team/` — TeamList, UserDetail
5. `src/pages/dashboard/` — Dashboard and sub-components
6. `src/pages/reports/` — Reports
7. `src/pages/settings/` — Settings
8. `src/pages/profile/` — Profile
9. `src/components/` — any shared component that renders lists (DataTable, ActivityTimeline, MultiSelect, etc.)

## What to check

For each `.map()` that returns JSX:

- Is `key` set?
- Is `key` guaranteed unique among siblings? (entity `.id` is safe; array index is fragile but acceptable for static lists; a foreign key like `projectId` is **not** unique if multiple items share it)
- If the list items don't have a natural unique ID, use a composite key (e.g., `` `${parentId}-${index}` ``).

## Fix

Replace every non-unique `key` with a value that is unique among its siblings. Prefer entity `.id` where available. For items without a natural ID (e.g., steps, environment rows), use the array index only if the list is static/append-only; otherwise use a composite key.

## Acceptance

- `npm run build` passes.
- No "duplicate key" warnings in the browser console when navigating all pages.
- Each `.map()` rendering JSX uses a provably unique `key`.

## Depends on

T9–T14 (all pages must exist).
