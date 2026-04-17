# T23 — DefectDetail & DefectForm Refactor: Readability & Efficiency

**Agent:** `@pages`
**Depends on:** T11 ✅

---

## Goal

`DefectDetail.tsx` and `DefectForm.tsx` are dense and difficult to navigate. Refactor both for readability by extracting logical sections into named helper functions or local sub-components — **without changing behaviour, props, or DOM structure**.

---

## DefectDetail.tsx — Candidates to extract

Read the file first, then extract as appropriate:

| Candidate        | Notes                                                       |
| ---------------- | ----------------------------------------------------------- |
| `DefectHeader`   | Title, ID badge, severity/status badges, action buttons     |
| `DefectInfoGrid` | The metadata grid (reporter, assignee, project, dates, env) |
| `DefectComments` | Comment list + add-comment form                             |
| `DefectTimeline` | Status transition history (if present)                      |
| `DefectActions`  | Transition buttons (Assign, Resolve, etc.)                  |

**Rule:** if a candidate is < 20 lines, leave it inline. Only extract if it meaningfully reduces cognitive load.

---

## DefectForm.tsx — Candidates to extract

| Candidate              | Notes                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| `BasicInfoStep`        | First wizard step: title, description, project, environment      |
| `DetailsStep`          | Second step: severity, priority, assignee                        |
| `AttachmentsStep`      | Third step (if present): attachments / reproduction steps        |
| `buildInitialValues()` | Pure function to compute form initial state from existing defect |
| `buildPayload()`       | Pure function to build the save payload from form values         |

Helper functions (`buildInitialValues`, `buildPayload`) go at the top of the file, before the component. Local step sub-components go below or in a co-located `_steps/` folder if they exceed 60 lines each.

---

## Rules

- All `data-testid` attributes must survive unchanged.
- No new hooks — only the existing ones already used in these files.
- TypeScript strict mode (`npx tsc --noEmit`) must pass.
- No new runtime dependencies.
- Do **not** change routing, navigation behaviour, or toast messages.

---

## Done criteria

- [ ] `DefectDetail.tsx` — no single block of JSX exceeds ~50 lines without a named boundary.
- [ ] `DefectForm.tsx` — same.
- [ ] Helper functions `buildInitialValues` / `buildPayload` (or equivalent) exist as named pure functions.
- [ ] All `data-testid` strings are preserved exactly.
- [ ] `npx tsc --noEmit` passes (source files only).
- [ ] `npm run build` succeeds.
- [ ] `npm run test -- --run` still passes (171 tests).
