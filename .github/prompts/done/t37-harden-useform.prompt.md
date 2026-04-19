---
mode: agent
agent: logic
description: "Harden useForm — setField clears errors + validateFields(fields) helper; migrate all forms"
---

# T37 — Harden `useForm` to Prevent Recurring Validation Bugs

## Background — why this exists

The app has repeatedly shipped validation bugs (T28, T29, T32, T33) that all share one root cause: `useForm` lets callers *forget* steps of the validation dance.

Specifically, Wizard step `validate` closures today must do three things correctly:

1. Run the validation function.
2. Call `form.validate()` (so `errors` state is populated and re-renders happen).
3. Call `form.setFieldTouched(field)` for every errored field in the step.

Missing **any** of the three → errors silently fail to display and the user just can't advance. That pattern has shipped three times already. `ProjectForm` was fixed in T28; `DefectForm` Steps 1 & 2 and `TestPlanForm` Step 1 still have the same bug today (confirmed during the T32 audit — they call `setFieldTouched` but **not** `form.validate()`, so `form.errors` stays `{}`).

The fix is to make the API impossible to misuse, then migrate every consumer to the new API.

**This task also subsumes T33 (live error clearing).** The new `setField` behavior makes that fall out for free.

## Scope

### 1. Extend `useForm` in `src/hooks/useForm.ts`

**Change `setField`:**

When `setField(name, value)` is called, if `errors[name]` currently has a value, re-run `validateFn` against the *new* values and update `errors[name]` with the result (clearing it if the field is now valid, updating the message if still invalid). Pristine fields (no existing error) are not re-validated on keystroke — we don't want to validate as the user first types.

This closes T33.

**Add `validateFields(fields)`:**

```ts
validateFields: (fields: Array<keyof T>) => boolean;
```

Behavior:

1. Runs the full `validateFn(values)` (single source of truth — do NOT introduce per-step validators).
2. Updates `errors` state with the full result.
3. Marks `touched[field] = true` for every field in `fields`.
4. Returns `true` iff *none of the listed fields* has an error. (Errors in fields outside the list don't block the step — they belong to other steps.)

**Leave alone:**

- `values`, `errors`, `touched`, `setFieldTouched`, `validate`, `reset`, `handleSubmit`.
- `handleSubmit`'s existing "mark all touched" behavior (the T29 fix) stays.
- The `FormErrors<T>` type and `UseFormReturn<T>` interface — only *add* `validateFields` to the interface.

### 2. Migrate all step `validate` closures to `validateFields`

Three files, six step validates. Collapse each one from the manual dance to a single call.

**`src/pages/projects/ProjectForm.tsx`**

- Step 1 (Basic Info): `validate: () => form.validateFields(["name","code","description","status"])`
- Step 2 (Team): `validate: () => form.validateFields(["leadId"])`
- Step 3 (Environments): **leave as-is for now** — fixed in T32.
- Step 4 (Review): no validate — leave alone.

**`src/pages/defects/DefectForm.tsx`** — currently buggy, fix while migrating.

- Step 1: `validate: () => form.validateFields(["title","projectId","severity","priority"])`
- Step 2: `validate: () => form.validateFields(["description","stepsToReproduce"])`
- Step 3 (Assignment) and Step 4 (Review): no validate — leave alone.

**`src/pages/testplans/TestPlanForm.tsx`** — currently buggy, fix while migrating.

- Step 1: `validate: () => form.validateFields(["name","projectId","description"])`
- Step 2 (Test Cases): **leave as-is** — fixed in T32.
- Step 3 (Review): `validate: () => true` — leave alone.

**Login page (`src/pages/auth/Login.tsx`)** — uses `handleSubmit`, not step validation. No migration needed; verify still works post-refactor.

### 3. Update tests

`src/hooks/useForm.test.ts` already exists. Add tests for:

- `setField` with existing error → error re-evaluates (cleared if now valid, updated if still invalid).
- `setField` with no existing error → errors unchanged (no spurious keystroke validation).
- `validateFields(["a","b"])` when only `c` has errors → returns `true`, does not mark a/b touched *or at least* doesn't block advance (confirm semantics match the requirement above).
- `validateFields(["a"])` when `a` has an error → returns `false`, marks `a` touched, `errors.a` set.

### 4. Close T33

Delete the existing prompt file `.github/prompts/t33-useform-live-error-clearing.prompt.md` as part of this commit. Update `STATUS.md`: mark T33 as `✅ done` with a note "Folded into T34" and the same commit SHA.

### 5. Update documentation

Update `.github/instructions/architecture.instructions.md` § 9 "useForm Hook API" (around line 676):

- Extend the API listing to include `validateFields`.
- Add a short "Step validation pattern" note showing the one-liner.
- Add a short note under `setField` explaining the auto-clear behavior.

## What NOT to do

- ❌ Do NOT add Zod, Yup, or any schema validation library.
- ❌ Do NOT introduce per-step validator functions. One `validateFn` per form, always.
- ❌ Do NOT change `FormErrors<T>` shape or `UseFormReturn<T>` existing fields — only add `validateFields`.
- ❌ Do NOT touch dynamic-row state in ProjectForm Step 3 or TestPlanForm Step 2 — that's T32's job.
- ❌ Do NOT add `// removed` comments for the deleted dance code. Just delete it.
- ❌ Do NOT rewrite `handleSubmit` or `validate()` — they keep working as they do today.

## Acceptance Criteria

- `useForm.ts` exposes `validateFields` on `UseFormReturn<T>`.
- `setField` clears/updates the error for the changed field when one exists; leaves pristine fields alone.
- All six migrated step validates are one-liners using `form.validateFields([...])`.
- Clicking "Next" on an empty step in any of the three forms now shows inline errors under every required field for that step.
- Typing a valid value into a previously-errored field clears the error live.
- `npm run build` passes.
- `npm run test` passes; new `useForm.test.ts` cases added.
- `.github/prompts/t33-useform-live-error-clearing.prompt.md` deleted; STATUS.md updated for T33 and T34; prompt file moved to `done/`.
