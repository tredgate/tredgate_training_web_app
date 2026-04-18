# T26 — Naming Review & Rename Pass

**Agent:** `@logic` (primary) with `@pages` handling page-specific files
**Depends on:** T19 ✅, T21 ✅

---

## Goal

Enforce the naming conventions defined in `.github/instructions/naming.instructions.md` across the scoped directories. Rename every violation — single-letter callback params, unclear abbreviations, ambiguous booleans — to its full, descriptive form.

**Before starting, read `.github/instructions/naming.instructions.md` in full.** That file is the source of truth for rules and exceptions. This prompt only covers execution.

---

## Scope

**In scope** (apply renames here):

- `src/pages/` — all files, all subdirectories
- `src/hooks/` — all files (excluding `.test.ts` files; see below)
- `src/data/` — all files

**Out of scope for this task** (do NOT touch):

- `src/components/` — deferred, those names are mostly fine from T18
- `src/` root files (`App.tsx`, `main.tsx`, `i18n/`, `shared/`) — deferred
- Any `.test.ts` / `.test.tsx` file — tests have their own naming idioms (`user`, `result`), we'll handle them separately if needed
- `node_modules/`, build output, Playwright test directories

If during the in-scope pass you spot a violation in an out-of-scope file that is imported by an in-scope file, flag it in the commit body or PR description — do NOT rename across the boundary.

---

## Phased execution

Run as **three commits**, one per directory, in this order:

1. **Phase 1 — `src/data/`**: smallest surface area, safest to start. Types, seed data, entity definitions.
2. **Phase 2 — `src/hooks/`**: next — hooks consume data types, so Phase 1 must land first. `useDashboardData.ts` is a known hotspot; the internal scope helper may have single-letter params that need renaming.
3. **Phase 3 — `src/pages/`**: largest — page files, page-local components (`_components/`), column factories (`_columns.tsx`). Most callback-heavy code lives here.

Between phases, run `npx tsc --noEmit` and `npm run test -- --run` to confirm nothing broke.

**Commit messages:**

- `refactor(naming): apply naming conventions to src/data`
- `refactor(naming): apply naming conventions to src/hooks`
- `refactor(naming): apply naming conventions to src/pages`

---

## Common violations to hunt

From a spot-check of the current codebase, you'll find (at minimum):

| Pattern                                             | Rename to                          |
| --------------------------------------------------- | ---------------------------------- |
| `projects.filter(p => ...)`                         | `projects.filter(project => ...)`  |
| `defects.find(d => ...)`                            | `defects.find(defect => ...)`      |
| `testPlans.filter(tp => ...)`                       | `testPlans.filter(testPlan => ...)`|
| `testRuns.map(r => ...)`                            | `testRuns.map(testRun => ...)`     |
| `users.find(u => ...)`                              | `users.find(user => ...)`          |
| `defect.history.map(h => ...)`                      | `defect.history.map(entry => ...)` |
| Variables like `h`, `tp`, `r`, `d` in local scope   | Full words                         |
| Booleans without `is`/`has` prefix (if any surface) | Add the prefix                     |

This list is indicative, not exhaustive. Read the files, apply the §2 rules from the instructions file to everything you see.

---

## Non-goals (do NOT do any of this)

- Do NOT change any `data-testid` value, route path, i18n key, or user-facing string. Renames are **identifier-level only**.
- Do NOT restructure files, split components, or move logic between files. Pure rename pass.
- Do NOT rename exported types or interfaces if they're imported from out-of-scope files — that ripples beyond scope. If a rename is locally justified but would cascade, leave it and note it.
- Do NOT rename `props`, `id`, `e`, `i`, `j`, `k`, or `_` where they match the §3 exception table in the instructions file.
- Do NOT add or remove comments while renaming. Stay focused.
- Do NOT touch `.test.ts` files.

---

## Done criteria

- [ ] Three commits landed in the order above.
- [ ] No single-letter callback params remain in `src/data/`, `src/hooks/`, `src/pages/` except those in the §3 exception table.
- [ ] No unclear abbreviations (`tp`, `h`, `req`, `resp`, `idx`, `cnt`) remain in scope.
- [ ] `npx tsc --noEmit` passes clean after each phase.
- [ ] `npm run build` succeeds.
- [ ] `npm run test -- --run` passes (171+ tests).
- [ ] Browser spot-check: dashboard, defects list, projects list, one detail page — all render identically to pre-refactor.
- [ ] `STATUS.md` row for T26 flipped to ✅ done with Phase 3's commit SHA.
- [ ] Prompt file `git mv`'d to `.github/prompts/done/`.

---

## Review handoff

After all three phases land, Vera will do a final naming-review pass against the §5 checklist in `naming.instructions.md`. Expect at least one follow-up commit for stragglers — that's normal, not a failure.
