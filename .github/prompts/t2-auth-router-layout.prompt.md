# Task 2 — Auth Context, Router, Layout Shell

> **Layer**: 1 (Foundation) · **Depends on**: T1 (data layer) · **Blocking**: All Layer 2 + 3 tasks

## Objective

Set up the application shell: React Router with `createBrowserRouter`, AuthContext for login/logout/role management, ToastContext for notifications, the sidebar layout, breadcrumbs, page header, footer, and the ProtectedRoute wrapper. After this task, the app should boot, show a login page, authenticate with predefined users, display a role-aware sidebar, and protect routes.

## Constraints

- Follow `.github/instructions/architecture.instructions.md` — routing table (§5), auth (§6), sidebar structure (§11), styling (§10).
- Install `react-router-dom` as the only new dependency.
- All `data-testid` values MUST come from `src/shared/testIds.ts`. Extend the registry with new scopes as needed.
- Reuse existing custom CSS classes (`.glass`, `.btn-neon-purple`, `.btn-neon-blue`, `.input-dark`).
- Add new CSS classes to `src/index.css`: `.btn-neon-red`, `.btn-neon-green`, `.btn-ghost` per architecture §10.

## Files to Create / Modify

### 1. Install dependency

```bash
npm install react-router-dom
```

### 2. `src/contexts/AuthContext.tsx`

React context + provider. Shape per architecture §6. Types imported from `entities.ts` and `permissions.ts`.

```ts
import type { User, Role, DefectStatus } from "../data/entities";
import type { PermissionKey } from "../utils/permissions";

export interface AuthUser extends Pick<
  User,
  "id" | "username" | "role" | "fullName" | "email"
> {}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (action: PermissionKey, context?: DefectStatus) => boolean;
}
```

- `login` validates against users from `src/data/seed.ts` (or localStorage `tqh_users`).
- On successful login, store current user in `sessionStorage` (key: `tqh_current_user`) so it survives page refresh within the session.
- `logout` clears `sessionStorage` user and navigates to `/login`.
- `hasPermission` delegates to `permissions.ts`.
- Wrap the provider around the entire app in `main.tsx`.

### 3. `src/hooks/useAuth.ts`

```ts
import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../contexts/AuthContext";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
```

### 4. `src/contexts/ToastContext.tsx`

Simple notification state manager:

```ts
export type ToastType = "success" | "error" | "warning";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void; // default 4000ms
  removeToast: (id: number) => void;
}
```

- Auto-dismiss after `duration` ms using `setTimeout`.
- Generate unique IDs via `Date.now()` or a counter.
- Max 5 toasts visible at once (oldest removed first).

### 5. `src/hooks/useToast.ts`

```ts
import { useContext } from "react";
import { ToastContext, type ToastContextValue } from "../contexts/ToastContext";

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
```

### 6. `src/components/feedback/Toast.tsx`

Renders toast notifications from ToastContext. Positioned fixed top-right.

- Each toast: glass card with colored left border (green/success, red/error, amber/warning).
- Dismiss button (×) on each toast.
- `data-testid` from testIds.ts: `toast-success`, `toast-error`, `toast-warning`, `toast-btn-dismiss`.
- Animate in/out with Tailwind `transition` + `opacity`.

### 7. `src/components/layout/Sidebar.tsx`

Collapsible sidebar per architecture §11.

- Menu items filtered by current user's role.
- Active item highlighted with `neon-purple` accent.
- Collapse button toggles between full sidebar (icons + labels) and icon-only mode.
- Logout button at the bottom.
- App logo/name at the top: "TQH" with shield icon when collapsed, "TredGate QA Hub" when expanded.
- Use lucide-react icons: `LayoutDashboard`, `FolderKanban`, `Bug`, `ClipboardList`, `Users`, `BarChart3`, `Settings`, `LogOut`, `ChevronLeft`, `ChevronRight`, `Shield`.
- Sidebar width: expanded ~240px, collapsed ~64px.
- All navigation uses `<NavLink>` from react-router-dom.
- All elements get `data-testid` from testIds.ts.

