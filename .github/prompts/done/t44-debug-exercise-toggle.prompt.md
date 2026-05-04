# T44 — Playwright Course: Toggleable App Breakages

**Agent:** `@logic`
**Depends on:** T10 ✅, T12 ✅

---

## Goal

Introduce four small, realistic-feeling breakages to the running app, all controlled by a single environment toggle. When the toggle is on, students' existing Playwright tests against the app fail in different ways and they have to debug from the test logs back to the cause.

This is a teaching tool for the Tredgate Playwright course, not a feature for end users.

---

## Background: why this looks the way it does

The four breakages map onto common real-world causes of "my Playwright test suddenly fails":

1. A developer renamed a `data-testid` (selector drift).
2. A developer added a new step to a wizard (regression from a feature add).
3. A developer changed where the user lands after an action (silent UX change).
4. A developer added validation to a form field (test flow now blocked at submit).

Each one fails in a different way and at a different point in the test, which forces students to read the failure carefully rather than pattern-matching to "selector wrong → fix selector."

### Hard rules

- **One toggle, scattered checks.** A single env var, `VITE_DEBUG_EXERCISE`, controls all four. The checks are inlined at each affected file. **Do NOT centralize the toggle into a config module, helper, or context.** If a student greps for `debugExercise` they should not find a single file that lists what's broken — they should find scattered conditionals just like in a real codebase.
- **No comments explaining the trick.** Do not write `// breakage for course exercise` next to the conditionals. The conditional itself is fine; the only acceptable comment is something a normal developer might write (e.g. nothing). Treat the breakage code like production code an unrelated dev wrote.
- **Toggle off = byte-identical existing behavior.** When `VITE_DEBUG_EXERCISE` is unset or anything other than `'true'`, every page/component must behave exactly as before. Test this.
- **Toggle name is intentional.** `VITE_DEBUG_EXERCISE` is generic enough that a student grepping the repo doesn't get a smoking gun. Don't rename it to something more descriptive.

---

## Toggle mechanism

Vite client-side env var, exposed via `import.meta.env`. Read it inline at the top of each affected file as a module-level const:

```ts
const DEBUG_EXERCISE = import.meta.env.VITE_DEBUG_EXERCISE === 'true';
```

Then use `DEBUG_EXERCISE` in conditionals at the points described in §Scope.

- **Local dev:** `VITE_DEBUG_EXERCISE=true npm run dev`
- **Heroku:** set `VITE_DEBUG_EXERCISE=true` as a config var. Because Vite bakes env vars into the build at `heroku-postbuild` time, changing the var requires a redeploy (no runtime toggling).

This is a known Vite constraint, not a bug. Do not attempt to make the toggle runtime-switchable.

---

## Scope

### 1. Five renamed `data-testid`s across the wizards

Pick **5 testids total** spread across the Project wizard ([src/pages/projects/](src/pages/projects/)) and the Test Plan wizard ([src/pages/testplans/](src/pages/testplans/)). When `DEBUG_EXERCISE` is on, render a renamed testid; when off, render the original.

Selection criteria (use these to choose):

- Must be testids that a student's Playwright test would plausibly target — i.e. text inputs, primary buttons, and the "Next" / "Save" wizard controls. Skip cosmetic-only elements.
- Cover a mix: at least 2 from Project wizard, at least 2 from Test Plan wizard, and the 5th wherever you judge most pedagogically valuable.
- The **renamed** testid should look like a plausible refactor a real dev would make — not nonsense. Examples of the rename style: `project-name-input` → `project-name-field`, `next-button` → `step-next-btn`, `save-project` → `submit-project`. Keep the kebab-case convention.

Pattern:

```tsx
<input data-testid={DEBUG_EXERCISE ? 'project-name-field' : TEST_IDS.project.nameInput} />
```

(Adjust to the actual `TEST_IDS` access pattern used in the file — see [src/data/testIds.ts](src/data/testIds.ts) or wherever testids are centralized per T40.)

**Do NOT** modify the `TEST_IDS` registry itself or add the renamed values to it. The renamed testid is a raw string at the call site — that mirrors what a careless dev would actually do.

### 2. Extra step in Project wizard

Add one new step to the Project wizard ([src/pages/projects/](src/pages/projects/)). The step should:

- Sit **between two existing steps** (not first, not last) so wizard step-count assertions and "click Next twice then expect submit" tests both break.
- Contain one **simple, optional** input — e.g. a "Project tags" text input or a "Project visibility" radio group (public / internal). Optional means students don't have to figure out a required value to make it pass.
- Submit the wizard correctly when the new field is empty — i.e. don't break form submission, just shift the navigation.
- Have a clear, plausible step title — something a real PM might add ("Tags", "Visibility", "Settings"). Don't title it "Debug" or anything that gives the game away.

