# Task 7 — Form Components, StatusBadge, Display Components

> **Layer**: 2 (Shared Components) · **Depends on**: T1 (testIds.ts), T2 (app shell) · **Parallelizable** with T3-T6

## Objective

Build all reusable form input components, the StatusBadge component, and the display components (StatCard, ActivityTimeline, UserAvatar). These are the building blocks used by every page in the app.

## Constraints

- Follow architecture §9 (Form Components Pattern, StatusBadge Props) for APIs.
- All `data-testid` values passed via prop — form components receive `data-testid` directly.
- Dark theme — use `.input-dark` for all inputs, Tailwind utilities for layout.
- All components are controlled — value/onChange pattern.
- All components are default exports.

## Files to Create

### Form Components (`src/components/forms/`)

All form components share this base props interface (extended per component):

```ts
export interface BaseFieldProps {
  "data-testid": string;
  label: string;
  name: string;
  error?: string | null;               // shown below input in red
  required?: boolean;                  // shows * after label
  disabled?: boolean;
  className?: string;
}

// Per-component Props interfaces extend BaseFieldProps, e.g.:
export interface TextInputProps extends BaseFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "text" | "email" | "password"; // default "text"
}

export interface TextAreaProps extends BaseFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;                       // default 4
}

export interface SelectOption { value: string; label: string }

export interface SelectProps extends BaseFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
}

export interface MultiSelectProps extends BaseFieldProps {
  value: string[];
  onChange: (selectedValues: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
}

export interface CheckboxProps extends Omit<BaseFieldProps, "error"> {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface RadioOption { value: string; label: string }

export interface RadioGroupProps extends BaseFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: RadioOption[];
}

export interface DatePickerProps extends BaseFieldProps {
  value: string;                       // ISO date "YYYY-MM-DD"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
}

export interface FileUploadProps extends Omit<BaseFieldProps, "error"> {
  value: string;                       // filename or ""
  onChange: (filename: string) => void;
  accept?: string;
}
```

#### 1. `TextInput.tsx`

```jsx
// Additional props: placeholder, type ("text" | "email" | "password", default "text")
<div class="{className}">
  <label
    data-testid="{testid}-label"
    class="block text-sm font-medium text-gray-300 mb-1"
  >
    {label}
    {required && <span class="text-red-400 ml-1">*</span>}
  </label>
  <input
    data-testid={data - testid}
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    class="input-dark {error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30' : ''}"
  />
  {error && (
    <p data-testid="{testid}-error" class="text-red-400 text-sm mt-1">
      {error}
    </p>
  )}
</div>
```

#### 2. `TextArea.tsx`

Same as TextInput but renders `<textarea>` with `rows={4}` default. Additional prop: `rows`.

#### 3. `Select.tsx`

```jsx
// Additional props: options: [{ value: string, label: string }], placeholder: string
<div class="{className}">
  <label ...>{label}</label>
  <select data-testid={data-testid} class="input-dark" ...>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
  {error && <p ...>{error}</p>}
</div>
```

#### 4. `MultiSelect.tsx`

A dropdown-like component with checkboxes for multi-selection.

```jsx
// Additional props: options: [{ value: string, label: string }]
// value: string[] (array of selected values)
// onChange: (selectedValues: string[]) => void
```

Implementation: A button that toggles a dropdown panel. The panel shows checkboxes for each option. Selected count shown on the button. Click outside closes dropdown.

```html
<div class="relative {className}">
  <label ...>{label}</label>
  <button
    data-testid="{data-testid}"
    class="input-dark text-left flex justify-between items-center"
    onClick="{toggle}"
  >
    <span>{selectedCount > 0 ? `${selectedCount} selected` : placeholder}</span>
    <ChevronDown class="w-4 h-4" />
  </button>
  {isOpen && (
  <div
    data-testid="{testid}-dropdown"
    class="absolute z-10 mt-1 w-full glass p-2 max-h-48 overflow-y-auto"
  >
    {options.map(opt => (
    <label
      key="{opt.value}"
      data-testid="{testid}-option-{opt.value}"
      class="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer"
    >
      <input
        type="checkbox"
        checked="{value.includes(opt.value)}"
        onChange="{...}"
      />
      <span class="text-sm text-gray-300">{opt.label}</span>
    </label>
    ))}
  </div>
  )} {error &&
  <p ...>{error}</p>
  }
</div>
```

#### 5. `Checkbox.tsx`

```jsx
// Props: data-testid, label, name, checked (boolean), onChange, disabled
<label
  data-testid={data - testid}
  class="flex items-center gap-2 cursor-pointer {className}"
>
  <input
    type="checkbox"
    name={name}
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    class="w-4 h-4 rounded border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple/30"
  />
  <span class="text-sm text-gray-300">{label}</span>
</label>
```

#### 6. `RadioGroup.tsx`

