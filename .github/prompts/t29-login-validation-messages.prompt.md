---
mode: agent
agent: pages
description: "Bug: Login page empty fields show no validation messages"
---

# T29 — Bug: Login Page Empty Fields — No Validation Messages

## Problem

On the Login page, submitting the form with **both fields empty** produces no inline validation error messages. The user gets no feedback — the form just silently does nothing.

Expected behaviour: inline error messages appear beneath each empty field (e.g. "Username is required", "Password is required"), matching the pattern used elsewhere in the app (form fields show `<p>` error elements when validation fails).

## Steps to Reproduce

1. Navigate to `/login`.
2. Leave username and password fields empty.
3. Click "Sign In".
4. Observe: no error messages appear, no toast, nothing happens.

## Fix

Add client-side validation to the Login form so that submitting with empty fields renders inline error messages beneath each invalid field. Follow the same `useForm` + `touched`/`errors` pattern used in `ProjectForm`, `DefectForm`, and `TestPlanForm`.

## Requirements

1. Empty username → inline error beneath the username field.
2. Empty password → inline error beneath the password field.
3. Error messages must use i18n strings from `src/i18n/en.ts` (add new keys if needed).
4. Error `<p>` elements must have `data-testid` attributes following the existing `{field-testid}-error` convention (e.g. `login-input-username-error`, `login-input-password-error`).
5. Do not change the authentication logic or any other Login page behaviour.
6. `npm run build` must pass.

## Acceptance Criteria

- Submitting with empty fields shows inline errors.
- Entering valid credentials still logs in successfully.
- All error elements have correct `data-testid` attributes.
