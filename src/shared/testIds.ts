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
