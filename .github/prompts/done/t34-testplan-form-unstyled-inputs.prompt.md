# T34 — Bug: Unstyled Inputs in Test Plan Form (Test Case Wizard)

## Problem

In the Test Plan form wizard (step 2 — "Test Cases"), three fields render with **white background and white/dark text**, making them unreadable against the dark theme:

1. **Preconditions** — raw `<textarea>` with `className="input-field w-full"`
2. **Step Action** — raw `<input type="text">` with `className="input-field w-full"`
3. **Step Expected Result** — raw `<input type="text">` with `className="input-field w-full"`

### Root cause

The CSS class `input-field` **does not exist** in `src/index.css`. The correct custom class is `input-dark`, but the preferred fix is to replace these raw HTML elements with the project's existing styled components (`TextArea`, `TextInput`).

### Reproduction

1. Login → navigate to Test Plans → click "New Test Plan"
2. Fill step 1 (Plan Details) and click Next
3. Click "+ Add Test Case"
4. Observe: Preconditions textarea and Steps Action/Expected Result inputs are white/unstyled

## Fix

**File:** `src/pages/testplans/TestPlanForm.tsx`

### Preconditions (around line 472)

Replace the raw `<textarea>` with the `TextArea` component:

```tsx
// BEFORE (raw textarea, wrong class)
<div>
  <label className="block text-sm font-medium text-white mb-2">
    {t.common.preconditions}
  </label>
  <textarea
    data-testid={`testplan-form-case-${caseIdx}-preconditions`}
    value={testCase.preconditions}
    onChange={(e) => handleUpdateTestCase(caseIdx, "preconditions", e.target.value)}
    className="input-field w-full"
    rows={2}
  />
</div>

// AFTER (use TextArea component)
<TextArea
  data-testid={`testplan-form-case-${caseIdx}-preconditions`}
  name={`case-${caseIdx}-preconditions`}
  label={t.common.preconditions}
  value={testCase.preconditions}
  onChange={(e) => handleUpdateTestCase(caseIdx, "preconditions", e.target.value)}
  rows={2}
/>
```

### Step Action (around line 514) & Step Expected Result (around line 543)

Replace the raw `<input>` elements with `TextInput` components:

```tsx
// BEFORE
<input
  type="text"
  data-testid={`testplan-form-case-${caseIdx}-step-${stepIdx}-action`}
  placeholder={t.testPlanForm.placeholderAction}
  value={step.action}
  onChange={(e) => handleUpdateStep(caseIdx, stepIdx, "action", e.target.value)}
  className="input-field w-full"
/>

// AFTER
<TextInput
  data-testid={`testplan-form-case-${caseIdx}-step-${stepIdx}-action`}
  name={`case-${caseIdx}-step-${stepIdx}-action`}
  placeholder={t.testPlanForm.placeholderAction}
  value={step.action}
  onChange={(e) => handleUpdateStep(caseIdx, stepIdx, "action", e.target.value)}
/>
```

Same pattern for `expectedResult`.

## Constraints

- Do NOT add new CSS classes. Use the existing `TextArea` and `TextInput` components.
- Keep all existing `data-testid` attributes exactly as they are.
- Keep all existing error display logic intact.
- Verify the fix builds: `npm run build`.
