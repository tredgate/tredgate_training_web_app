# T21 — i18n: Centralise All UI Text

**Agent:** `@foundation`
**Depends on:** T2 ✅

---

## Goal

Move every hard-coded UI string (labels, button text, headings, empty-state messages, error messages, placeholder text) into a single translation file so the app is ready for multi-language support without a full i18n library.

---

## Approach

**No runtime i18n library.** Use a plain TypeScript object — one source file, one language for now (English), easy to fork per locale later.

### File to create

```
src/i18n/en.ts          ← single source of truth for English strings
src/i18n/index.ts       ← re-exports `t` helper and the active locale object
```

### `en.ts` shape (example — adapt to actual strings found)

```ts
export const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    loading: "Loading…",
    unknown: "Unknown",
    unassigned: "Unassigned",
  },
  dashboard: {
    title: "Dashboard",
    statOpenDefects: "Open Defects",
    // …
  },
  defects: {
    title: "Defects",
    btnReport: "Report Defect",
    emptyTitle: "No defects yet",
    // …
  },
  // one key per page/module
} as const;
```

### `index.ts`

```ts
import { en } from "./en";
export const t = en; // swap `en` for another locale object to change language
```

Pages/components import: `import { t } from "../../i18n";` and use `t.defects.btnReport`.

---

## Scope

- Scan **every** `.tsx` file under `src/pages/` and `src/components/` for string literals used as visible UI text.
- Do **not** touch: `data-testid` values, CSS class strings, URL paths, entity field names, console logs.
- Do **not** change JSX structure — only the string values.
- TypeScript strict mode must pass after all replacements.

---

## Done criteria

- [ ] `src/i18n/en.ts` exists and contains all UI strings found.
- [ ] `src/i18n/index.ts` exports `t`.
- [ ] No hard-coded visible UI strings remain in `.tsx` files (grep check).
- [ ] `npx tsc --noEmit` passes (source files only).
- [ ] `npm run build` succeeds.
- [ ] `npm run test -- --run` still passes.
