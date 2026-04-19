---
mode: agent
agent: foundation
description: "Document validation patterns + warn agents about dynamic-row fields outside useForm"
---

# T35 — Validation Docs & Agent Warning for Dynamic Rows

## Prerequisite

**T34 and T32 must both be merged before this task runs.** This task *documents* the patterns those tasks established. Writing docs before the code lands risks describing API that might still shift.

## Why

The app has shipped five validation-related bugs (T28, T29, T32, T33, and the DefectForm/TestPlanForm step-1 bugs found during the T32 audit). All traced to the same root cause: the `useForm` API didn't make the correct pattern obvious, and dynamic rows outside `useForm` had no documented pattern at all.

T34 hardened `useForm`. T32 established the dynamic-row pattern. This task *writes it down* so the next downstream agent adding a form doesn't recreate the same bugs.

## Scope

### 1. Update `.github/instructions/architecture.instructions.md`

Locate § 9 "useForm Hook API" (currently around line 676).

**Rewrite the API block** to match the new surface:

- Document `validateFields(fields: Array<keyof T>): boolean` alongside the existing methods.
- Under `setField`, add a one-line note: "If the field currently has an error, re-runs validation for that field and updates / clears its error immediately. Pristine fields are not validated on keystroke."
- Under `handleSubmit`, confirm it marks **all** fields touched (so errors display on blank submit).

**Add a "Step validation pattern" subsection** (under the API block):

- Show the one-liner: `validate: () => form.validateFields(["name","code","description"])`.
- Explain: one `validateFn` per form (the one passed to `useForm`), never per-step validators. `validateFields` filters the results to the fields listed.
- Explicitly mark the old "manual `setFieldTouched` + `form.validate()` dance" as **deprecated** — if any downstream agent proposes that pattern, it's wrong.

**Add a new subsection: "Dynamic rows outside useForm"** (new content, likely placed right after the useForm API block):

- State clearly: fields in arrays that the user adds/removes (environments in ProjectForm, test cases + steps in TestPlanForm) are **not** managed by `useForm`. They live in local `useState`.
- Reason: `useForm` intentionally does not support field arrays — that would double the API surface for a 3-form app.
- Required pattern, bullet-pointed:
  1. Store row errors in a parallel `useState` array (one entry per row, shape matches row fields).
  2. Step `validate` must populate that error state **before** returning `false`.
  3. Render errors: reuse shared form components' `error` prop where possible (TextInput / Select already render `<p data-testid={`${testId}-error`}>`). For raw `<input>` elements, render the `<p>` inline yourself with the same `text-red-400 text-sm mt-1` classes.
  4. On field change (and on row add/remove), clear the corresponding error entry — mirrors `useForm.setField` auto-clear.
  5. Register all new testIds in `src/shared/testIds.ts` following the `{field-testid}-error` convention.
- Point to ProjectForm Step 3 and TestPlanForm Step 2 as the reference implementations (include the file paths; do **not** paste code — the code is the source of truth).

### 2. Update `.github/agents/pages.agent.md`

Add a short "Form validation" section (or expand an existing one) with an **explicit warning** pitched at a downstream agent reading this fresh:

> When adding or modifying a form:
>
> - **useForm-managed fields**: step `validate` must be a one-liner using `form.validateFields([...])`. Never manually call `form.setFieldTouched` + `form.validate()` — that's the old pattern and it's been the source of four shipped bugs.
> - **Dynamic rows (user-added arrays)**: these are NOT in `useForm`. You must add parallel error state, populate it in the step `validate`, render errors under each row field, and clear errors on field change. See architecture doc § "Dynamic rows outside useForm" and the reference implementations in `ProjectForm.tsx` Step 3 and `TestPlanForm.tsx` Step 2.
> - If a form compiles and `validate` returns `false` but no error appears in the UI, **you've hit the dynamic-row trap** — check whether the failing field is in `useForm` or in local `useState`.

Keep it terse and actionable — this is a warning, not a tutorial.

### 3. Update `.github/agents/logic.agent.md` (if it mentions useForm)

Only if the current file references `useForm` or validation: update the API shape to match the new surface. Do not add content where none exists.

## What NOT to do

- ❌ Do NOT create new documentation files. All edits go into existing files listed above.
- ❌ Do NOT copy code blocks from T32/T34 into the docs. Reference the files; let the code be the source of truth.
- ❌ Do NOT change `CLAUDE.md` (Vera's persona is separate from the architecture).
- ❌ Do NOT rewrite unrelated sections of `architecture.instructions.md`. Only §9 + the new dynamic-rows subsection.
- ❌ Do NOT add a "changelog" or "migration notes" section — agents read this doc fresh each time, they don't need history.

## Acceptance Criteria

- `architecture.instructions.md` §9 documents the current `useForm` API (including `validateFields` and the auto-clear `setField` behavior).
- A new "Dynamic rows outside useForm" subsection exists, pointing to the two reference implementations.
- `pages.agent.md` contains an explicit warning block for downstream agents.
- No new files created; no code blocks duplicated.
- A downstream agent reading only these files can implement a new form (static + dynamic rows) correctly, without reading the prompt history.
