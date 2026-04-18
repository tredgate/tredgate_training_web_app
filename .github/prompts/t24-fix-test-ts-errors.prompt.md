# T24 — Fix TypeScript Errors in Test Files

## Goal

Resolve the 56 TypeScript compilation errors that remain in the two unit-test files after T16 and T21. `npx tsc --noEmit` must exit 0 when complete.

---

## Files to fix

### 1. `src/data/store.test.ts` — 52 errors

**Root cause A — TS2345: `"tqh_test"` not assignable to `EntityKey`**

The test uses a synthetic key `"tqh_test"` to avoid polluting real storage keys. `EntityKey` is a closed union in `src/data/entities.ts`:

```ts
export type EntityKey =
  | "tqh_users"
  | "tqh_projects"
  | "tqh_defects"
  | "tqh_test_plans"
  | "tqh_test_runs";
```

**Fix:** Cast every `"tqh_test"` literal to `EntityKey` using `"tqh_test" as EntityKey`. Apply this cast at every call-site — do NOT widen `EntityKey` itself, as other code depends on the closed union for exhaustiveness checks.

**Root cause B — TS2532: Object is possibly `'undefined'`**

Occurs when indexing into arrays retrieved from the store (e.g. `items[0]`, `result[1]`) without a null guard.

**Fix:** Use non-null assertion (`!`) at each affected location — these are unit tests asserting a known precondition, so `!` is appropriate here. Do not add `if` guards that would silently pass a broken assertion.

Affected lines (approximate): 60, 61, 111, 179, 240, 283, 347, 362, 363, 364.

---

### 2. `src/utils/workflow.test.ts` — 4 errors

**Root cause — TS18048: `'newEntry'` is possibly `'undefined'`**

```ts
const newEntry = updated.history[updated.history.length - 1];
expect(newEntry.userId).toBe(1); // TS18048
expect(newEntry.action).toBe("Assign");
expect(newEntry.fromStatus).toBe("new");
expect(newEntry.toStatus).toBe("assigned");
```

Array index access returns `T | undefined` under `noUncheckedIndexedAccess`.

**Fix:** Add a non-null assertion on `newEntry`:

```ts
const newEntry = updated.history[updated.history.length - 1]!;
```

Affected lines: 182–185 (the four `expect` lines referencing `newEntry`).

---

## Constraints

- Do **not** change `EntityKey` in `src/data/entities.ts`.
- Do **not** add runtime type guards inside tests — use `!` assertions.
- Do **not** touch any `src/` production file other than the two test files listed above.
- All existing tests must continue to pass after the fix (`npm run test -- --run`).
- `npm run build` must still succeed.

## Acceptance

```bash
npx tsc --noEmit     # exits 0
npm run test -- --run  # all tests pass
npm run build          # build succeeds
```

Then update STATUS.md (T24 → ✅ done) and commit everything — implementation + STATUS.md update + `git mv` of this prompt to `done/` — in **one** atomic commit.
