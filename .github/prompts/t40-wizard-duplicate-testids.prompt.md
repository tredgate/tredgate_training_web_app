# T40 — Bug: Duplicate `data-testid` in Multi-Step Wizard Forms

## Problem

Form pages that use the multi-step `<Wizard>` component render all steps' content into the DOM simultaneously (the Wizard shows/hides steps). This means form inputs across different wizard steps can share the **same `data-testid`** values (e.g., both Step 1 and Step 3's review panel reference the same test ID for a field).

Playwright locators like `page.getByTestId("...")` match **multiple elements**, causing race conditions and flaky tests when the framework picks the wrong (hidden) element.

## Root Cause

Each wizard step's encapsulating `<div>` does not have a unique `data-testid`, so there is no reliable scoping boundary for Playwright to narrow its locator within a specific step.

## Solution

1. **Audit all wizard-based form pages:**
   - `src/pages/projects/ProjectForm.tsx`
   - `src/pages/defects/DefectForm.tsx`
   - `src/pages/testplans/TestPlanForm.tsx`

2. **For each page:**
   - Ensure each wizard step's encapsulating `<div>` has a unique `data-testid` (e.g., `project-form-step-1`, `project-form-step-2`, `defect-form-step-1`, etc.).
   - Register these IDs in `src/shared/testIds.ts` — no raw strings.
   - Verify no two visible elements within the same step share a `data-testid`.

3. **Check for duplicate `data-testid` values across steps:**
   - If the same test ID string appears in multiple steps (e.g., a field label in Step 1 and a review label in Step 3), make them unique by scoping with the step qualifier (e.g., `project-form-label-name` vs `project-form-review-label-name`).

## Acceptance

- `npm run build` passes.
- `npx tsc --noEmit` passes.
- `grep -r 'data-testid' <file>` shows no duplicate test ID strings within any single form page.
- Every wizard step `<div>` has a unique `data-testid`.

## Depends on

T39 (text/display testids must be in place first).
