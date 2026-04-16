# Task 18 — Component Cleanup (T3–T7 fixes)

> **Layer**: 2 (Shared Components) · **Depends on**: T3, T4, T5, T6, T7 (all ✅ done) · **Blocks**: T9–T14

## Objective

Fix the bugs and spec drifts found in the T3–T7 review. These were committed as one bulk commit (38fbc76) and have not yet been consumed by any page. Get the components aligned with their original prompt specs **before** T9–T14 start building on top of them.

This is a **cleanup task only**. Do not redesign, do not add features, do not "improve" anything that is not on this list. If you spot something else broken, append a note to STATUS.md and stop — do not silently expand scope.

## Scope — exactly these 7 fixes

### 🔴 Critical (must fix)

#### 1. `src/components/feedback/EmptyState.tsx` — realign API with T4 spec

The current implementation diverges from the spec on 4 counts. Restore the spec API:

```ts
import type { LucideIcon } from "lucide-react";

export type EmptyStateVariant =
  | "no-results"
  | "not-found"
  | "permission-denied"
  | "no-defects"
  | "no-projects"
  | "no-test-plans"
  | "no-users"
  | (string & {});

export interface EmptyStateProps {
  variant: EmptyStateVariant;          // REQUIRED, not optional
  icon?: LucideIcon;                   // optional
  title: string;
  message?: string;                    // optional
  action?: React.ReactNode;
  className?: string;
  // NOTE: no separate "data-testid" prop — testid is derived from variant
}
```

The rendered `data-testid` MUST be `empty-state-${variant}`, derived from the `variant` prop. Do **not** accept a separate `data-testid` prop.

