---
mode: agent
agent: logic
description: "useForm: clear validation errors live as user corrects fields"
---

# T33 — useForm: Clear Validation Errors on Field Change

## Problem

Once validation errors are displayed (after a failed submit), they **stay visible** even after the user corrects the field. The errors only disappear on the next form submission. This is poor UX — users expect inline errors to clear as soon as the problem is fixed.

## Root Cause

`setField` in `src/hooks/useForm.ts` updates the value via `setValues` but does **not** re-run the `validateFn`. The `errors` state object stays stale until `handleSubmit` or `validate()` is called again.

## Steps to Reproduce

1. Navigate to any form (e.g. `/projects/new`, `/defects/new`, `/login`).
2. Submit the form with empty required fields → inline errors appear.
3. Start typing in a field that shows an error.
4. Observe: the error message remains visible even though the field now has a valid value.

## Required Fix

Modify `setField` in `src/hooks/useForm.ts` so that when errors already exist for the changed field, validation is re-run for that field and the error is cleared if the field is now valid.

### Implementation approach

In `setField`, after updating the value, check whether the changed field currently has an error. If so, compute the new values, run `validateFn` against them, and update `errors` — either clearing the error for that field (if it's now valid) or keeping the current error message (if it's still invalid). This gives live feedback in both directions: errors appear on submit, and clear on correction.

Key constraints:

- The fix must live entirely in `useForm.ts` — do **not** modify any form page or component.
- Re-validate only when errors already exist for the changed field (don't validate pristine fields on every keystroke).
- Keep the existing `validate()` and `handleSubmit()` behaviour unchanged.
- No new exports or API changes to `UseFormReturn<T>`.

## What NOT to change

- Do NOT modify any page component (`Login.tsx`, `ProjectForm.tsx`, `DefectForm.tsx`, `TestPlanForm.tsx`, etc.).
- Do NOT change the `UseFormReturn<T>` interface.
- Do NOT add new dependencies.

## Acceptance Criteria

- After a failed submit, typing a valid value into an errored field clears that field's error immediately.
- Fields without errors are not affected by changes to other fields.
- Submitting with new errors still works as before.
- `npm run build` passes.
- `npm run test` passes (existing `useForm.test.ts` + any new tests).