### 8. `src/components/layout/Breadcrumbs.tsx`

Route-based breadcrumbs.

- Parse current route from `useLocation()`.
- Map path segments to labels (e.g., `/projects/3` → "Projects" → "Project #3").
- Accept an optional `labels` prop for custom segment labels (e.g., entity names).
- Render as `Home > Projects > Phoenix` with links except the last segment.
- `data-testid="breadcrumbs"` on the nav, `data-testid` per link.

### 9. `src/components/layout/PageHeader.tsx`

Reusable page title bar.

```ts
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backTo?: string; // renders a back arrow link
}
```

- `data-testid="page-header"`, `data-testid="page-header-title"`, `data-testid="page-header-btn-back"`.

### 10. `src/components/layout/ProtectedRoute.tsx`

Auth + role gate per architecture §5.

```ts
import type { Role } from "../../data/entities";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: readonly Role[];
}
// - Not authenticated → <Navigate to="/login" />
// - Authenticated but role not in allowedRoles → <EmptyState variant="permission-denied" />
// - Otherwise → render children
```

- `data-testid="protected-route-denied"` on the denied state.
- Uses `useAuth()` hook.

### 11. `src/components/layout/Footer.tsx`

Modify the existing footer. Keep "Reset Data" button, update version, add `data-testid` from testIds.ts.

- Reset button calls `resetAll()` from store.ts + reloads.
- Version: `v4.0.0`

### 12. `src/App.tsx` — Complete rewrite

Root layout component with `<Outlet>` from react-router-dom:

```jsx
// Structure:
// <div className="flex h-screen">
//   <Sidebar />
//   <div className="flex-1 flex flex-col overflow-auto">
//     <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
//       <Breadcrumbs />
//       <Outlet />    ← router renders page here
//     </div>
//     <Footer />
//   </div>
// </div>
// <Toast />   ← fixed positioned, outside layout flow
```

### 13. `src/main.tsx` — Rewrite

Set up `createBrowserRouter` with all routes per architecture §5:

```jsx
const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "profile", element: <Profile /> },
      { path: "projects", element: <ProjectList /> },
      { path: "projects/new", element: <ProjectForm /> },
      { path: "projects/:projectId", element: <ProjectDetail /> },
      { path: "projects/:projectId/edit", element: <ProjectForm /> },
      { path: "defects", element: <DefectList /> },
      { path: "defects/new", element: <DefectForm /> },
      { path: "defects/:defectId", element: <DefectDetail /> },
      { path: "defects/:defectId/edit", element: <DefectForm /> },
      { path: "test-plans", element: <TestPlanList /> },
      { path: "test-plans/new", element: <TestPlanForm /> },
      { path: "test-plans/:planId", element: <TestPlanDetail /> },
      { path: "test-plans/:planId/edit", element: <TestPlanForm /> },
      { path: "test-plans/:planId/execute", element: <TestRunExecution /> },
      { path: "team", element: <TeamList /> },
      {
        path: "team/:userId",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["qa_lead", "admin"]}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Settings />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <EmptyState variant="not-found" /> },
    ],
  },
]);
```

Wrap with `AuthProvider` and `ToastProvider`.

**For pages that don't exist yet**, create minimal placeholder files that just render their page name:

```tsx
// Example: src/pages/projects/ProjectList.tsx
export default function ProjectList(): JSX.Element {
  return (
    <div data-testid="project-list-page">
      <h1>Projects</h1>
      <p>Coming soon...</p>
    </div>
  );
}
```

Create placeholders for: `Dashboard`, `Profile`, `ProjectList`, `ProjectDetail`, `ProjectForm`, `DefectList`, `DefectDetail`, `DefectForm`, `TestPlanList`, `TestPlanDetail`, `TestPlanForm`, `TestRunExecution`, `TeamList`, `UserDetail`, `Reports`, `Settings`.

