# Tredgate QA Hub — Naming Conventions

> This document is binding for all agents and contributors working on this project. Every new or edited symbol — variables, parameters, callbacks, functions, types, files — must follow these rules. If in doubt, spell it out.

---

## 1. Guiding principle

**Names are the highest-value readability lever in this codebase.** This repo is a Playwright test-automation training app — students read the code to learn patterns. Lazy naming teaches bad habits. We follow the Clean Code (Robert C. Martin) discipline: names should reveal intent without requiring the reader to hold context in their head.

**Default: full, descriptive words.** Abbreviation is the exception, not the rule.

---

## 2. Rules

### 2.1 Callback and arrow-function parameters

Use the full singular noun of the collection element.

```ts
// ✅ Good
projects.filter(project => project.leadId === user.id);
defects.map(defect => defect.title);
testRuns.find(testRun => testRun.id === id);
testPlans.forEach(testPlan => { ... });

// ❌ Bad
projects.filter(p => p.leadId === user.id);
defects.map(d => d.title);
testRuns.find(tr => tr.id === id);
```

When the collection name is long (e.g. `awaitingVerification`), use the singular concept it represents (`defect`), not a letter or abbreviation.

### 2.2 Local variables

Prefer full words. No `tp` for test plan, no `h` for history entry, no `req` for request.

```ts
// ✅ Good
const historyEntry = defect.history[0];
const activeProjects = projects.filter(project => project.status === 'active');

// ❌ Bad
const h = defect.history[0];
const activeProj = projects.filter(p => p.status === 'active');
```

### 2.3 Functions and methods

Verb-phrase, descriptive, unambiguous. No cryptic suffixes (`doIt`, `handle2`, `processV2`).

```ts
// ✅ Good
function calculatePassRate(runs: TestRun[]): number { ... }
function getProjectName(projectId: number): string { ... }

// ❌ Bad
function calc(r: TestRun[]): number { ... }
function gpn(id: number): string { ... }
```

### 2.4 Booleans

Prefix with `is`, `has`, `should`, `can`, or `will`.

```ts
// ✅ Good
const isAssigned = defect.assigneeId !== null;
const hasOpenDefects = openDefectsCount > 0;

// ❌ Bad
const assigned = defect.assigneeId !== null;
const openDefects = openDefectsCount > 0;  // ambiguous — is it a count, a bool, a list?
```

### 2.5 Types and interfaces

`PascalCase`, singular noun, no Hungarian-style `IFoo` or `TFoo` prefixes.

```ts
// ✅ Good
type Defect = { ... };
interface DashboardData { ... }

// ❌ Bad
type TDefect = { ... };
interface IDashboardData { ... }
```

### 2.6 File names

Match the primary export. Components/pages: `PascalCase.tsx`. Hooks: `useCamelCase.ts`. Utilities: `camelCase.ts`. Co-located internal modules may use a leading underscore (`_columns.tsx`, `_components/`).

---

## 3. Allowed exceptions

Single-letter or heavily-abbreviated names are acceptable **only** in these specific cases:

| Name         | Allowed scope                                                                 |
| ------------ | ----------------------------------------------------------------------------- |
| `i`, `j`, `k` | Classic `for (let i = 0; i < n; i++)` loop indices. Not for `.map`/`.filter`. |
| `e`          | Event handler parameter: `onClick={e => ...}`, `onChange={e => ...}`          |
| `_`          | Deliberately unused parameter: `arr.map((_, index) => ...)`                   |
| `id`         | Primary-key identifier — universally understood, spelling it out adds nothing |
| `props`      | React component props parameter — framework idiom                             |

**Anything not on this list must use a full word.** No expanding this list without discussion.

---

## 4. What to rename when you find it

If you are editing code and notice a naming violation in the same file — even if it's not strictly part of your task — fix it. Don't leave freshly-touched code half-compliant. For scope creep beyond the file you're editing, flag it as a follow-up rather than expanding the current task.

---

## 5. Review checklist

When reviewing an agent's output (as a human or as Vera), check:

- [ ] No single-letter callback params outside the §3 exception table
- [ ] No unclear abbreviations (`tp`, `h`, `req`, `resp`, `idx`, `cnt`, etc.)
- [ ] Booleans use `is`/`has`/`should`/`can`/`will` prefix
- [ ] Function names are verb phrases
- [ ] No Hungarian prefixes on types

Flag violations explicitly — "naming: `p` → `project` in useDashboardData.ts:42" — don't let them slide as "minor".
