# T22 — Discussion: Defect Status Colors — Component or CSS?

**Agent:** `@orchestrator` (discussion + decision only)
**Depends on:** T7 ✅, T11 ✅

---

## Context

`StatusBadge.tsx` currently holds a `COLORS` constant — a nested object that maps badge type → value → Tailwind utility string. Example:

```ts
const COLORS: Record<BadgeType, Record<string, string>> = {
  status: {
    new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    // …
  },
  severity: { … },
};
```

The question is whether this is the right place and form for these color definitions.

---

## Options to evaluate

### Option A — Keep as-is (inline in component)

**Pros:**

- Self-contained: all badge logic in one file.
- Type-safe: TypeScript enforces valid badge types.
- Tailwind's JIT scanner sees the full class strings statically.
- Easy to find: "where is `in_progress` blue defined?" → one file.

**Cons:**

- Tailwind class strings are duplicated (same palette used in other ad-hoc places).
- Adding a new status requires touching the component.
- Mixing semantic meaning (status = amber) with visual presentation.

---

### Option B — CSS custom properties / `index.css` semantic classes

Define Tailwind `@layer components` classes like `.badge-status-new`, `.badge-severity-critical`, etc.

**Pros:**

- Separation of concerns: colors are a styling concern, not a logic concern.
- A designer can theme the app by editing one CSS file.
- No Tailwind JIT purging concern.

**Cons:**

- Lose TypeScript safety for class names.
- Harder to discover which class applies to which status (JS ↔ CSS split).
- More verbose: need to maintain both the CSS and the JS key mapping.
- Contradicts the project's "Tailwind utility first" approach.

---

### Option C — Separate `statusColors.ts` constants file

Extract the `COLORS` object to `src/shared/statusColors.ts`, import it in `StatusBadge.tsx`.

**Pros:**

- Colors are co-located with other shared constants (`testIds.ts`).
- Multiple components could import the same palette.
- No CSS split.

**Cons:**

- Extra file for what is currently a ~50-line object.
- Tailwind JIT must still scan the file (works fine, just needs adding to `content` in `tailwind.config.js` if not already covered).

---

## Decision

Record your chosen option and rationale below, then close the task. No implementation is required unless Option B or C is chosen.

**Chosen option:** _(fill in)_

**Rationale:** _(fill in)_

**Action items (if any):** _(fill in, or "none")_

---

## Done criteria

- [ ] Decision section above is filled in.
- [ ] If Option B or C: implementation is complete and build/tests pass.
- [ ] If Option A: no code changes, task marked done with rationale recorded.