### 14. `src/pages/auth/Login.tsx` — Rewrite

Replace existing Login page:

- Username + password form using `.input-dark` styling.
- "Remember me" checkbox (stores preference in localStorage, auto-fills username).
- Show predefined user hints below the form (for training convenience): role badges with username/password.
- Submit validates credentials via `AuthContext.login()`.
- On success → navigate to `/dashboard`.
- On failure → show inline error message.
- Keep the existing styling tone (dark/neon theme).
- Use `useForm` hook from T1.
- All `data-testid` from testIds.ts.

### 15. `src/index.css` — Add new classes

Add to the `@layer components` block:

```css
.btn-neon-red {
  @apply btn-neon bg-red-500/80 hover:bg-red-500 text-white shadow-glow-red hover:shadow-glow-red;
}
.btn-neon-green {
  @apply btn-neon bg-emerald-500/80 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:shadow-[0_0_15px_rgba(16,185,129,0.5)];
}
.btn-ghost {
  @apply px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer;
}
```

### 16. `src/shared/testIds.ts` — Extend

Add test IDs for all new components in this task. Include scopes for: `sidebar`, `breadcrumbs`, `pageHeader`, `footer`, `toast`, `protectedRoute`, `login`.

## Existing Files to Delete

These are the original `.jsx` files from the pre-TypeScript codebase. They are replaced by the new `.tsx` files in their new locations:

- `src/components/Navbar.jsx` — replaced by Sidebar
- `src/pages/Login.jsx` — moved to `src/pages/auth/Login.tsx`
- `src/pages/Dashboard.jsx` — moved to `src/pages/dashboard/Dashboard.tsx` (as placeholder)
- `src/pages/DefectList.jsx` — moved to `src/pages/defects/DefectList.tsx` (as placeholder)
- `src/pages/ReportDefect.jsx` — replaced by `src/pages/defects/DefectForm.tsx` (as placeholder)
- `src/components/Footer.jsx` — replaced by `src/components/layout/Footer.tsx`
- `src/App.jsx` — replaced by `src/App.tsx`
- `src/main.jsx` — replaced by `src/main.tsx`
- `src/data/defects.js` — replaced by seed data in `src/data/seed.ts` (from T1)
- `src/hooks/useDefects.js` — replaced by `src/hooks/useDefects.ts` (later task)

## Verification Checklist

- [ ] `npm run dev` boots without errors
- [ ] Visiting `/` redirects to `/login` when not authenticated
- [ ] Login with `tester/test123` → navigates to `/dashboard`, sidebar shows: Dashboard, Projects, Defects, Test Plans, Team
- [ ] Login with `admin/admin123` → sidebar also shows: Reports, Settings
- [ ] Sidebar collapse toggle works (icons only ↔ full labels)
- [ ] Clicking sidebar links navigates to correct routes, active link highlighted
- [ ] Logout button clears session, redirects to `/login`
- [ ] Visiting `/settings` as `tester` shows permission-denied EmptyState
- [ ] Visiting `/nonexistent` shows not-found EmptyState
- [ ] Breadcrumbs show correct path segments
- [ ] Toast: calling `addToast("success", "Test")` from any page shows notification
- [ ] Page refresh while logged in maintains the session (sessionStorage)
- [ ] All interactive elements have `data-testid`
- [ ] New CSS classes `.btn-neon-red`, `.btn-neon-green`, `.btn-ghost` are defined
- [ ] `tsc --noEmit` passes under strict mode
- [ ] No `any`, no `@ts-ignore` anywhere

## Do NOT

- Do not build any page content beyond placeholders (those are Layer 3 tasks)
- Do not add real authentication or token-based auth
- Use TypeScript (strict) per architecture §16b — `Props` interface per component. Do not add PropTypes or JSDoc. No `any`, no `@ts-ignore`.
- Do not create barrel exports (`index.ts`)
- Do not add `console.log`
