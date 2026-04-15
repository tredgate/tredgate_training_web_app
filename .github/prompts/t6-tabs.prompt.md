# Task 6 — Tabs Component

> **Layer**: 2 (Shared Components) · **Depends on**: T1 (testIds.ts), T2 (app shell) · **Parallelizable** with T3-T5, T7

## Objective

Build the `Tabs` horizontal tab bar component. Used on ProjectDetail, TestPlanDetail, and Reports pages for switching between content panels. Supports optional badge counts on tabs (e.g., "Defects (12)").

## Constraints

- Follow architecture §9 (Tabs Props) for the API.
- All `data-testid` from `src/shared/testIds.ts` using `testIdPrefix`.
- Dark theme — glass-style tab bar, neon-purple active indicator.
- Fully controlled — parent manages `activeTab` state.

## File to Create

### `src/components/navigation/Tabs.tsx`

#### Props (per architecture §9)

```ts
export interface Tab {
  key: string;
  label: string;
  badge?: number | null;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;                         // key of the active tab
  onChange: (key: string) => void;
  testIdPrefix: string;
  className?: string;
}
```

#### Behavior

1. **Tab bar**: Horizontal row of tab buttons. Only one active at a time.
2. **Active state**: Active tab has neon-purple bottom border (3px) and white text. Inactive tabs have gray text, hover → lighter gray.
3. **Badge**: If `badge` is a number (including 0), show it as a small pill next to the label. Badge styling: `bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full`.
4. **Click**: Clicking a tab calls `onChange(tab.key)`.
5. **No content**: This component renders ONLY the tab bar. The parent renders content below based on `activeTab`. This keeps it simple and composable.

#### Rendered Structure

```html
<div data-testid="{prefix}-tabs" class="border-b border-white/10 {className}">
  <div class="flex gap-0" role="tablist">
    {tabs.map(tab => (
    <button
      key="{tab.key}"
      data-testid="{prefix}-tab-{tab.key}"
      role="tab"
      aria-selected="{tab.key"
      =""
      =""
      ="activeTab}"
      class="px-4 py-3 text-sm font-medium transition-all border-b-3
               {active ? 'text-white border-neon-purple' : 'text-gray-400 border-transparent hover:text-gray-200'}"
      onClick="{()"
      =""
    >
      onChange(tab.key)} >
      <span class="flex items-center gap-2">
        {tab.label} {tab.badge != null && (
        <span
          data-testid="{prefix}-tab-badge-{tab.key}"
          class="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full"
        >
          {tab.badge}
        </span>
        )}
      </span>
    </button>
    ))}
  </div>
</div>
```

The parent renders tab panels like:

```jsx
<Tabs tabs={...} activeTab={activeTab} onChange={setActiveTab} testIdPrefix="project-detail" />

{activeTab === "overview" && (
  <div data-testid="project-detail-tab-panel-overview">
    {/* Overview content */}
  </div>
)}
{activeTab === "defects" && (
  <div data-testid="project-detail-tab-panel-defects">
    {/* Defects content */}
  </div>
)}
```

### `src/shared/testIds.ts` — Extend

Add tab test ID builders:

```ts
// Tabs builders
export const tabsTestId = (prefix: string): string => `${prefix}-tabs`;
export const tabTestId = (prefix: string, key: string): string => `${prefix}-tab-${key}`;
export const tabBadge = (prefix: string, key: string): string => `${prefix}-tab-badge-${key}`;
export const tabPanel = (prefix: string, key: string): string => `${prefix}-tab-panel-${key}`;
```

## Verification Checklist

- [ ] Renders all tabs from `tabs` prop
- [ ] Active tab has neon-purple bottom border and white text
- [ ] Inactive tabs have gray text, hover changes to lighter gray
- [ ] Clicking a tab calls `onChange(key)`
- [ ] Badge renders as pill with count when `badge` is a number
- [ ] Badge does NOT render when `badge` is null or undefined
- [ ] `aria-selected` attribute correctly set on active tab
- [ ] All elements have correct `data-testid` with `testIdPrefix`
- [ ] Component accepts `className` prop
- [ ] Component does NOT render any panel content (tab bar only)

## Do NOT

- Do not render tab panel content inside this component
- Do not add keyboard navigation (arrow keys between tabs)
- Do not add lazy loading of tab content
- Do not add animation for tab indicator
- Use TypeScript (strict) per architecture §16b — `TabsProps` interface, `Tab` type for tab config. No PropTypes, no JSDoc, no `any`.
