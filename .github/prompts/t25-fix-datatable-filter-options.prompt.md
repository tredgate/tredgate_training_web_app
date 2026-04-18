# T25 — Fix DataTable Filter Options: Support `{value, label}` Objects

## Bug Report

**Page:** `/defects`  
**Error:** `Objects are not valid as a React child (found: object with keys {value, label})`

The Defects page crashes at runtime because the `projectId` filter passes `{ value, label }[]` objects to `DataTable`, which expects `readonly string[]`.

---

## Root Cause Analysis

### `FilterConfig` in `src/components/data/DataTable.tsx`

```ts
export interface FilterConfig {
  key: string;
  label: string;
  options: readonly string[];   // ← only plain strings accepted
}
```

### Render in DataTable

```tsx
{filter.options.map((opt) => (
  <option key={opt} value={opt}>
    {opt}   {/* ← crashes if opt is an object */}
  </option>
))}
```

### Call-site in `src/pages/defects/DefectList.tsx`

```ts
const projectOptions = projects.map((p) => ({
  value: String(p.id),
  label: p.name,
}));

// passed as:
options: projectOptions as any   // ← bypasses type check, crashes at runtime
```

The same `{value, label}` shape is almost certainly used in other page filter configurations too (check `ProjectList`, `TestPlanList`, etc.).

---

## Fix

### Step 1 — Extend `FilterConfig` to accept both shapes

In `src/components/data/DataTable.tsx`, change `FilterConfig.options` to accept either plain strings or `{ value: string; label: string }` objects:

```ts
export type FilterOption = string | { value: string; label: string };

export interface FilterConfig {
  key: string;
  label: string;
  options: readonly FilterOption[];
}
```

### Step 2 — Update the filter render to handle both shapes

```tsx
{filter.options.map((opt) => {
  const value = typeof opt === "string" ? opt : opt.value;
  const label = typeof opt === "string" ? opt : opt.label;
  return (
    <option key={value} value={value}>
      {label}
    </option>
  );
})}
```

### Step 3 — Update the active-filter comparison

The filter comparison uses `String(row[filterKey])`. For `projectId` this already produces the correct string (`"1"`, `"2"`, etc.) because `String(p.id)` was used to build `value`. Verify this still works correctly after the change — no edit needed unless a test fails.

### Step 4 — Remove `as any` casts in call-sites

After the type change, `projectOptions` will type-check correctly without `as any`. Remove the cast in `DefectList.tsx` and any other page that uses `as any` for filter options.

### Step 5 — Audit other pages for the same pattern

Check `ProjectList.tsx`, `TestPlanList.tsx`, and any other page that passes a `FilterConfig`. If they use plain string arrays (`DEFECT_SEVERITIES`, etc.) those are fine as-is. Only `{value, label}` objects need to be verified.

---

## Constraints

- Only change `DataTable.tsx` (the component contract), `DefectList.tsx`, and any other page with a `{value, label}` filter option. Do NOT touch unrelated files.
- Export `FilterOption` from `DataTable.tsx` so call-sites can import the type if needed.
- Do NOT change the existing plain-string filter behaviour — `DEFECT_SEVERITIES as any` should continue to work (or remove the `as any` now that the type accepts both shapes).
- Build must pass. All existing tests must pass.

## Acceptance

```bash
# App loads without error at http://localhost:5173/defects
npm run build       # exits 0
npm run test -- --run  # all tests pass
npx tsc --noEmit    # exits 0 (excluding pre-existing test-file errors in T24)
```

Commit implementation + STATUS.md update + `git mv` of this prompt to `done/` in one atomic commit.
