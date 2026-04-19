# T33 — Implement Tredgate Favicon

**Agent:** `@foundation`  
**Depends on:** —

---

## Goal

Replace the default Vite favicon with the Tredgate-branded favicon. The source SVG is provided in `input-agents/favicon.svg` (three coloured dots: cyan, red, orange — matching the Tredgate brand accent colours).

---

## Scope

### Files to create / replace

1. Copy `input-agents/favicon.svg` → `public/favicon.svg` (overwrite the existing Vite default).

### Files to verify (no change expected)

1. **`index.html`** — already references `/favicon.svg` via `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`. No change needed unless the filename differs.

---

## Constraints

- **No new dependencies.**
- Keep the favicon as an SVG — modern browsers support it, and it scales to any size.
- Do not delete the original file from `input-agents/` — it stays as the source-of-truth input.
- Ensure `npm run build` passes after the change.

---

## Do NOT

- Do not generate PNG/ICO fallbacks — SVG favicon is sufficient for this training app.
- Do not modify `index.html` unless the `<link>` tag needs updating (it shouldn't).
