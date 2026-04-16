# Task 4 — Modal & EmptyState Components

> **Layer**: 2 (Shared Components) · **Depends on**: T1 (testIds.ts), T2 (app shell) · **Parallelizable** with T3, T5-T7

## Objective

Build the `Modal` dialog component and the `EmptyState` placeholder component. These are used across the entire app — Modal for confirmations and form dialogs, EmptyState for empty tables, 404 pages, and permission-denied screens.

Note: `Toast.tsx` is already created in T2 as part of the layout. This task covers Modal and EmptyState only.

## Constraints

- Follow architecture §9 (Modal Props, EmptyState Props) for the API.
- All `data-testid` from `src/shared/testIds.ts`.
- Dark theme — `.glass` styling for the modal card, backdrop overlay.

## Files to Create

### 1. `src/components/feedback/Modal.tsx`

#### Props (per architecture §9)

```ts
export type ModalSize = "sm" | "md" | "lg" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;                 // called on backdrop click, escape, or close button
  title: string;
  size?: ModalSize;                    // default "md"
  closeOnBackdrop?: boolean;           // default true
  closeOnEscape?: boolean;             // default true
  children: React.ReactNode;
  footer?: React.ReactNode;            // optional footer area (action buttons)
  "data-testid": string;               // required on overlay container
}
```

#### Behavior

1. **Visibility**: When `isOpen` is false, render nothing (`return null`).
2. **Backdrop**: Full-screen fixed overlay with `bg-black/60 backdrop-blur-sm`. Click fires `onClose` if `closeOnBackdrop` is true.
3. **Escape key**: `useEffect` with `keydown` listener. Fires `onClose` if `closeOnEscape` is true. Clean up listener on unmount.
4. **Focus trap**: Not required (keep it simple).
5. **Body scroll lock**: Add `overflow-hidden` to `document.body` when open, remove on close/unmount.
6. **Animation**: Fade in backdrop + scale up card via Tailwind `transition` classes.
7. **Close button**: × button in top-right of header.

#### Sizes

| Size   | Width class       |
| ------ | ----------------- |
| `sm`   | `max-w-sm`        |
| `md`   | `max-w-lg`        |
| `lg`   | `max-w-3xl`       |
| `full` | `max-w-full mx-4` |

#### Rendered Structure

```html
<!-- Backdrop -->
<div
  data-testid="{data-testid}"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  onClick="{onClose"
  if
  closeOnBackdrop}
>
  <!-- Card (stop propagation) -->
  <div class="glass p-0 w-full {sizeClass} mx-4" onClick="{e" ="">
    e.stopPropagation()}>

    <!-- Header -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-white/10"
    >
      <h2 data-testid="{testid}-title" class="text-lg font-semibold">
        {title}
      </h2>
      <button
        data-testid="{testid}-btn-close"
        class="btn-ghost"
        onClick="{onClose}"
      >
        ×
      </button>
    </div>

    <!-- Body -->
    <div class="px-6 py-4">{children}</div>

    <!-- Footer (optional) -->
    {footer && (
    <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
      {footer}
    </div>
    )}
  </div>
</div>
```

### 2. `src/components/feedback/EmptyState.tsx`

Single component for all empty/missing/denied states per architecture §9 and §13.

#### Props

```ts
import type { LucideIcon } from "lucide-react";

export type EmptyStateVariant =
  | "no-results"
  | "not-found"
  | "permission-denied"
  | "no-defects"
  | "no-projects"
  | "no-test-plans"
  | "no-users"
  | (string & {}); // allow ad-hoc variants, preserve autocomplete for known ones

export interface EmptyStateProps {
  variant: EmptyStateVariant;          // used in data-testid: "empty-state-{variant}"
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;            // optional button or link
}
```

#### Rendered Structure

```html
<div
  data-testid="empty-state-{variant}"
  class="flex flex-col items-center justify-center py-16 text-center"
>
  {icon && <Icon class="w-12 h-12 text-gray-500 mb-4" />}
  <h3 class="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
  {message &&
  <p class="text-gray-500 mb-6 max-w-md">{message}</p>
  } {action &&
  <div>{action}</div>
  }
</div>
```

### 3. `src/shared/testIds.ts` — Extend

Add modal and empty state test ID helpers:

```ts
// Modal — dynamic based on the data-testid passed to Modal
export const modalTitle = (testId: string): string => `${testId}-title`;
export const modalBtnClose = (testId: string): string => `${testId}-btn-close`;

// EmptyState
import type { EmptyStateVariant } from "../components/feedback/EmptyState";
export const emptyState = (variant: EmptyStateVariant): string =>
  `empty-state-${variant}`;
```

## Verification Checklist

### Modal

- [ ] `isOpen={false}` renders nothing
- [ ] `isOpen={true}` shows backdrop overlay + centered card
- [ ] Clicking backdrop fires `onClose` (when `closeOnBackdrop={true}`)
- [ ] Clicking backdrop does NOT fire `onClose` when `closeOnBackdrop={false}`
- [ ] Pressing Escape fires `onClose` (when `closeOnEscape={true}`)
- [ ] Close button (×) fires `onClose`
- [ ] Clicking inside the card does NOT fire `onClose`
- [ ] `size` prop changes card width (sm/md/lg/full)
- [ ] `footer` prop renders below body with border separator
- [ ] Body scroll is locked when modal is open, restored on close
- [ ] `data-testid` is set on the backdrop overlay
- [ ] All interactive elements have `data-testid`

### EmptyState

- [ ] Renders icon, title, message, and action when provided
- [ ] Omits icon/message/action gracefully when not provided
- [ ] `data-testid="empty-state-{variant}"` is set correctly
- [ ] Looks good centered in a page area (vertically + horizontally)

## Do NOT

- Do not add focus trap or WAI-ARIA dialog roles (keep it simple)
- Do not add portal rendering (`createPortal`) — render in place
- Do not add animation libraries
- Use TypeScript (strict) per architecture §16b — `ModalProps` and `EmptyStateProps` interfaces. No PropTypes, no JSDoc, no `any`.