```jsx
// Props: data-testid, label, name, value (string), onChange, options: [{ value, label }], disabled
<fieldset data-testid={data - testid} class="{className}">
  <legend class="block text-sm font-medium text-gray-300 mb-2">
    {label}
    {required && <span class="text-red-400 ml-1">*</span>}
  </legend>
  <div class="space-y-2">
    {options.map((opt) => (
      <label
        key={opt.value}
        data-testid="{testid}-option-{opt.value}"
        class="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={onChange}
          disabled={disabled}
          class="w-4 h-4 border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple/30"
        />
        <span class="text-sm text-gray-300">{opt.label}</span>
      </label>
    ))}
  </div>
  {error && (
    <p data-testid="{testid}-error" class="text-red-400 text-sm mt-1">
      {error}
    </p>
  )}
</fieldset>
```

#### 7. `DatePicker.tsx`

Native date input with the same wrapper pattern as TextInput:

```jsx
// Additional props: min, max (date strings)
<input type="date" data-testid={data-testid} class="input-dark" ... />
```

Use `[color-scheme:dark]` CSS on the input to make the native date picker match the dark theme.

#### 8. `FileUpload.tsx`

**Simulated** file upload — no actual file handling. Displays a drop zone / button and shows a fake filename when "uploaded".

```jsx
// Props: data-testid, label, value (string — filename or ""), onChange (filename string), accept (string), disabled
<div class="{className}">
  <label ...>{label}</label>
  <div data-testid={data-testid}
       class="input-dark border-dashed flex items-center justify-center gap-2 py-6 cursor-pointer"
       onClick={simulateUpload}>
    <Upload class="w-5 h-5 text-gray-500" />
    <span class="text-gray-500">{value || "Click to upload a file"}</span>
  </div>
</div>
```

On click: generate a fake filename like `screenshot_2024-01-15.png` and call `onChange(filename)`. No real file dialog.

### StatusBadge (`src/components/feedback/StatusBadge.tsx`)

Color-coded badge per architecture §9.

#### Props

```ts
import type { Severity, DefectStatus, Priority, ProjectStatus } from "../../data/entities";

export type BadgeType = "severity" | "status" | "priority" | "project_status";

// Discriminated union ensures the `value` matches the chosen `type`.
export type StatusBadgeProps =
  | { "data-testid": string; type: "severity";       value: Severity;       className?: string }
  | { "data-testid": string; type: "status";         value: DefectStatus;   className?: string }
  | { "data-testid": string; type: "priority";       value: Priority;       className?: string }
  | { "data-testid": string; type: "project_status"; value: ProjectStatus;  className?: string };
```

The discriminated union is the whole point of going TS here — passing `type="severity" value="P1"` fails at compile time.

#### Color Maps

```ts
const COLORS: Record<BadgeType, Record<string, string>> = {
  severity: {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    major: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    minor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    trivial: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  status: {
    new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    assigned: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    verified: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    reopened: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  priority: {
    P1: "bg-red-500/20 text-red-400 border-red-500/30",
    P2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    P3: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    P4: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  project_status: {
    planning: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    archived: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
};
```

#### Rendered Structure

```html
<span
  data-testid="{data-testid}"
  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {colorClasses} {className}"
>
  {formatLabel(value)}
</span>
```

`formatLabel` converts `in_progress` → `In Progress`, `P1` → `P1`, etc. (replace underscores with spaces, title case).

### Display Components (`src/components/display/`)

#### 1. `StatCard.tsx`

Dashboard metric card.

```tsx
import type { LucideIcon } from "lucide-react";

export interface StatCardTrend {
  value: string;        // e.g. "+12%"
  positive: boolean;
}

export interface StatCardProps {
  "data-testid": string;
  icon: LucideIcon;
  label: string;        // e.g. "Total Defects"
  value: string | number;
  trend?: StatCardTrend | null;
  className?: string;
}

<div data-testid={data - testid} class="glass p-6 {className}">
  <div class="flex items-center justify-between mb-4">
    <Icon class="w-8 h-8 text-neon-purple" />
    {trend && (
      <span
        data-testid="{testid}-trend"
        class="text-sm {trend.positive ? 'text-emerald-400' : 'text-red-400'}"
      >
        {trend.value}
      </span>
    )}
  </div>
  <p data-testid="{testid}-value" class="text-3xl font-bold text-white">
    {value}
  </p>
  <p class="text-sm text-gray-400 mt-1">{label}</p>
</div>
```

#### 2. `ActivityTimeline.tsx`

Vertical timeline for defect history and comments.

