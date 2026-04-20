# Task Status

Lightweight tracker for all prompt tasks under `.github/prompts/`. Update this file whenever you start or finish a task.

**Legend:** ⬜ pending · 🟡 in-progress · ✅ done · ⚠️ blocked

## How to use

1. **Starting a task** — set status to `🟡 in-progress`, fill _Started_ date (YYYY-MM-DD).
2. **Finishing a task** — set status to `✅ done`, fill _Completed_ date + short commit SHA, and `git mv .github/prompts/tN-*.prompt.md .github/prompts/done/` in the same commit.
3. **Blocked** — set `⚠️ blocked`, add a one-line reason in _Notes_.
4. **Partial progress** — stay on `🟡 in-progress`, do NOT move the file to `done/`.

Keep this file short: just the table + minimal notes. No prose logs.

## Tasks

| Task | Title                                            | Status     | Depends on         | Started    | Completed  | Commit  | Notes                                                            |
| ---- | ------------------------------------------------ | ---------- | ------------------ | ---------- | ---------- | ------- | ---------------------------------------------------------------- |
| T1   | Data Layer                                       | ✅ done    | —                  | 2026-04-15 | 2026-04-15 | 88a152e |                                                                  |
| T2   | Auth, Router, Layout Shell                       | ✅ done    | T1                 | 2026-04-16 | 2026-04-16 | 5c697ed |                                                                  |
| T3   | DataTable                                        | ✅ done    | T1                 | 2026-04-17 | 2026-04-17 | 38fbc76 |                                                                  |
| T4   | Modal, EmptyState                                | ✅ done    | T1                 | 2026-04-17 | 2026-04-17 | 38fbc76 |                                                                  |
| T5   | Wizard                                           | ✅ done    | T1                 | 2026-04-17 | 2026-04-17 | 38fbc76 |                                                                  |
| T6   | Tabs                                             | ✅ done    | T1                 | 2026-04-17 | 2026-04-17 | 38fbc76 |                                                                  |
| T7   | Forms, StatusBadge, Display                      | ✅ done    | T1                 | 2026-04-17 | 2026-04-17 | 38fbc76 |                                                                  |
| T8   | Entity Hooks (useStore + domain)                 | ✅ done    | T1                 | 2026-04-17 | 2026-04-17 | 38fbc76 |                                                                  |
| T9   | Dashboard                                        | ✅ done    | T2, T7, T8         | 2026-04-17 | 2026-04-17 | 2f8440f |                                                                  |
| T10  | Projects Module                                  | ✅ done    | T2–T8              | 2026-04-17 | 2026-04-17 | 950af1b |                                                                  |
| T11  | Defects Module                                   | ✅ done    | T2–T8              | 2026-04-17 | 2026-04-17 | e9beb0a |                                                                  |
| T12  | Test Plans & Runs                                | ✅ done    | T2–T8              | 2026-04-17 | 2026-04-17 | b9a684d |                                                                  |
| T13  | Team Module                                      | ✅ done    | T2, T3, T4, T7, T8 | 2026-04-17 | 2026-04-17 | 77caa22 |                                                                  |
| T14  | Reports, Settings, Profile                       | ✅ done    | T2–T8              | 2026-04-17 | 2026-04-17 | a9c5d2f |                                                                  |
| T15  | Fix Cross-Task Consistency                       | ✅ done    | T1–T14 authored    | 2026-04-15 | 2026-04-15 | —       | Prompt-file edits only; no src commit                            |
| T16  | Unit Tests                                       | ⚠️ blocked | T1                 | 2026-04-17 | —          | 38fbc76 | Tests pass at runtime; 56 TS errors in test code                 |
| T17  | E2E Smoke Validation (on-demand)                 | ⬜ pending | Any of T9–T14 ✅   | —          | —          | —       | Last run: 2026-04-18 — 8 pass / 0 fail / 0 skip                  |
| T18  | Component Cleanup (T3–T7 fixes)                  | ✅ done    | T3–T7              | 2026-04-16 | 2026-04-16 | 26fd474 | Split across 4 commits (Fixes 1+6, 2, 3+4+5, 7)                  |
| T19  | Dashboard Refactor: Split to functions           | ✅ done    | T9                 | 2026-04-18 | 2026-04-18 | cf449c0 | 3 commits: hook → columns → sub-components                       |
| T20  | Component Structure Review                       | ⬜ pending | T9–T14             | —          | —          | —       | Analysis + optional extraction                                   |
| T21  | i18n: Centralise All UI Text                     | ✅ done    | T2                 | 2026-04-18 | 2026-04-18 | b862d46 |                                                                  |
| T22  | Discussion: Defect Colors — Component vs CSS     | ⬜ pending | T7, T11            | —          | —          | —       | Decision only; implementation optional                           |
| T23  | DefectDetail & DefectForm Refactor               | ⬜ pending | T11                | —          | —          | —       |                                                                  |
| T24  | Fix TypeScript Errors in Test Files              | ✅ done    | T16                | 2026-04-18 | 2026-04-18 | fb47c10 | 56 TS errors resolved: EntityKey cast + ! assertions             |
| T25  | Fix DataTable Filter Options: {value,label}      | ✅ done    | T3, T11            | 2026-04-18 | 2026-04-18 | d1acf69 | /defects crashes — FilterConfig only accepts string[]            |
| T26  | Naming Review & Rename Pass                      | ⬜ pending | T19, T21           | —          | —          | —       | Scope: src/data, src/hooks, src/pages. Skip tests.               |
| T27  | Rewrite README.md for current app state          | ⬜ pending | T19, T21           | —          | —          | —       | README is pre-T1 stale. Link to docs/app-overview.md.            |
| T28  | Fix Validation Messages in Form Pages            | ✅ done    | T7, T10            | 2026-04-18 | 2026-04-18 | 98e2406 | form.validate() added to step validates to populate form.errors  |
| T29  | Bug: Login Page Empty Fields — No Validation     | ✅ done    | T2                 | 2026-04-19 | 2026-04-19 | 9bcc69b | useForm.handleSubmit now marks all fields touched                |
| T30  | Audit data-testid on Validation Error Elements   | ⬜ pending | T29                | —          | —          | —       | Step 1: analysis of all pages, Step 2: fix missing test IDs      |
| T31  | Select Empty-State Mismatch — App-Wide Audit     | ✅ done    | T7, T10            | 2026-04-19 | 2026-04-19 | 8f942e6 | Select auto-renders placeholder when value unmatched             |
| T39  | Add data-testid to Text/Display Elements         | ✅ done    | T9–T14             | 2026-04-20 | 2026-04-20 | cd89716 | Split across subagent sessions, one per page module              |
| T32  | Dynamic Row Validation Errors (Project/TestPlan) | ✅ done    | T37                | 2026-04-19 | 2026-04-19 | f81a788 | Env rows + test case/step rows: add error state, render inline   |
| T33  | Implement Tredgate Favicon                       | ✅ done    | —                  | 2026-04-19 | 2026-04-19 | 03936a7 | Replace default Vite favicon with branded SVG                    |
| T34  | Bug: Unstyled Inputs in Test Plan Wizard         | ✅ done    | T12                | 2026-04-19 | 2026-04-19 | 58a1e57 | Preconditions + Step Action/Expected use non-existent CSS class  |
| T35  | Validation Docs & Agent Warning                  | ✅ done    | T37, T32           | 2026-04-19 | 2026-04-19 | ff6e867 | Document useForm API + dynamic-rows pattern for future agents    |
| T36  | Implement Tredgate Logos                         | ✅ done    | T2                 | 2026-04-19 | 2026-04-19 | 97bc60d | Replace Shield icon with SVG logos in Sidebar + Login            |
| T37  | Harden useForm: validateFields + auto-clear      | ✅ done    | —                  | 2026-04-19 | 2026-04-19 | f81a788 | Kills the recurring "forgot the dance" bug class across forms    |
| T38  | useForm: Clear Validation Errors on Field Change | ✅ done    | T37                | —          | 2026-04-19 | f81a788 | Folded into T37                                                  |
| T40  | Bug: Duplicate data-testid in Wizard Forms       | ✅ done    | T39                | 2026-04-20 | 2026-04-20 | 2e46cc4 | Register wizard step testids in TEST_IDS; remove all raw strings |
| T41  | Bug: Duplicate React Keys Across Pages           | ⬜ pending | T9–T14             | —          | —          | —       | "same key `2`" warnings → stale renders + Playwright crashes     |
| T42  | Bug: DataTable Rows Use Entity ID, Not Row Index | ⬜ pending | T3                 | —          | —          | —       | data-testid should use visible row index, not entity ID          |

## Conventions

- **Commit SHA**: short form (7 chars) is enough. The `git mv` and the STATUS.md update belong in the **same commit** as the implementation.
- **Preserve filenames** when moving to `done/` — no renames. `tN-*.prompt.md` stays searchable.
- **Don't delete rows** when a task is done — keep the history visible here.
- **New tasks** go at the bottom with the next `TN` number; add a row here the moment the prompt file is created.