When `DEBUG_EXERCISE` is off, the step is not rendered and the wizard has the same step count as before. Use the existing wizard component's step-array pattern; do not refactor the wizard component.

### 3. Test Plan post-create redirect

Currently, after creating a test plan via the wizard, the user lands on the new test plan's detail page. When `DEBUG_EXERCISE` is on, redirect to the test plans **list** instead.

The redirect lives wherever the wizard's `onSubmit` / `onComplete` handler does the navigation — likely [src/pages/testplans/TestPlanForm.tsx](src/pages/testplans/TestPlanForm.tsx) or its parent page. Check git status: that file currently has uncommitted changes; coordinate with the user before editing if there's a conflict.

```ts
navigate(DEBUG_EXERCISE ? '/test-plans' : `/test-plans/${newPlan.id}`);
```

### 4. Test case Description becomes `required`

The test case form has a Description textarea/input. When `DEBUG_EXERCISE` is on, add the standard HTML5 `required` attribute. Use plain HTML `required` — **not** custom `useForm` validation — because the goal is for the form submit to be silently blocked by the browser native behavior, which manifests in Playwright as "the test filled all fields, clicked Submit, but the URL never changed."

```tsx
<input
  // ...other props...
  required={DEBUG_EXERCISE}
/>
```

Find the test case Description field — it lives in the Test Plan wizard's test-case row editor (per T32). Do not change the field's `useForm` schema.

### 5. Teacher-facing documentation

Create `docs/debug-exercise.md` — a short reference for the teacher (the repo owner) to remember how the toggle works months from now without having to re-read the code.

Cover only:

- **Env var name** and how to enable it locally (`VITE_DEBUG_EXERCISE=true npm run dev`) and on Heroku (config var → triggers redeploy via `heroku-postbuild`).
- **Heroku redeploy caveat** — Vite bakes the var at build time; flipping the var requires a full rebuild, so plan for that between cohorts.
- **The four breakages** in one short list each: which file area, what changes, what student symptom it produces (e.g. "test passes `fill()` but `expect(page).toHaveURL(...)` fails because submit was blocked by HTML5 `required`").

Keep it under one screen of markdown. No code samples, no architecture diagrams. This is a personal cheat-sheet, not docs for contributors.

---

## Non-goals (do NOT do any of this)

- Do NOT create a `src/config/debugExercise.ts` or any centralized helper. Inline checks only.
- Do NOT add comments explaining the breakages. The conditionals stand alone.
- Do NOT add the renamed testids to `TEST_IDS`. They are intentionally raw strings.
- Do NOT touch the Playwright tests in students' external repos (they don't exist in this repo anyway).
- Do NOT modify Vitest tests unless one literally fails because of these changes — and if one does, stop and re-read this prompt, because you've probably broken toggle-off behavior.
- Do NOT update [CLAUDE.md](CLAUDE.md) or [README.md](README.md). Documentation goes in `docs/debug-exercise.md` only (see §5).
- Do NOT make the toggle runtime-switchable, hot-reloadable, or persistable. It's a build-time env var.
- Do NOT refactor the Project wizard or Test Plan wizard components. Add the step / conditional in the existing structure.
- Do NOT add new dependencies.

---

## Done criteria

- [ ] `VITE_DEBUG_EXERCISE` env var is read inline (module-level const) in each affected file. No centralized helper or config module exists.
- [ ] **5 renamed `data-testid`s** spread across Project and Test Plan wizards (≥2 each), gated on `DEBUG_EXERCISE`.
- [ ] **One new step** added to the Project wizard, gated on `DEBUG_EXERCISE`, sitting between two existing steps with one optional field and a plausible title.
- [ ] **Test plan post-create** navigates to `/test-plans` when toggle is on, to `/test-plans/:id` when off.
- [ ] **Test case Description** has HTML5 `required` when toggle is on, no `required` when off. No custom validation added.
- [ ] `docs/debug-exercise.md` exists and covers env var, local + Heroku enable, redeploy caveat, and the 4 breakages with student-facing symptoms. Under one screen of markdown.
- [ ] **Toggle off (or unset)**: app behavior is byte-identical to current `main`. Manually verify each of the 4 affected flows.
- [ ] **Toggle on**: all 4 breakages active simultaneously. Manually verify each.
- [ ] No comments in the code reference "exercise", "debug", "breakage", "students", or similar.
- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm test -- --run` passes.
- [ ] `STATUS.md` row for T44 flipped to ✅ done with commit SHA.
- [ ] Prompt file `git mv`'d to `.github/prompts/done/`.