```tsx
export type ActivityEntryType = "comment" | "transition" | "created";

export interface ActivityEntry {
  id: number;
  type: ActivityEntryType;
  user: string;
  text: string;
  timestamp: string;    // ISO string
}

export interface ActivityTimelineProps {
  "data-testid": string;
  entries: ActivityEntry[];
  className?: string;
}

<div data-testid={data - testid} class="{className}">
  {entries.map((entry, i) => (
    <div
      key={entry.id}
      data-testid="{testid}-entry-{entry.id}"
      class="flex gap-4 pb-6 relative"
    >
      {/* Vertical line */}
      {i < entries.length - 1 && (
        <div class="absolute left-4 top-8 bottom-0 w-px bg-white/10" />
      )}
      {/* Icon circle */}
      <div
        class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                  {type === 'comment' ? 'bg-blue-500/20 text-blue-400' :
                   type === 'transition' ? 'bg-purple-500/20 text-purple-400' :
                   'bg-emerald-500/20 text-emerald-400'}"
      >
        {typeIcon}
      </div>
      {/* Content */}
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-200">{entry.user}</span>
          <span class="text-xs text-gray-500">
            {formatRelativeTime(entry.timestamp)}
          </span>
        </div>
        <p class="text-sm text-gray-400 mt-1">{entry.text}</p>
      </div>
    </div>
  ))}
</div>
```

Include a simple `formatRelativeTime(isoString)` helper inside the file (e.g., "2 hours ago", "3 days ago"). Keep it basic — no library.

#### 3. `UserAvatar.tsx`

Initials-based avatar with optional role badge.

```tsx
import type { Role } from "../../data/entities";

export type UserAvatarSize = "sm" | "md" | "lg";

export interface UserAvatarProps {
  "data-testid": string;
  fullName: string;                  // e.g. "Tom Tester" → "TT"
  avatarColor: string;               // hex, e.g. "#a855f7"
  role?: Role | null;                // if provided, show small role badge
  size?: UserAvatarSize;             // default "md"
  className?: string;
}

<div data-testid={data - testid} class="relative inline-flex {className}">
  <div
    class="rounded-full flex items-center justify-center font-bold text-white {sizeClasses}"
    style={{ backgroundColor: avatarColor }}
  >
    {getInitials(fullName)}
  </div>
  {role && (
    <span
      data-testid="{testid}-role"
      class="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 border border-white/10 text-gray-300"
    >
      {role === "qa_lead" ? "Lead" : role === "admin" ? "Admin" : "Test"}
    </span>
  )}
</div>
```

Sizes: `sm` = `w-8 h-8 text-xs`, `md` = `w-10 h-10 text-sm`, `lg` = `w-14 h-14 text-base`.

### `src/shared/testIds.ts` — Extend

Add builders for display components:

```ts
export const statCardValue = (testId: string): string => `${testId}-value`;
export const statCardTrend = (testId: string): string => `${testId}-trend`;
export const timelineEntry = (testId: string, entryId: number | string): string =>
  `${testId}-entry-${entryId}`;
export const avatarRole = (testId: string): string => `${testId}-role`;
```

## Verification Checklist

### Form Components

- [ ] TextInput renders label, input, error when provided
- [ ] TextInput shows red border + error text when `error` is set
- [ ] TextInput shows \* after label when `required`
- [ ] TextArea renders with configurable `rows`
- [ ] Select renders options from `options` prop, placeholder as first empty option
- [ ] MultiSelect dropdown toggles on click, checkboxes toggle selection
- [ ] MultiSelect shows "{n} selected" on button when items selected
- [ ] MultiSelect closes when clicking outside
- [ ] Checkbox renders checked/unchecked state
- [ ] RadioGroup renders all options, selected value highlighted
- [ ] DatePicker renders native date input with dark theme
- [ ] FileUpload shows fake filename on click
- [ ] All form components accept and display `error` prop
- [ ] All form components have `data-testid` on the input element

### StatusBadge

- [ ] Renders colored pill for each severity value (critical=red, major=amber, minor=blue, trivial=gray)
- [ ] Renders colored pill for each status value
- [ ] Renders colored pill for each priority value
- [ ] `formatLabel` converts `in_progress` → "In Progress"
- [ ] `data-testid` is set correctly

### Display Components

- [ ] StatCard shows icon, value, label, optional trend
- [ ] ActivityTimeline renders entries with vertical connecting line
- [ ] ActivityTimeline shows different icon/color per entry type
- [ ] UserAvatar shows initials from full name
- [ ] UserAvatar role badge shows shortened role label
- [ ] UserAvatar sizes (sm/md/lg) render different dimensions

## Do NOT

- Do not add form validation logic inside form components (they just display errors from parent)
- Do not add real file upload functionality
- Do not add date/time picker libraries
- Do not add animation libraries
- Use TypeScript (strict) per architecture §16b — `{Component}Props` interface per component. StatusBadge `type` prop uses literal unions (`"severity" | "status" | "priority" | "project_status"`). No PropTypes, no JSDoc, no `any`.
