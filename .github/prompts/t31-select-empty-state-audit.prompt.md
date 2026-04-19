# T31 — Audit & Fix Select Empty-State Mismatch Across the App

## Problem

In **Create Project → Step 2 (Team Assignment)**, the QA Lead `<select>` **visually displays** the first option (e.g. "Laura Lead") but the underlying form value (`form.values.leadId`) is an **empty string `""`**. If the user clicks "Next" without touching the dropdown, validation correctly rejects it — but the UI is misleading because it looks like a value is already selected.

This is a classic HTML `<select>` issue: when no `value` matches any option, the browser renders the first `<option>` as the displayed text, but the React controlled value remains empty.

## Root Cause

The `Select` component and/or the pages using it do not include a **placeholder/empty option** (e.g. `<option value="">— Select —</option>`) when the initial form value is empty. The browser defaults to showing the first real option, creating a mismatch between what the user sees and what the form holds.

## Scope — Two Steps

### Step 1: Analysis

Audit **every `<Select>` and `<combobox>`** usage across the entire app. For each one, record:

| File | Field | Initial value | Has placeholder option? | Mismatch possible? |
| ---- | ----- | ------------- | ----------------------- | ------------------ |

Focus on:

- All form pages: `ProjectForm.tsx`, `DefectForm.tsx`, `TestPlanForm.tsx`
- Detail pages with inline editing (e.g. role selects, status selects)
- Any `Select` component usage where the initial form value could be `""`, `null`, or `undefined`
- `MultiSelect` dropdowns (check if they have the same issue)

### Step 2: Fix

For every `<Select>` where the initial value can be empty:

- Add a disabled placeholder option: `<option value="" disabled>— Select —</option>` (or similar, using i18n).
- OR set the initial form value to a valid default that matches what the browser displays.

Choose the approach that best fits each case. **Prefer the placeholder option** — it's clearer to the user.

## Requirements

1. No `<Select>` field should display a value that doesn't match the form state.
2. Placeholder text should use i18n strings (add new keys if needed).
3. Do NOT change validation logic or form submission behaviour.
4. `npm run build` must pass.

## Known Affected

- `ProjectForm.tsx` → Step 2 → QA Lead select (initial value `""`, browser shows "Laura Lead").

## Acceptance Criteria

- Analysis table delivered listing all selects and their status.
- Every select with an empty initial value shows a placeholder instead of a real option.
- Validation still works correctly after the fix.
