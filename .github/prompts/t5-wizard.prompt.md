# Task 5 — MultiStepWizard Component

> **Layer**: 2 (Shared Components) · **Depends on**: T1 (testIds.ts), T2 (app shell) · **Parallelizable** with T3, T4, T6, T7

## Objective

Build the `Wizard` component — a multi-step form wizard with step indicator, next/back/cancel navigation, per-step validation, and a review step pattern. Used by ProjectForm, DefectForm, and TestPlanForm.

This is the key component for demonstrating **Fluent Interface** in test automation (`.fillTitle().nextStep().selectSeverity().nextStep().review().submit()`).

## Constraints

- Follow architecture §9 (Wizard Props) for the API.
- All `data-testid` from `src/shared/testIds.ts` using `testIdPrefix`.
- Dark theme — glass card, neon purple accent for active/completed steps.
- Fully controlled step content — wizard manages step navigation, each step's content is a React node.

## File to Create

### `src/components/navigation/Wizard.tsx`

#### Props (per architecture §9)

```ts
export interface WizardStep {
  label: string;
  content: React.ReactNode;
  validate?: () => boolean;
}

export interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;       // called when user clicks "Submit" on last step
  onCancel: () => void;         // called when user clicks "Cancel"
  testIdPrefix: string;         // prefix for all data-testid values
  className?: string;
}
```

#### Internal State

- `currentStep` (number, 0-based index)

#### Behavior

1. **Step indicator**: Horizontal bar at the top showing all step labels. Steps are color-coded:
   - Completed: neon-purple background, white text, checkmark icon
   - Current: neon-purple border/ring, white text
   - Upcoming: gray background, gray text
   - Steps connected by lines (purple if completed, gray if not)

2. **Navigation**:
   - **Next**: Calls `steps[currentStep].validate()` if provided. If it returns `false`, do NOT advance (validation errors should be shown by the step content itself). If it returns `true` or no `validate` is defined, advance to next step.
   - **Back**: Go to previous step. Always allowed (no validation on back).
   - **Cancel**: Call `onCancel`. Always available.
   - **Submit**: On the last step, "Next" becomes "Submit" and calls `onComplete`.

3. **Step content**: Render `steps[currentStep].content`. Only the current step is rendered (not all steps).

4. **Button states**:
   - "Back" hidden on first step
   - "Next" / "Submit" always visible
   - "Cancel" always visible

#### Rendered Structure

```html
<div data-testid="{prefix}-wizard" class="glass overflow-hidden">

  <!-- Step Indicator -->
  <div data-testid="{prefix}-wizard-step-indicator" class="px-6 py-4 border-b border-white/10">
    <div class="flex items-center justify-between">
      {steps.map((step, i) => (
        <>
          <div data-testid="{prefix}-wizard-step-{i+1}"
               class="flex items-center gap-2 {colorClasses}">
            <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold {bgClasses}">
              {completed ? "✓" : i+1}
            </span>
            <span class="text-sm font-medium hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && <div class="flex-1 h-px mx-2 {lineColor}" />}
        </>
      ))}
    </div>
  </div>

  <!-- Step Content -->
  <div data-testid="{prefix}-wizard-content" class="p-6">
    {steps[currentStep].content}
  </div>

  <!-- Footer / Actions -->
  <div class="flex justify-between items-center px-6 py-4 border-t border-white/10">
    <button data-testid="{prefix}-wizard-btn-cancel"
            class="btn-ghost"
            onClick={onCancel}>
      Cancel
    </button>
    <div class="flex gap-3">
      {currentStep > 0 && (
        <button data-testid="{prefix}-wizard-btn-back"
                class="btn-neon-blue"
                onClick={goBack}>
          Back
        </button>
      )}
      <button data-testid="{prefix}-wizard-btn-{isLast ? 'submit' : 'next'}"
              class="btn-neon-purple"
              onClick={isLast ? onComplete : goNext}>
        {isLast ? "Submit" : "Next"}
      </button>
    </div>
  </div>
</div>
```

### `src/shared/testIds.ts` — Extend

Add wizard test ID builders:

```ts
// Wizard builders — prefix is the testIdPrefix prop
export type WizardAction = "next" | "back" | "cancel" | "submit";

export const wizardTestId = (prefix: string): string => `${prefix}-wizard`;
export const wizardStep = (prefix: string, stepNumber: number): string =>
  `${prefix}-wizard-step-${stepNumber}`;
export const wizardBtn = (prefix: string, action: WizardAction): string =>
  `${prefix}-wizard-btn-${action}`;
```

## Verification Checklist

- [ ] Step indicator shows all step labels with correct numbering
- [ ] Current step highlighted with neon-purple ring
- [ ] Completed steps show checkmark with neon-purple background
- [ ] Upcoming steps are grayed out
- [ ] Connector lines between steps colored correctly (purple for completed, gray otherwise)
- [ ] "Next" advances to next step when `validate()` returns true or is undefined
- [ ] "Next" does NOT advance when `validate()` returns false
- [ ] "Back" returns to previous step (no validation)
- [ ] "Back" button hidden on first step
- [ ] "Cancel" calls `onCancel` from any step
- [ ] Last step shows "Submit" instead of "Next"
- [ ] "Submit" calls `onComplete`
- [ ] Only current step content is rendered
- [ ] All elements have correct `data-testid` with `testIdPrefix`
- [ ] Component accepts `className` prop

## Do NOT

- Do not persist step state to localStorage
- Do not add step animation/transitions between steps
- Do not add "Skip" functionality
- Do not render multiple steps simultaneously (only current)
- Use TypeScript (strict) per architecture §16b — `WizardProps` interface, `WizardStep` type for step config. No PropTypes, no JSDoc, no `any`.
