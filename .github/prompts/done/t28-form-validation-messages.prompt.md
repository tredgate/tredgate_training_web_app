---
mode: agent
agent: pages
description: Fix validation error messages not appearing in form pages
---

# T28 — Fix Validation Messages in Form Pages

## Context

All form pages use `useForm<T>(initialValues, validateFn)` from `src/hooks/useForm.ts`. The hook tracks which fields have been touched via a `touched` map. Form field components (`TextInput`, `TextArea`, `Select`) only render their `error` prop when `touched[field]` is `true`:

```tsx
error={form.touched.title ? form.errors.title ?? null : null}
```

This means validation messages are **only visible after the user has explicitly interacted with a field** _or_ after the Wizard step's `validate()` function calls `form.setFieldTouched(field)` for every invalid field.

## Problem

`ProjectForm.tsx` step `validate` functions return `false` on invalid data but **never call `form.setFieldTouched()`** for the fields with errors. As a result, `touched` stays `false` and error messages are never rendered — even when the user tries to advance to the next step.

### Broken pattern (ProjectForm step 1):

```tsx
validate: () => {
  const errors = validateForm(form.values);
  const basicErrors = ["name", "code", "description"].some((k) => k in errors);
  return !basicErrors;  // ← touched never set → errors never shown
},
```

### Correct pattern (DefectForm / TestPlanForm):

```tsx
validate: () => {
  const errors = validateStep1(form.values);
  if (Object.keys(errors).length > 0) {
    (Object.keys(errors) as Array<keyof FormValues>).forEach((field) =>
      form.setFieldTouched(field),
    );
    return false;
  }
  return true;
},
```

## Scope

Audit **all form pages** for this pattern and fix any step `validate` function that is missing the `setFieldTouched` call. Do not change validation logic, error messages, or any other behaviour.

Files to check (all under `src/pages/`):

| File | Status |
|------|--------|
| `projects/ProjectForm.tsx` | ❌ broken — step 1 and step 2 validate don't call `setFieldTouched` |
| `defects/DefectForm.tsx` | ✅ correct |
| `testplans/TestPlanForm.tsx` | ✅ correct |

## Requirements

1. **Fix `ProjectForm.tsx`** — update both step `validate` functions to mirror the DefectForm pattern:
   - Step 1: collect errors for `name`, `code`, `description`, `status`; call `setFieldTouched` for each; return `false` if any errors.
   - Step 2: collect errors for `leadId`; call `setFieldTouched`; return `false` if error exists.

2. **Do not modify any validation logic** — only change how `touched` is set inside the step `validate` callbacks.

3. **Do not touch** `DefectForm.tsx` or `TestPlanForm.tsx` — they already work correctly.

4. After fixing, confirm the build is clean: `npm run build` must succeed with zero errors.

## Acceptance Criteria

- Submitting step 1 in ProjectForm with all fields empty shows inline error messages under each required field.
- Submitting step 2 in ProjectForm without a QA Lead selected shows an inline error under the Lead field.
- `npm run build` passes with no TypeScript errors.
