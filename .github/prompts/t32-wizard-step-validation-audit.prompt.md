---
mode: agent
agent: pages
description: "Audit & fix missing validation in Wizard step content (e.g. Environments step)"
---

# T32 — Audit & Fix Missing Wizard Step Content Validation Across the App

## Problem

In **Create Project → Step 3 (Environments)**, clicking "Add Environment" creates an empty environment row. If the user then clicks "Next" (or "Submit") without filling in the environment name/type, the Wizard **advances or submits** without showing any inline validation errors on the empty environment fields.

The `validateStep3` function in `ProjectForm.tsx` does check whether environments have names and types, but it only returns `false` — it does **not** show inline errors beneath the invalid fields, because:

1. Environment fields are not managed by `useForm` (they use local `useState`).
2. There is no `setFieldTouched` / `errors` mechanism for dynamically added rows.

## Context — Prior Art

T28 fixed a similar issue in `ProjectForm` Steps 1 & 2 where `setFieldTouched` was missing. That fix worked because Steps 1 & 2 use `useForm`-managed fields. Step 3's environment rows are **outside** `useForm`, so the same pattern doesn't directly apply.

Other forms in the app (`DefectForm`, `TestPlanForm`) may have similar patterns where dynamic/non-useForm content in Wizard steps lacks proper validation feedback.

## Scope — Two Steps

### Step 1: Analysis

Audit **every Wizard usage** in the app for steps that contain fields NOT managed by `useForm`. For each, record:

| File | Step | Fields | Managed by useForm? | Has validation? | Shows inline errors? |
| ---- | ---- | ------ | ------------------- | --------------- | -------------------- |

Check at minimum:

- `ProjectForm.tsx` — Step 3 (Environments), Step 4 (Review)
- `DefectForm.tsx` — all steps, especially any with dynamic content
- `TestPlanForm.tsx` — all steps, especially test case steps
- Any other Wizard usage in the app

### Step 2: Fix

For each step that validates but doesn't show errors:

- Add local error state for non-useForm fields.
- Render inline error `<p>` elements with proper `data-testid` attributes.
- Wire the step's `validate` function to set the error state before returning `false`.

## Requirements

1. Every Wizard step that validates must show inline errors when validation fails.
2. Error elements must have `data-testid` attributes following project conventions.
3. New test IDs must be registered in `src/shared/testIds.ts`.
4. Error messages must use i18n strings from `src/i18n/en.ts`.
5. Do NOT change what is considered valid/invalid — only add error display.
6. `npm run build` must pass.

## Known Affected

- `ProjectForm.tsx` → Step 3: empty environment name/type after "Add Environment" → no error shown, but Next is blocked.

## Acceptance Criteria

- Analysis table delivered listing all Wizard steps and their validation status.
- Every step that blocks navigation also shows inline error messages explaining why.
- All error elements have `data-testid` attributes.
