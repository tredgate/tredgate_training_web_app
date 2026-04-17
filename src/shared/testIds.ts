import type { WizardAction } from "../components/navigation/Wizard";
import type { BadgeType } from "../components/feedback/StatusBadge";
import type { EmptyStateVariant } from "../components/feedback/EmptyState";

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
    cardTotalDefects: "dashboard-card-total-defects",
    cardOpenDefects: "dashboard-card-open-defects",
    cardTestPlans: "dashboard-card-test-plans",
    cardPassRate: "dashboard-card-pass-rate",
    cardTotalUsers: "dashboard-card-total-users",
    cardTotalProjects: "dashboard-card-total-projects",
    cardActiveProjects: "dashboard-card-active-projects",
    myDefectsTable: "dashboard-my-defects-table",
    myRunsTable: "dashboard-my-runs-table",
    unassignedTable: "dashboard-unassigned-table",
    verificationTable: "dashboard-verification-table",
    activityTimeline: "dashboard-activity-timeline",
  },
  profile: {
    page: "profile-page",
  },
  projectList: {
    page: "project-list-page",
    btnNew: "project-list-btn-new",
  },
  projectDetail: {
    page: "project-detail-page",
    btnEdit: "project-detail-btn-edit",
    btnDelete: "project-detail-btn-delete",
    envTable: "project-detail-env-table",
    defectsTable: "project-detail-defects-table",
    plansTable: "project-detail-plans-table",
    teamList: "project-detail-team-list",
  },
  projectForm: {
    page: "project-form-page",
    inputName: "project-form-input-name",
    inputCode: "project-form-input-code",
    inputDescription: "project-form-input-description",
    selectStatus: "project-form-select-status",
    selectLead: "project-form-select-lead",
    selectMembers: "project-form-select-members",
    btnAddEnv: "project-form-btn-add-env",
  },
  defectList: {
    page: "defect-list-page",
    btnNew: "defect-list-btn-new",
    table: "defect-list-table",
    inputSearch: "defect-list-input-search",
    selectSeverityFilter: "defect-list-select-severity-filter",
    selectStatusFilter: "defect-list-select-status-filter",
    selectPriorityFilter: "defect-list-select-priority-filter",
    selectProjectFilter: "defect-list-select-project-filter",
  },
  defectDetail: {
    page: "defect-detail-page",
    btnEdit: "defect-detail-btn-edit",
    description: "defect-detail-description",
    comments: "defect-detail-comments",
    inputComment: "defect-detail-input-comment",
    btnAddComment: "defect-detail-btn-add-comment",
    cardStatus: "defect-detail-card-status",
    cardAssignment: "defect-detail-card-assignment",
    cardDetails: "defect-detail-card-details",
    timeline: "defect-detail-timeline",
    modalAssign: "modal-assign-defect",
    modalAssignSelect: "modal-assign-select-assignee",
  },
  defectForm: {
    page: "defect-form-page",
    inputTitle: "defect-form-input-title",
    selectProject: "defect-form-select-project",
    selectSeverity: "defect-form-select-severity",
    selectPriority: "defect-form-select-priority",
    inputDescription: "defect-form-input-description",
    inputSteps: "defect-form-input-steps",
    selectEnvironment: "defect-form-select-environment",
    selectAssignee: "defect-form-select-assignee",
    selectTestCases: "defect-form-select-test-cases",
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
export const wizardBtn = (prefix: string, action: WizardAction): string =>
  `${prefix}-wizard-btn-${action}`;

// ─── StatusBadge builders ──────────────────────────────────────────────
export const statusBadgeTestId = (
  prefix: string,
  type: BadgeType,
  value: string,
): string => `${prefix}-badge-${type}-${value}`;

// ─── Display component builders ────────────────────────────────────────
export const statCardValue = (testId: string): string => `${testId}-value`;
export const statCardTrend = (testId: string): string => `${testId}-trend`;
export const timelineEntry = (
  testId: string,
  entryId: number | string,
): string => `${testId}-entry-${entryId}`;
export const avatarRole = (testId: string): string => `${testId}-role`;

// ─── Modal builders ────────────────────────────────────────────────────
export const modalTitle = (testId: string): string => `${testId}-title`;
export const modalBtnClose = (testId: string): string => `${testId}-btn-close`;

// ─── EmptyState builder ───────────────────────────────────────────────
export const emptyState = (variant: EmptyStateVariant): string =>
  `empty-state-${variant}`;

// ─── ProjectForm environment row builders ──────────────────────────────
export const projectFormEnvRow = (index: number): string =>
  `project-form-env-row-${index}`;
export const projectFormEnvRemove = (index: number): string =>
  `project-form-btn-remove-env-${index}`;

// ─── Defect-related builders ───────────────────────────────────────────
export const defectBadge = (type: "severity" | "status" | "priority", id: number): string =>
  `defect-badge-${type}-${id}`;
export const defectDetailBtn = (action: string): string =>
  `defect-detail-btn-${action}`;
export const defectCommentEntry = (commentId: number): string =>
  `defect-detail-comment-${commentId}`;
