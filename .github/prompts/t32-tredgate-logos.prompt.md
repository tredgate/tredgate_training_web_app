# T32 — Implement Tredgate Logos

**Agent:** `@ui`  
**Depends on:** T2 ✅ (Sidebar, Login exist)

---

## Goal

Replace the placeholder `Shield` icon from `lucide-react` with the actual Tredgate SVG logos in the **Sidebar** and **Login** page.

Two SVG logo files are provided in `input-agents/`:

| File | Variant | Use on |
|------|---------|--------|
| `tredgate-logo-dark.svg` | Dark text / coloured accents | Light backgrounds |
| `tredgate-loho-white.svg` | White text / coloured accents | Dark backgrounds (Sidebar, Login) |

> **Note:** The white variant has a typo in the filename (`loho` instead of `logo`). Fix it when copying: rename to `tredgate-logo-white.svg`.

---

## Scope

### Files to create / move

1. Copy `input-agents/tredgate-logo-dark.svg` → `public/tredgate-logo-dark.svg`
2. Copy `input-agents/tredgate-loho-white.svg` → `public/tredgate-logo-white.svg` (fix the typo)

### Files to modify

1. **`src/components/layout/Sidebar.tsx`**  
   - Replace the `<Shield>` icon in the logo area with an `<img>` tag referencing the **white** logo variant (`/tredgate-logo-white.svg`).  
   - When the sidebar is **collapsed**, show only the coloured dot/icon portion or hide the logo and keep the existing `sr-only` span.  
   - When **expanded**, show the full logo image. Remove the `{t.app.name}` text span — the logo already contains the wordmark.  
   - Keep existing `data-testid={TEST_IDS.sidebar.logo}` on the logo element.  
   - Remove the `Shield` import if no longer used in this file.

2. **`src/pages/auth/Login.tsx`**  
   - Replace the `<Shield>` icon above the login form heading with an `<img>` tag referencing the **white** logo variant.  
   - Reasonable size: ~160–200 px wide, auto height.  
   - Keep `data-testid` attributes intact.  
   - Remove the `Shield` import if no longer used in this file.

### Optional — Footer

The Footer (`src/components/layout/Footer.tsx`) currently shows plain text "Tredgate QA Hub v4.0.0". If it looks good, you may add a small logo there too — but this is optional and low priority. Do not force it if it clutters the footer.

---

## Constraints

- **No new runtime dependencies.** SVGs served as static assets from `public/` via `<img>` tags is fine.
- Alternatively, importing SVGs as React components (Vite supports this with `?react` suffix or `?url`) is also acceptable — use whichever approach is simpler.
- The logo `<img>` must have a meaningful `alt` attribute (e.g. `"Tredgate QA Hub"` or the i18n equivalent `t.app.name`).
- Maintain all existing `data-testid` attributes.
- Do **not** modify `testIds.ts` unless you add a new test ID (unlikely for this task).
- Ensure `npm run build` passes after changes.

---

## Do NOT

- Do not redesign the Sidebar or Login layout — only swap the icon for the logo.
- Do not add the dark logo variant to any UI unless there is a light-background context that needs it. Currently both the Sidebar and Login are dark-themed, so only the white variant is needed.
- Do not delete the original files from `input-agents/` — they stay as the source-of-truth input.
