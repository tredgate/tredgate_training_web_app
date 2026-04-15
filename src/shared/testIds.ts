export const TEST_IDS = {
  login: {
    page: "login-page",
    inputUsername: "login-input-username",
    inputPassword: "login-input-password",
    btnSubmit: "login-btn-submit",
    checkboxRemember: "login-checkbox-remember",
  },
  sidebar: {
    nav: "sidebar-nav",
    linkDashboard: "sidebar-link-dashboard",
    linkProjects: "sidebar-link-projects",
    linkDefects: "sidebar-link-defects",
    linkTestPlans: "sidebar-link-test-plans",
    linkTeam: "sidebar-link-team",
    linkReports: "sidebar-link-reports",
    linkSettings: "sidebar-link-settings",
    btnLogout: "sidebar-btn-logout",
    btnCollapse: "sidebar-btn-collapse",
  },
  footer: {
    btnReset: "footer-btn-reset",
    version: "footer-version",
  },
  breadcrumbs: {
    nav: "breadcrumbs-nav",
    link: "breadcrumbs-link",
  },
  toast: {
    success: "toast-success",
    error: "toast-error",
    warning: "toast-warning",
    btnDismiss: "toast-btn-dismiss",
  },
  emptyState: {
    container: "empty-state-container",
  },
  protectedRoute: {
    denied: "protected-route-denied",
  },
} as const;

export const buildTestId = (
  scope: string,
  element: string,
  qualifier: string,
): string => `${scope}-${element}-${qualifier}`;
