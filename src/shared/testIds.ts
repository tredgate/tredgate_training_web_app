export const TEST_IDS = {
  login: {
    page: "login-page",
    inputUsername: "login-input-username",
    inputPassword: "login-input-password",
    btnSubmit: "login-btn-submit",
    checkboxRemember: "login-checkbox-remember",
    error: "login-error",
    userHints: "login-user-hints",
  },
  sidebar: {
    nav: "sidebar-nav",
    logo: "sidebar-logo",
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
    container: "footer",
    btnReset: "footer-btn-reset",
    version: "footer-version",
  },
  breadcrumbs: {
    nav: "breadcrumbs-nav",
    link: "breadcrumbs-link",
  },
  pageHeader: {
    container: "page-header",
    title: "page-header-title",
    btnBack: "page-header-btn-back",
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
  dashboard: {
    page: "dashboard-page",
  },
  profile: {
    page: "profile-page",
  },
  projectList: {
    page: "project-list-page",
  },
  projectDetail: {
    page: "project-detail-page",
  },
  projectForm: {
    page: "project-form-page",
  },
  defectList: {
    page: "defect-list-page",
  },
  defectDetail: {
    page: "defect-detail-page",
  },
  defectForm: {
    page: "defect-form-page",
  },
  testPlanList: {
    page: "test-plan-list-page",
  },
  testPlanDetail: {
    page: "test-plan-detail-page",
  },
  testPlanForm: {
    page: "test-plan-form-page",
  },
  testRunExecution: {
    page: "test-run-execution-page",
  },
  teamList: {
    page: "team-list-page",
  },
  userDetail: {
    page: "user-detail-page",
  },
  reports: {
    page: "reports-page",
  },
  settings: {
    page: "settings-page",
  },
  notFound: {
    page: "not-found-page",
  },
} as const;

export const buildTestId = (
  scope: string,
  element: string,
  qualifier: string,
): string => `${scope}-${element}-${qualifier}`;

// ─── DataTable dynamic builders ────────────────────────────────────────
export const dataTableRow = (prefix: string, id: number | string): string =>
  `${prefix}-row-${id}`;
export const dataTableCell = (
  prefix: string,
  column: string,
  id: number | string,
): string => `${prefix}-cell-${column}-${id}`;
export const dataTableBtn = (prefix: string, action: string): string =>
  `${prefix}-btn-${action}`;
export const dataTableCheckbox = (prefix: string, qualifier: string): string =>
  `${prefix}-checkbox-${qualifier}`;

// ─── Tabs builders ─────────────────────────────────────────────────────
export const tabsTestId = (prefix: string): string => `${prefix}-tabs`;
export const tabTestId = (prefix: string, key: string): string =>
  `${prefix}-tab-${key}`;
export const tabBadge = (prefix: string, key: string): string =>
  `${prefix}-tab-badge-${key}`;
export const tabPanel = (prefix: string, key: string): string =>
  `${prefix}-tab-panel-${key}`;

// ─── Wizard builders ───────────────────────────────────────────────────
export const wizardTestId = (prefix: string): string => `${prefix}-wizard`;
export const wizardStepIndicator = (prefix: string): string =>
  `${prefix}-wizard-step-indicator`;
export const wizardStep = (prefix: string, stepNum: number): string =>
  `${prefix}-wizard-step-${stepNum}`;
export const wizardContent = (prefix: string): string =>
  `${prefix}-wizard-content`;
export const wizardBtn = (prefix: string, action: string): string =>
  `${prefix}-wizard-btn-${action}`;

// ─── StatusBadge builders ──────────────────────────────────────────────
export const statusBadgeTestId = (prefix: string, type: string, value: string): string =>
  `${prefix}-badge-${type}-${value}`;

// ─── Display component builders ────────────────────────────────────────
export const statCardValue = (testId: string): string => `${testId}-value`;
export const statCardTrend = (testId: string): string => `${testId}-trend`;
export const timelineEntry = (
  testId: string,
  entryId: number | string,
): string => `${testId}-entry-${entryId}`;
export const avatarRole = (testId: string): string => `${testId}-role`;
