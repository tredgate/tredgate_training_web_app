# T20 — Component Structure Review: Page vs Shared Component

**Agent:** `@orchestrator` (analysis + decision log only — implementation delegated per outcome)
**Depends on:** T9–T14 ✅

---

## Goal

Review all page files under `src/pages/` and identify UI blocks that are:

1. **Duplicated** — the same or near-identical JSX pattern appears in two or more pages.
2. **Large enough** — the block is ≥ 40 lines of JSX and clearly encapsulates a single concept.
3. **Reusable by role** — the block changes only by props (data/callbacks), not by structural differences.

For each candidate, make an explicit **keep-in-page** or **extract-to-component** decision with a brief rationale.

---

## Deliverables

### 1. Decision log (append to this file under `## Decisions` below)

For every candidate block, record:

```
### <Block name>
- Found in: <list of page files>
- Lines (approx): <N>
- Decision: extract | keep
- Rationale: <1–2 sentences>
- Target path (if extract): src/components/<category>/<ComponentName>.tsx
```

### 2. Implementation (only for blocks marked `extract`)

- Create the component file.
- Replace the inline block in every page file that uses it.
- Ensure all `data-testid` attributes survive the extraction.
- TypeScript strict mode must pass.

---

## Rules

- Do **not** extract something just because it's long — only extract if it is genuinely reusable or conceptually independent.
- Page-specific logic (hooks, local state, handlers) stays in the page.
- Shared components receive only props — no hook calls inside extracted components unless that hook is also generic/shared.
- Follow existing component conventions: named export as default, `Props` interface above the function.

---

## Done criteria

- [ ] Decision log below is filled in.
- [ ] All `extract` decisions have corresponding new component files.
- [ ] All pages that used the inline block now import the new component.
- [ ] `npx tsc --noEmit` passes (source files only).
- [ ] `npm run build` succeeds.
- [ ] `npm run test -- --run` still passes.

---

## Decisions

_(fill in during execution)_
