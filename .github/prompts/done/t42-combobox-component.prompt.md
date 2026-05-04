# T42 — Combobox Component (Multi-Select with Search)

## Context

The app currently has `src/components/forms/MultiSelect.tsx` — a checkbox dropdown with no search capability. When option lists are long (e.g. test cases in a project), users need to be able to type to filter.

This task adds a new `Combobox` component that behaves identically to `MultiSelect` but includes a live search/filter input at the top of the dropdown. After creating the component, replace the `MultiSelect` usage in `DefectForm.tsx` (the `selectTestCases` field) with `Combobox`.

**Do NOT replace the other two `MultiSelect` usages** (`ProjectForm.tsx` → `selectMembers`, `UserDetail.tsx`) — those lists are short enough that search is not needed. Leave them as `MultiSelect`.

---

## Architecture Rules (non-negotiable)

- No new runtime dependencies. No external UI libraries.
- Tailwind utility classes only. Match the visual style of `MultiSelect.tsx` exactly.
- TypeScript strict mode. No `any`, no `@ts-ignore`.
- Every interactive element must have a `data-testid` wired to `TEST_IDS`.
- Follow the existing pattern: one component per file, default export, props interface named `ComboboxProps`.

---

## 1. Create `src/components/forms/Combobox.tsx`

### Props interface

The props must be **identical to `MultiSelectProps`** from `MultiSelect.tsx` — same field names and types. This allows a drop-in swap at usage sites.

```ts
export interface ComboboxProps {
  "data-testid": string;
  label: string;
  name: string;
  value: string[];
  onChange: (selectedValues: string[]) => void;
  options: SelectOption[]; // re-export from this file (same shape as MultiSelect)
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}
```

### Behaviour

1. **Trigger button** — shows `"N selected"` or the placeholder text. Has a `ChevronDown` icon (from `lucide-react`) that rotates when open. Matches `MultiSelect` button styling.
2. **Dropdown panel** — opens below the trigger, `z-10`, `glass` CSS class, `border border-white/10`, `max-h-64 overflow-y-auto`.
3. **Search input** — first element inside the dropdown. A plain `<input type="text">` with:
   - `placeholder="Search..."`
   - `data-testid={testId + "-search"}`
   - `className="input-dark text-sm mb-2"` (matches other inputs)
   - Clears automatically when the dropdown is closed.
4. **Filtered option list** — case-insensitive substring match on `opt.label` against the current search string.
5. **No results state** — if the filtered list is empty, render:
   ```tsx
   <p
     data-testid={`${testId}-no-results`}
     className="text-sm text-gray-500 px-2 py-1.5"
   >
     No results
   </p>
   ```
6. **Option items** — identical markup to `MultiSelect`: `data-testid={testId + "-option-" + opt.value}`, checkbox + label text.
7. **Click-outside closes** — same `useRef` + `useEffect` pattern as `MultiSelect.tsx`.
8. **Focus search on open** — use `useEffect` to focus the search `<input>` automatically when `isOpen` becomes `true`. Use a `useRef<HTMLInputElement>` for the search input.

### data-testid structure

| Element            | testId value                  |
| ------------------ | ----------------------------- |
| Label `<label>`    | `{testId}-label`              |
| Trigger `<button>` | `{testId}`                    |
| Dropdown `<div>`   | `{testId}-dropdown`           |
| Search `<input>`   | `{testId}-search`             |
| No-results `<p>`   | `{testId}-no-results`         |
| Option `<label>`   | `{testId}-option-{opt.value}` |
| Error `<p>`        | `{testId}-error`              |

---

## 2. Update `src/shared/testIds.ts`

Add two new entries to the `defectForm` section (they already exist implicitly via the pattern, but must be registered):

```ts
defectForm: {
  // ... existing entries ...
  selectTestCasesSearch: "defect-form-select-test-cases-search",
  selectTestCasesNoResults: "defect-form-select-test-cases-no-results",
}
```

> Note: The trigger already has `selectTestCases: "defect-form-select-test-cases"` and the label will be `"defect-form-select-test-cases-label"` — those are already registered. Only add the two new ones.

---

## 3. Update `src/pages/defects/DefectForm.tsx`

Replace **only** the `selectTestCases` field:

```tsx
// REMOVE:
import MultiSelect from "../../components/forms/MultiSelect";
// ADD (keep MultiSelect import ONLY if still used elsewhere in this file — it is not):
import Combobox from "../../components/forms/Combobox";
```

Replace the `<MultiSelect ... data-testid={TEST_IDS.defectForm.selectTestCases} />` with `<Combobox>` using the **exact same props** — the API is identical.

---

## 4. Verification checklist

Before finishing, verify:

- [ ] `Combobox.tsx` compiles with `npx tsc --noEmit` — zero errors
- [ ] `npm run build` succeeds — zero errors
- [ ] Search input auto-focuses when dropdown opens
- [ ] Typing filters the list in real time
- [ ] Clicking outside closes the dropdown and clears the search
- [ ] Selecting/deselecting options calls `onChange` correctly
- [ ] `data-testid` attributes are present on all elements listed in the table above
- [ ] `MultiSelect` is still used in `ProjectForm.tsx` and `UserDetail.tsx` (untouched)
- [ ] `DefectForm.tsx` no longer imports `MultiSelect`

---

## Commit

Commit all changes in one atomic commit with message:

```
feat(ui): add Combobox with search, replace MultiSelect in DefectForm selectTestCases
```

Update `STATUS.md`: set T42 to `✅ done`, fill Completed date and commit SHA.
Do NOT move this prompt file to `done/` — the orchestrator handles that.