When `icon` is omitted, render no icon block at all (don't render the empty grey circle). When `message` is omitted, render no `<p>` element at all.

Keep the existing styling (centered, py-12, dark theme).

#### 2. `src/components/navigation/Wizard.tsx` — back-button testid

Line ~118: change the back button's `data-testid` from `${testIdPrefix}-wizard-btn-prev` to `${testIdPrefix}-wizard-btn-back` (per T5 spec line 102).

#### 3. `src/components/data/DataTable.tsx` — selectable + onRowClick mutual exclusion bug

Line ~261, the row `onClick` handler currently reads:

```ts
onClick={() => !selectable && onRowClick && onRowClick(row)}
```

This disables row clicks entirely when `selectable={true}`. The intent (per T3 spec) was only that **clicking the checkbox cell** must not trigger row click — and that part is already handled correctly at the checkbox cell's `onClick={(e) => e.stopPropagation()}` (~line 277).

Fix: remove the `!selectable &&` guard so it becomes:

```ts
onClick={() => onRowClick && onRowClick(row)}
```

Also drop the `!selectable` check from the className conditional immediately below — `cursor-pointer` and `hover:bg-white/5` should apply whenever `onRowClick` is set, regardless of `selectable`.

### 🟡 Should fix

#### 4. `src/components/data/DataTable.tsx` — `keyField` prop is dead

The `keyField` prop is destructured (with default `"id"`) but never used anywhere in the render. Every row reference uses `row.id` directly.

Two acceptable options:
- **(a) Wire it up properly**: use `String(row[keyField])` for `key={}`, `data-testid` row/cell IDs, selection (`selectedIds`), `handleSelectAll`, `handleSelectRow`, etc. This requires generalising `selectedIds` from `Set<number>` to `Set<number | string>` and updating the `onSelectionChange` signature.
- **(b) Remove the prop entirely** if generalising feels out of scope — drop it from `DataTableProps`, drop the destructure.

**Pick (a)** — the spec called for it, and it's the right pedagogical signal. But if it spirals into a 200-line refactor, fall back to (b) and note in STATUS that `keyField` was removed for scope reasons.

#### 5. `src/components/data/DataTable.tsx` — empty state strips the toolbar

Lines ~168–177, the early-return when `sortedData.length === 0` replaces the entire component shell with a message div. This means when search/filters yield zero rows, the search input and filter dropdowns vanish — so the user can't clear their search to recover.

Fix: remove the early return. Always render the toolbar and the table shell. When `pageData.length === 0`, render a single `<tr><td colSpan={...}>{emptyMessage}</td></tr>` inside the existing `<tbody>` (centered, gray text). The pagination block can either stay or be hidden when there's no data — your call, but document the choice in a comment if you hide it.

#### 6. `src/shared/testIds.ts` — add missing builders from T4 spec

Append these helpers (T4 spec §3):

```ts
// ─── Modal builders ────────────────────────────────────────────────────
export const modalTitle = (testId: string): string => `${testId}-title`;
export const modalBtnClose = (testId: string): string => `${testId}-btn-close`;

// ─── EmptyState builder ────────────────────────────────────────────────
import type { EmptyStateVariant } from "../components/feedback/EmptyState";
export const emptyState = (variant: EmptyStateVariant): string =>
  `empty-state-${variant}`;
```

#### 7. `src/shared/testIds.ts` — tighten loose string types

Two builders accept `string` where the spec asked for narrower union types. Tighten them:

```ts
// Add the WizardAction type (re-export from Wizard.tsx or define here):
export type WizardAction = "next" | "back" | "cancel" | "submit";

// Tighten wizardBtn:
export const wizardBtn = (prefix: string, action: WizardAction): string =>
  `${prefix}-wizard-btn-${action}`;

// Tighten statusBadgeTestId — type and value together:
import type { BadgeType } from "../components/feedback/StatusBadge";
export const statusBadgeTestId = (
  prefix: string,
  type: BadgeType,
  value: string,
): string => `${prefix}-badge-${type}-${value}`;
```

(The `value` parameter stays `string` because the underlying union depends on `type`, and a discriminated builder is overkill for a test-ID helper. Tightening `type` is the high-value win — it would have caught the wizard `-btn-prev` regression.)

If `WizardAction` and `BadgeType` aren't already exported from their component files, export them.

## Verification Checklist

- [ ] `EmptyState` requires `variant`, `icon` and `message` are optional, testid = `empty-state-{variant}`
- [ ] Wizard back button has `data-testid` ending in `-wizard-btn-back`
- [ ] DataTable rows are clickable when `selectable && onRowClick` are both set; checkbox click still does NOT bubble to row click
- [ ] DataTable `keyField` either does what the prop name says, or is gone (with a STATUS note)
- [ ] DataTable shows empty-message inside the table body, with toolbar still visible and usable
- [ ] `testIds.ts` exports `modalTitle`, `modalBtnClose`, `emptyState`
- [ ] `testIds.ts` `wizardBtn` accepts only `WizardAction`; `statusBadgeTestId` `type` accepts only `BadgeType`
- [ ] `npm run build` (or equivalent TS check) passes with zero errors
- [ ] No new `any`, no `@ts-ignore`, no new `// eslint-disable`

## Do NOT

- Do NOT touch components that aren't on this list (Tabs, Modal, all forms, StatusBadge, StatCard, ActivityTimeline, UserAvatar, useStore, useForm — leave them alone).
- Do NOT rename existing exports or change unrelated function signatures.
- Do NOT consolidate / refactor / "clean up" code that wasn't called out.
- Do NOT add new features (no virtualization, no animations, no portals, no focus traps).
- Do NOT update existing tests beyond what these 7 fixes require.
- Do NOT change styling beyond what the EmptyState API change requires.
- Do NOT bulk-commit. Each numbered fix above is its own logical change. Acceptable groupings:
  - Commits 1+6 (EmptyState API + matching testIds builder)
  - Commit 2 (Wizard testid)
  - Commits 3+4+5 (DataTable: three fixes in same file)
  - Commit 7 (testIds tightening)
  - Or split further. **Never combine all into one commit.**

## Wrap-up

When all fixes are committed:

1. Update STATUS.md row T18 to `✅ done` with completion date and the **last** commit SHA in the series (note in the Notes column "split across N commits").
2. `git mv .github/prompts/t18-component-fixes.prompt.md .github/prompts/done/` in the same final commit.
3. Reply with: which fixes landed, which (if any) you decided to defer or change, and the commit SHAs in order.
