# T27 — Rewrite README.md for current app state

**Agent:** `@logic`
**Depends on:** T19 ✅ (clean structure), T21 ✅ (i18n), implicit — `docs/app-overview.md` must already exist

---

## Goal

The repository `README.md` is **completely out of date**. It still describes the pre-T1 "Defect Containment Board" prototype from 2026-04-15 — a single-page app with 3 seeded defects, state-based routing, and `.jsx` files. Nothing in it matches the current Tredgate QA Hub. It actively misleads anyone landing on the GitHub page.

Rewrite `README.md` so it accurately represents today's application. Keep it concise — the full in-depth reference already lives in `docs/app-overview.md` and must NOT be duplicated here.

---

## Scope

**Only** `README.md`. Do not edit any other file.

---

## Required sections (in this order)

1. **Project title and one-line description**
   `# Tredgate QA Hub` followed by a single sentence: "Frontend-only QA platform used as the System Under Test for the Tredgate Playwright test-automation training course."

2. **Purpose**
   2–3 sentences explaining that this is a training SUT, not a production app — no backend, no real security, deterministic seed data. Mention the patterns it is designed to demonstrate (Component Model, Fluent Interface, Fixtures, Business Procedures, Role Polymorphism, Data Management) but keep it a single line.

3. **Tech stack**
   Keep as a compact table or bullet list. Current stack (verify against `package.json` before writing):
   - React 19
   - TypeScript 5 (strict mode)
   - Vite 8
   - Tailwind CSS 3
   - react-router-dom 7
   - lucide-react (icons)
   - Vitest (unit tests)

4. **Getting started**
   Prerequisites (Node 18+), `npm install`, `npm run dev` → runs on `http://localhost:5173`. Four or five lines total.

5. **Scripts**
   Short table: `dev`, `build`, `preview`, `lint`, `test`. One row per script, one-line descriptions. Copy exact script names from `package.json`.

6. **Quick access — test accounts**
   Reproduce the three-row credentials table from `docs/app-overview.md` §3. This is the single most-asked piece of info; keep it in the README for convenience. Everything else — the full permission matrix, route table, data model — stays in the overview doc.

7. **Documentation**
   Link list pointing readers to:
   - [`docs/app-overview.md`](docs/app-overview.md) — full application reference for testers
   - [`.github/instructions/architecture.instructions.md`](.github/instructions/architecture.instructions.md) — developer conventions
   - [`.github/instructions/naming.instructions.md`](.github/instructions/naming.instructions.md) — naming rules
   - [`CLAUDE.md`](CLAUDE.md) — Vera (reviewer/coordinator) role definition
   - [`.github/prompts/STATUS.md`](.github/prompts/STATUS.md) — task tracker

8. **Project structure (brief)**
   A **short** (10–15 line) directory tree of `src/` only — module-level, not file-level. Do NOT copy the sprawling tree from the old README. Something like:
   ```
   src/
   ├── main.tsx              # Router setup, AuthProvider, ToastProvider
   ├── App.tsx               # Authenticated shell (Sidebar + Outlet + Footer)
   ├── components/           # Reusable UI (forms, data, display, layout, …)
   ├── contexts/             # AuthContext, ToastContext
   ├── data/                 # entities.ts (types), seed.ts, store.ts
   ├── hooks/                # Entity hooks (useDefects, useProjects, …)
   ├── i18n/                 # UI strings
   ├── pages/                # Routed pages by module
   └── shared/               # testIds registry
   ```
   Adjust to match reality. The goal is orientation, not exhaustive listing.

---

## Non-goals (do NOT do any of this)

- Do NOT duplicate the full content of `docs/app-overview.md` (permission matrix, route table, data model, status enums, quirks). Link to it.
- Do NOT include any badges (build / license / coverage) unless there is already infrastructure producing them — this repo does not need decorative badges.
- Do NOT write a contribution guide, code of conduct, or changelog. Out of scope.
- Do NOT add emojis anywhere in the file.
- Do NOT touch any other file.
- Do NOT invent features. If unsure whether something exists, check the code — do not guess.

---

## Done criteria

- [ ] `README.md` fully rewritten, under ~150 lines total (excluding code blocks).
- [ ] Every claim verified against current code (routes, scripts, tech versions, file paths).
- [ ] All links in the Documentation section resolve to existing files.
- [ ] No references to "Defect Containment Board", "ReportDefect", "defects.js", or any other old-prototype artefact.
- [ ] Committed in a single focused commit: `docs(readme): rewrite README for current app state`.
- [ ] `STATUS.md` row for T27 flipped to ✅ done with the commit SHA.
- [ ] Prompt file `git mv`'d to `.github/prompts/done/`.
