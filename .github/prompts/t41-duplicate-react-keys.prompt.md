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

## Analysis Report (2026-04-20)

### Audit Method

- Performed a full static audit of JSX list rendering across `src/pages/**` and `src/components/**`.
- Reviewed every `key={...}` usage and each `DataTable` callsite to confirm whether keys are provably unique among siblings.
- Classified findings as: confirmed bug (currently reproducible), medium-risk (can become duplicate/stale under common mutations), and low-risk (acceptable/static).

### Findings

#### 1. Confirmed Root Cause (Critical)

- `src/pages/defects/DefectDetail.tsx`: timeline and comment entries are merged into one array (`allActivities`) before rendering.
- `src/components/display/ActivityTimeline.tsx`: list key is `key={entry.id}`.
- Both source arrays use local numeric IDs that overlap (`history.id` and `comment.id` each commonly start at `1`, `2`, ...).
- After merge, siblings can share the same key (e.g., `2`), matching the observed runtime warning: `Encountered two children with the same key, '2'`.

Why this is high impact:
- React reconciliation can reuse the wrong element instance, causing stale timeline rows and brittle Playwright interactions.

#### 2. Medium-Risk Key Patterns (Not guaranteed bug today, but fragile)

- `src/pages/testplans/TestPlanForm.tsx`
	- `key={caseIdx}` for test cases.
	- `key={stepIdx}` for step rows.
	- `key={idx}` in review summary.
	- These lists support add/remove operations; index keys can remount wrong rows and leak stale input state.
- `src/pages/projects/ProjectForm.tsx`
	- `key={idx}` for environments in both edit and review render paths.
	- Environments are dynamic (add/remove), so index keys are brittle.
- `src/pages/testplans/TestPlanDetail.tsx`
	- `key={stepIdx}` for expanded case steps.
	- `key={idx}` for modal results rows.
- `src/pages/testplans/TestRunExecution.tsx`
	- `key={stepIdx}` for executable steps list.
- `src/pages/reports/Reports.tsx`
	- `key={idx}` for Top Reporters and Top Executors rows.
	- Derived/sorted lists are stable most of the time but can reorder when data changes, causing avoidable remounting.

#### 3. Low-Risk / Acceptable as Implemented

- `src/components/navigation/Wizard.tsx`: `key={i}` on static wizard definition (fixed order, short list).
- `src/components/data/DataTable.tsx`: row keys derive from `keyField` (default `id`) and are safe where data IDs are unique.
- Route/page lists using entity keys (`row.id`, `defect.id`, `run.id`, `member.id`, `crumb.path`, etc.) are correctly keyed.

### Summary

- The observed warning (`same key '2'`) is explained by one concrete, reproducible key-collision bug in the Defect timeline path.
- Additional index-key hotspots exist across forms and report sections; these are likely contributors to stale render behavior and should be hardened in the fix phase.

### Proposed Fix Scope for Step 2

1. Fix the confirmed defect first:
	 - Use a namespaced/composite activity key in timeline rendering (for example: `${entry.type}-${entry.id}-${entry.timestamp}`).
2. Harden all medium-risk dynamic lists:
	 - Replace index-only keys with stable IDs where available.
	 - For nested rows without IDs, use deterministic composite keys derived from parent identity + local identity (or explicit generated IDs).
3. Re-validate:
	 - `npm run build`.
	 - Manual navigation through Defects, Projects, Test Plans, Reports with console clean of duplicate-key warnings.
