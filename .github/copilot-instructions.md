# Copilot / VS Code Agent Instructions

Authoritative project architecture & coding conventions live in:

- `.github/instructions/architecture.instructions.md`

Follow that file for all implementation work in this repo.

## Files to ignore

- **`CLAUDE.md`** (repo root) — This file is exclusively for Claude Code (Anthropic) and defines a reviewer persona unrelated to coding tasks. Do **not** read it, reference it, or apply its contents when generating code or suggestions.

## Task tracking

Work is organised as prompt files under `.github/prompts/tN-*.prompt.md`. Progress is tracked in `.github/prompts/STATUS.md`.

When you start or finish a task:

1. **Starting** — set the row in `STATUS.md` to `🟡 in-progress`, fill _Started_ date.
2. **Finishing** — set `✅ done`, fill _Completed_ date + short commit SHA, and `git mv .github/prompts/tN-*.prompt.md .github/prompts/done/`. Code + STATUS.md + file move go in the **same commit**.
3. **Blocked** — set `⚠️ blocked` with a short note.
4. **Partial** — stay on `🟡 in-progress`; do not move the file.

## Scope

This is a **frontend-only Playwright test-automation training app** written in **TypeScript (strict)**. Do not add backend code, real authentication, or runtime schema validation (Zod/Yup). Unit tests (Vitest) exist only for pure logic modules — not components or pages. See architecture doc §16 ("Things NOT To Do"), §16b (TypeScript), and §17 (Testing).
