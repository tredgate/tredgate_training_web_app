# Debug Exercise Toggle — Teacher Cheat-Sheet

A single env var, `VITE_DEBUG_EXERCISE`, flips on four scattered breakages used to teach Playwright debugging. When unset (or anything other than `'true'`), the app behaves as on `main`.

## Enabling

- **Local dev:** `npm run dev:exercise` (cross-platform — uses `cross-env` under the hood, so it works on macOS, Linux, and Windows shells alike). Plain `npm run dev` runs the app with the toggle off.
- **Heroku:** add config var `VITE_DEBUG_EXERCISE=true` and trigger a redeploy. `heroku-postbuild` runs `vite build`, which bakes the var into the bundle. Flipping the var requires a fresh build — there is no runtime toggle. Plan for a redeploy between cohorts.

## The four breakages

1. **Renamed `data-testid`s** (`src/pages/projects/ProjectForm.tsx`, `src/pages/testplans/TestPlanForm.tsx`)
   - Five selectors swap to plausible-refactor names. Mapping:

   | Element | Original (off) | Renamed (debug mode) |
   | --- | --- | --- |
   | Project wizard — Project Name input | `project-form-input-name` | `project-form-name-field` |
   | Project wizard — QA Lead select | `project-form-select-lead` | `project-form-lead-dropdown` |
   | Test Plan wizard — Plan Name input | `testplan-form-input-name` | `testplan-form-name-field` |
   | Test Plan wizard — Project select | `testplan-form-select-project` | `testplan-form-project-dropdown` |
   | Test Plan wizard — "Add Test Case" button | `testplan-form-btn-add-case` | `testplan-form-add-case-btn` |

   - Student symptom: `locator.fill()` or `locator.click()` times out with "no element matches selector".

2. **Extra wizard step** (`src/pages/projects/ProjectForm.tsx`)
   - A "Tags" step is inserted between Team Assignment and Environments.
   - Student symptom: tests that click Next a fixed number of times land on the wrong step; assertions on `wizard-step-3` content (Environments) hit the new Tags step instead.

3. **Test plan post-create redirect** (`src/pages/testplans/TestPlanForm.tsx`)
   - After creating a plan, the user lands on `/test-plans` (the list) instead of `/test-plans/:id` (the detail page).
   - Student symptom: `expect(page).toHaveURL(/\/test-plans\/\d+/)` fails because the URL is now just `/test-plans`.

4. **Test case Description becomes required** (`src/pages/testplans/TestPlanForm.tsx`)
   - `validateStep2()` now also checks that each test case's description is non-empty. When the toggle is off, only name and steps are validated (current behavior).
   - Student symptom: filling out the test case wizard without a description means clicking "Next" silently fails — the wizard stays on the test cases step and a "Description is required" message appears under the description input. Tests that expect navigation past this step will fail at the next URL or visibility assertion.

## Searching the code

Each file with a breakage reads the env var as a module-level const:

```ts
const DEBUG_EXERCISE = import.meta.env.VITE_DEBUG_EXERCISE === "true";
```

There is no central registry. Greppping for `DEBUG_EXERCISE` finds all conditional sites.
