---
mode: agent
agent: pages
description: "Add inline error display for dynamic-row fields in ProjectForm Step 3 & TestPlanForm Step 2"
---

# T32 — Dynamic Row Validation Errors (ProjectForm Environments, TestPlanForm Test Cases)

## Prerequisite

**T34 must land first.** T34 hardens `useForm` with `validateFields` and live error clearing. This task applies the same *spirit* (clear errors on edit, display errors where they apply) to dynamic rows, which `useForm` does NOT manage.

## Problem

Two Wizard steps contain dynamic, user-added rows that live in local `useState` (not `useForm`). When a user clicks "Next" or "Submit" with invalid/missing row data, the step's `validate()` returns `false` — so the Wizard refuses to advance — but **no inline error is shown**, because there is no error state or error UI for those fields.

Affected:

1. **`ProjectForm.tsx` Step 3 (Environments)** — `environments` array in `useState`. Currently rejects empty list and rows with empty `name`/`type`, silently.
2. **`TestPlanForm.tsx` Step 2 (Test Cases)** — `testCases` array with nested `steps` array, both in `useState`. Currently rejects empty list, empty test-case `name`, cases with no steps, and steps with empty `action`/`expectedResult`, silently.

## Scope

### 1. ProjectForm Step 3 — Environments

**State.** Add a per-row error state alongside `environments`:

```ts
const [envErrors, setEnvErrors] = useState<
  Array<{ name?: string; type?: string }>
>([]);
const [envListError, setEnvListError] = useState<string | null>(null);
```

**Validation.** Rewrite `validateStep3` to compute errors, set them, and return a boolean:

- If `environments.length === 0` → set `envListError` to i18n string "At least one environment is required"; clear per-row errors; return `false`.
- Else → for each env, record `{ name: "Environment name is required" }` if name empty, `{ type: "Environment type is required" }` if type empty. Clear `envListError`. Return `true` iff no row has an error.

**Rendering.**

- When `envListError` is set, render a `<p data-testid="project-form-envs-error" className="text-red-400 text-sm">` at the top of the step (above the empty state or the rows).
- For each row, pass the per-row errors into the `<TextInput>` / `<Select>` components via their existing `error` prop. Those components already render the error `<p>` with testid `{inputTestId}-error`. **Do not add separate `<p>` tags** — reuse the form-component error slot.
- When a row field changes via `handleEnvironmentChange`, clear that field's error for that row (same spirit as `useForm.setField` auto-clear).

**Test IDs.** Register `projectForm.envsError: "project-form-envs-error"` in `src/shared/testIds.ts`. Per-row input errors already follow `project-form-env-name-${idx}-error` etc. via the form components — no new IDs for those.

**i18n.** Add to `src/i18n/en.ts` under `projectForm`:

```ts
validateEnvsRequired: "At least one environment is required",
validateEnvNameRequired: "Environment name is required",
validateEnvTypeRequired: "Environment type is required",
```

### 2. TestPlanForm Step 2 — Test Cases

**State.** Add error state for the three shapes of failure — list-level, case-level, step-level:

```ts
const [testCaseListError, setTestCaseListError] = useState<string | null>(null);
const [testCaseErrors, setTestCaseErrors] = useState<
  Array<{ name?: string; steps?: string }>
>([]);
const [stepErrors, setStepErrors] = useState<
  Array<Array<{ action?: string; expectedResult?: string }>>
>([]);
```

(`testCaseErrors[i].steps` is a message for "this case has no steps"; per-step field errors live in `stepErrors[caseIdx][stepIdx]`.)

**Validation.** Rewrite `validateStep2`:

- If `testCases.length === 0` → set `testCaseListError` to i18n "At least one test case is required"; return `false`.
- Else, for each case: check name, check `steps.length > 0`, for each step check `action` and `expectedResult`. Populate the three error arrays. Return `true` iff no case and no step has any error.

**Rendering.**

- `testCaseListError` → `<p data-testid="testplan-form-cases-error">` above the `btnAddCase` button.
- Case `name` error → pass into `<TextInput data-testid={`testplan-form-case-${caseIdx}-name`} error={...}>`.
- Case `steps` error ("at least one step required") → `<p data-testid={`testplan-form-case-${caseIdx}-steps-error`}>` above the steps list.
- Step `action` / `expectedResult` errors — these inputs are raw `<input>`, not the shared `TextInput`. Render inline `<p data-testid={`testplan-form-case-${caseIdx}-step-${stepIdx}-action-error`}>` / `-expected-error` directly below each input (inside the flex container). Keep styling `text-red-400 text-sm mt-1` to match the shared components.
- When a row/step field changes via `handleUpdateTestCase` / `handleUpdateStep`, clear that field's error. When a test case or step is removed, slice the corresponding error array entry.

**Test IDs.** Add to `src/shared/testIds.ts`:

```ts
// in TEST_IDS.testplanForm:
casesError: "testplan-form-cases-error",

// new builders:
export const testplanFormCaseStepsError = (caseIndex: number): string =>
  `testplan-form-case-${caseIndex}-steps-error`;
export const testplanFormStepActionError = (
  caseIndex: number, stepIndex: number,
): string => `testplan-form-case-${caseIndex}-step-${stepIndex}-action-error`;
export const testplanFormStepExpectedError = (
  caseIndex: number, stepIndex: number,
): string => `testplan-form-case-${caseIndex}-step-${stepIndex}-expected-error`;
```

**i18n.** Add to `src/i18n/en.ts` under `testPlanForm`:

```ts
validateCasesRequired: "At least one test case is required",
validateCaseNameRequired: "Test case name is required",
validateCaseStepsRequired: "At least one step is required",
validateStepActionRequired: "Action is required",
validateStepExpectedRequired: "Expected result is required",
```

### 3. Do NOT touch

- ❌ `useForm.ts` — T34 already did everything that hook needs. Don't add field-array support.
- ❌ DefectForm — all its fields live in `useForm`, already covered by T34.
- ❌ Validation *rules* (what counts as valid/invalid). Only the *display* of errors changes.
- ❌ Styling beyond reusing `text-red-400 text-sm mt-1` to match shared form components.

## Acceptance Criteria

- Clicking "Next" on ProjectForm Step 3 with 0 environments → list-level error visible.
- Clicking "Next" with a row that has an empty name → inline error under that row's name input (via shared component's error slot).
- Editing the offending field clears its error live.
- Same three behaviors for TestPlanForm Step 2 at list, case, and step level.
- All new error elements have `data-testid` attributes registered in `testIds.ts`.
- All new error messages come from `src/i18n/en.ts`.
- `npm run build` passes.
