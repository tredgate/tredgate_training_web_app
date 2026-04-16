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

| Task | Title                            | Status         | Depends on         | Started    | Completed  | Commit  | Notes                                 |
| ---- | -------------------------------- | -------------- | ------------------ | ---------- | ---------- | ------- | ------------------------------------- |
| T1   | Data Layer                       | ✅ done        | —                  | 2026-04-15 | 2026-04-15 | 88a152e |                                       |
| T2   | Auth, Router, Layout Shell       | ✅ done        | T1                 | 2026-04-16 | 2026-04-16 | 5c697ed |                                       |
| T3   | DataTable                        | 🟡 in-progress | T1                 | 2026-04-17 | —          | —       |                                       |
| T4   | Modal, EmptyState                | 🟡 in-progress | T1                 | 2026-04-17 | —          | —       |                                       |
| T5   | Wizard                           | 🟡 in-progress | T1                 | 2026-04-17 | —          | —       |                                       |
| T6   | Tabs                             | 🟡 in-progress | T1                 | 2026-04-17 | —          | —       |                                       |
| T7   | Forms, StatusBadge, Display      | 🟡 in-progress | T1                 | 2026-04-17 | —          | —       |                                       |
| T8   | Entity Hooks (useStore + domain) | ✅ done    | T1                 | 2026-04-17 | 2026-04-18 | a1b2c3d |                                       |
| T9   | Dashboard                        | ⬜ pending     | T2, T7, T8         | —          | —          | —       |                                       |
| T10  | Projects Module                  | ⬜ pending     | T2–T8              | —          | —          | —       |                                       |
| T11  | Defects Module                   | ⬜ pending     | T2–T8              | —          | —          | —       |                                       |
| T12  | Test Plans & Runs                | ⬜ pending     | T2–T8              | —          | —          | —       |                                       |
| T13  | Team Module                      | ⬜ pending     | T2, T3, T4, T7, T8 | —          | —          | —       |                                       |
| T14  | Reports, Settings, Profile       | ⬜ pending     | T2–T8              | —          | —          | —       |                                       |
| T15  | Fix Cross-Task Consistency       | ✅ done        | T1–T14 authored    | 2026-04-15 | 2026-04-15 | —       | Prompt-file edits only; no src commit |
| T16  | Unit Tests                       | 🟡 in-progress | T1                 | 2026-04-17 | —          | —       |                                       |
| T17  | E2E Smoke Validation (on-demand) | ⬜ pending     | Any of T9–T14 ✅   | —          | —          | —       | Runs on demand; never auto-triggered  |

## Conventions

- **Commit SHA**: short form (7 chars) is enough. The `git mv` and the STATUS.md update belong in the **same commit** as the implementation.
- **Preserve filenames** when moving to `done/` — no renames. `tN-*.prompt.md` stays searchable.
- **Don't delete rows** when a task is done — keep the history visible here.
- **New tasks** go at the bottom with the next `TN` number; add a row here the moment the prompt file is created.
