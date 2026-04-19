# T30 — Audit & Fix Missing `data-testid` on Validation Error Elements

## Problem

Some validation error `<p>` elements in the app are missing `data-testid` attributes. This was first noticed on the **Login page**, where error paragraphs (if/when added) won't have test IDs, but may affect other pages as well.

Every form input component (`TextInput`, `TextArea`, `Select`, `MultiSelect`, etc.) already has a convention for error test IDs: `{field-testid}-error`. However, pages that render their own inline error `<p>` elements outside of these shared components may not follow this convention.

## Scope — Two Steps

### Step 1: Analysis

Audit **every page and component** that renders validation error messages. For each one, record:

| File | Element | Has `data-testid`? | Current value | Expected value |
| ---- | ------- | ------------------ | ------------- | -------------- |

Check:

- All shared form components in `src/components/forms/` — verify they use `{testId}-error` on their error `<p>`.
- All pages that render custom error elements outside of shared form components (e.g. Login page, any modal with inline validation, Wizard step-level errors).
- Any `<p>` or `<span>` with class `text-red-400` or `text-red-500` that acts as a validation message.

### Step 2: Fix

- Add missing `data-testid` attributes following the `{field-testid}-error` convention.
- Register any new test IDs in `src/shared/testIds.ts` if they don't already exist.
- Do NOT change validation logic, error messages, or styling.

## Requirements

1. Every validation error element must have a `data-testid` attribute.
2. All test IDs must follow the existing `{field-testid}-error` naming convention.
3. New IDs must be registered in `src/shared/testIds.ts`.
4. `npm run build` must pass.

## Acceptance Criteria

- Analysis table delivered in the PR/commit message.
- All validation error elements across the app have `data-testid` attributes.
- `testIds.ts` is updated if new IDs were added.
