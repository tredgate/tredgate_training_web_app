import type { WizardAction } from "../components/navigation/Wizard";
import type { BadgeType } from "../components/feedback/StatusBadge";
import type { EmptyStateVariant } from "../components/feedback/EmptyState";

export const TEST_IDS = {
  errorBoundary: {
    container: "error-boundary",
    message: "error-boundary-message",
    btnRetry: "error-boundary-btn-retry",
    btnReload: "error-boundary-btn-reload",
  },
  login: {
    page: "login-page",
    inputUsername: "login-input-username",
    inputPassword: "login-input-password",
    inputUsernameError: "login-input-username-error",
    inputPasswordError: "login-input-password-error",
    btnSubmit: "login-btn-submit",
    headingTitle: "login-heading-title",
    textTagline: "login-text-tagline",
    labelUsername: "login-label-username",
    labelPassword: "login-label-password",
    labelRemember: "login-label-remember",
    checkboxRemember: "login-checkbox-remember",
    error: "login-error",
    userHints: "login-user-hints",
    textDemoCredentials: "login-text-demo-credentials",
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
    headingMyDefects: "dashboard-heading-my-defects",
    headingMyRuns: "dashboard-heading-my-runs",
    headingUnassigned: "dashboard-heading-unassigned",
    headingVerification: "dashboard-heading-verification",
    headingRecentActivity: "dashboard-heading-recent-activity",
    headingSystemOverview: "dashboard-heading-system-overview",
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
    headingProjectInfo: "project-detail-heading-project-info",
    labelStatus: "project-detail-label-status",
    labelQALead: "project-detail-label-qa-lead",
    labelDescription: "project-detail-label-description",
    textDescription: "project-detail-text-description",
    labelCreatedAt: "project-detail-label-created-at",
    textCreatedAt: "project-detail-text-created-at",
    labelUpdatedAt: "project-detail-label-updated-at",
    textUpdatedAt: "project-detail-text-updated-at",
    headingEnvironments: "project-detail-heading-environments",
    envHeaderName: "project-detail-env-header-name",
    envHeaderUrl: "project-detail-env-header-url",
    textDeleteConfirm: "project-detail-text-delete-confirm",
    textEmptyTeam: "project-detail-text-empty-team",
  },
  projectForm: {
    page: "project-form-page",
    step1: "project-form-step-1",
    step2: "project-form-step-2",
    step3: "project-form-step-3",
    step4: "project-form-step-4",
    inputName: "project-form-input-name",
    inputCode: "project-form-input-code",
    inputDescription: "project-form-input-description",
    selectStatus: "project-form-select-status",
    selectLead: "project-form-select-lead",
    selectMembers: "project-form-select-members",
    btnAddEnv: "project-form-btn-add-env",
    envsError: "project-form-envs-error",
    textNoEnvironments: "project-form-text-no-environments",
    headingReviewDetails: "project-form-heading-review-details",
    labelReviewName: "project-form-label-review-name",
    textReviewName: "project-form-text-review-name",
    labelReviewCode: "project-form-label-review-code",
    textReviewCode: "project-form-text-review-code",
    labelReviewStatus: "project-form-label-review-status",
    textReviewStatus: "project-form-text-review-status",
    labelReviewDescription: "project-form-label-review-description",
    textReviewDescription: "project-form-text-review-description",
    headingReviewTeam: "project-form-heading-review-team",
    labelReviewLead: "project-form-label-review-lead",
    textReviewLead: "project-form-text-review-lead",
    labelReviewMembers: "project-form-label-review-members",
    textReviewMembers: "project-form-text-review-members",
    headingReviewEnvs: "project-form-heading-review-environments",
    textNoEnvsConfigured: "project-form-text-no-envs-configured",
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
    headingDescription: "defect-detail-heading-description",
    textDescription: "defect-detail-text-description",
    headingSteps: "defect-detail-heading-steps",
    textSteps: "defect-detail-text-steps",
    comments: "defect-detail-comments",
    headingComments: "defect-detail-heading-comments",
    textNoComments: "defect-detail-text-no-comments",
    inputComment: "defect-detail-input-comment",
    btnAddComment: "defect-detail-btn-add-comment",
    cardStatus: "defect-detail-card-status",
    headingStatus: "defect-detail-heading-status",
    labelCurrentStatus: "defect-detail-label-current-status",
    labelSeverity: "defect-detail-label-severity",
    labelPriority: "defect-detail-label-priority",
    cardAssignment: "defect-detail-card-assignment",
    headingAssignment: "defect-detail-heading-assignment",
    labelReporter: "defect-detail-label-reporter",
    textReporterName: "defect-detail-text-reporter-name",
    textReporterUnknown: "defect-detail-text-reporter-unknown",
    labelAssignee: "defect-detail-label-assignee",
    textAssigneeName: "defect-detail-text-assignee-name",
    textUnassigned: "defect-detail-text-unassigned",
    cardDetails: "defect-detail-card-details",
    headingDetails: "defect-detail-heading-details",
    labelProject: "defect-detail-label-project",
    linkProject: "defect-detail-link-project",
    textProjectUnknown: "defect-detail-text-project-unknown",
    labelEnvironment: "defect-detail-label-environment",
    textEnvironment: "defect-detail-text-environment",
    textEnvironmentNotSpecified: "defect-detail-text-environment-not-specified",
    labelCreated: "defect-detail-label-created",
    textCreated: "defect-detail-text-created",
    labelUpdated: "defect-detail-label-updated",
    textUpdated: "defect-detail-text-updated",
    timeline: "defect-detail-timeline",
    headingHistory: "defect-detail-heading-history",
    modalAssign: "modal-assign-defect",
    modalAssignSelect: "modal-assign-select-assignee",
    btnCancelAssign: "defect-detail-btn-cancel-assign",
  },
  defectForm: {
    page: "defect-form-page",
    step1: "defect-form-step-1",
    step2: "defect-form-step-2",
    step3: "defect-form-step-3",
    step4: "defect-form-step-4",
    textReviewSeverity: "defect-form-review-severity",
    textReviewPriority: "defect-form-review-priority",
    textReviewAssignee: "defect-form-review-assignee",
    inputTitle: "defect-form-input-title",
    selectProject: "defect-form-select-project",
    selectSeverity: "defect-form-select-severity",
    selectPriority: "defect-form-select-priority",
    inputDescription: "defect-form-input-description",
    inputSteps: "defect-form-input-steps",
    selectEnvironment: "defect-form-select-environment",
    selectAssignee: "defect-form-select-assignee",
    selectTestCases: "defect-form-select-test-cases",
    selectTestCasesSearch: "defect-form-select-test-cases-search",
    selectTestCasesNoResults: "defect-form-select-test-cases-no-results",
    textSelectProjectForEnv: "defect-form-text-select-project-for-env",
    textSelectProjectForAssign: "defect-form-text-select-project-for-assign",
    textNoTestCases: "defect-form-text-no-test-cases",
    labelReviewTitle: "defect-form-label-review-title",
    textReviewTitle: "defect-form-text-review-title",
    labelReviewProject: "defect-form-label-review-project",
    textReviewProject: "defect-form-text-review-project",
    labelReviewSeverity: "defect-form-label-review-severity",
    labelReviewPriority: "defect-form-label-review-priority",
    labelReviewDescription: "defect-form-label-review-description",
    textReviewDescription: "defect-form-text-review-description",
    labelReviewSteps: "defect-form-label-review-steps",
    textReviewSteps: "defect-form-text-review-steps",
    labelReviewEnvironment: "defect-form-label-review-environment",
    textReviewEnvironment: "defect-form-text-review-environment",
    labelReviewAssignee: "defect-form-label-review-assignee",
    textReviewAssigneeName: "defect-form-text-review-assignee-name",
  },
  testplanList: {
    page: "testplan-list-page",
    btnNew: "testplan-list-btn-new",
  },
  testplanDetail: {
    page: "testplan-detail-page",
    btnEdit: "testplan-detail-btn-edit",
    btnExecute: "testplan-detail-btn-execute",
    overview: "testplan-detail-overview",
    cases: "testplan-detail-cases",
    history: "testplan-detail-history",
    headingPlanInfo: "testplan-detail-heading-plan-info",
    labelStatus: "testplan-detail-label-status",
    labelProject: "testplan-detail-label-project",
    textProject: "testplan-detail-text-project",
    labelDescription: "testplan-detail-label-description",
    textDescription: "testplan-detail-text-description",
    labelAssignee: "testplan-detail-label-assignee",
    textUnassigned: "testplan-detail-text-unassigned",
    labelCreated: "testplan-detail-label-created",
    textCreated: "testplan-detail-text-created",
    labelUpdated: "testplan-detail-label-updated",
    textUpdated: "testplan-detail-text-updated",
    statTotalCasesValue: "testplan-detail-stat-total-cases-value",
    statTotalCasesLabel: "testplan-detail-stat-total-cases-label",
    statTotalStepsValue: "testplan-detail-stat-total-steps-value",
    statTotalStepsLabel: "testplan-detail-stat-total-steps-label",
    statPassRateValue: "testplan-detail-stat-pass-rate-value",
    statPassRateLabel: "testplan-detail-stat-pass-rate-label",
    textNoCases: "testplan-detail-text-no-cases",
    textNoRuns: "testplan-detail-text-no-runs",
    modalLabelStatus: "testplan-detail-modal-label-status",
    modalLabelResults: "testplan-detail-modal-label-results",
    modalLabelStarted: "testplan-detail-modal-label-started",
    modalTextStarted: "testplan-detail-modal-text-started",
    modalLabelCompleted: "testplan-detail-modal-label-completed",
    modalTextCompleted: "testplan-detail-modal-text-completed",
  },
  testplanForm: {
    page: "testplan-form-page",
    step1: "testplan-form-step-1",
    step2: "testplan-form-step-2",
    step3: "testplan-form-step-3",
    inputName: "testplan-form-input-name",
    selectProject: "testplan-form-select-project",
    inputDescription: "testplan-form-input-description",
    selectAssignee: "testplan-form-select-assignee",
    btnAddCase: "testplan-form-btn-add-case",
    casesError: "testplan-form-cases-error",
    textNoCases: "testplan-form-text-no-cases",
    headingReviewSummary: "testplan-form-heading-review-summary",
    labelReviewName: "testplan-form-label-review-name",
    textReviewName: "testplan-form-text-review-name",
    labelReviewProject: "testplan-form-label-review-project",
    textReviewProject: "testplan-form-text-review-project",
    labelReviewDescription: "testplan-form-label-review-description",
    textReviewDescription: "testplan-form-text-review-description",
    labelReviewAssignee: "testplan-form-label-review-assignee",
    textReviewAssignee: "testplan-form-text-review-assignee",
    headingReviewCases: "testplan-form-heading-review-cases",
  },
  testrunExecution: {
    page: "testrun-execution-page",
    progressBar: "testrun-progress-bar",
    btnPrevCase: "testrun-btn-prev-case",
    btnNextCase: "testrun-btn-next-case",
    btnComplete: "testrun-btn-complete",
    textProgressCases: "testrun-text-progress-cases",
    textProgressPercent: "testrun-text-progress-percent",
    headingCurrentCase: "testrun-heading-current-case",
    textCurrentCaseDescription: "testrun-text-current-case-description",
    textCaseStatus: "testrun-text-case-status",
    inputFailNote: "testrun-input-fail-note",
    labelFailNote: "testrun-label-fail-note",
    btnCancelFail: "testrun-btn-cancel-fail",
    btnRecordFailure: "testrun-btn-record-failure",
  },
  teamList: {
    page: "team-list-page",
    table: "team-list-table",
    inputSearch: "team-list-input-search",
    selectRoleFilter: "team-list-select-role-filter",
    selectStatusFilter: "team-list-select-status-filter",
    textStatusActive: "team-list-text-status-active",
    textStatusInactive: "team-list-text-status-inactive",
  },
  userDetail: {
    page: "user-detail-page",
    profile: "user-detail-profile",
    activity: "user-detail-activity",
    projects: "user-detail-projects",
    stats: "user-detail-stats",
    btnEdit: "user-detail-btn-edit",
    selectRole: "user-detail-select-role",
    selectProjects: "user-detail-select-projects",
    btnSave: "user-detail-btn-save",
    btnCancel: "user-detail-btn-cancel",
    headingName: "user-detail-heading-name",
    textEmail: "user-detail-text-email",
    headingRecentDefects: "user-detail-heading-recent-defects",
    headingRecentRuns: "user-detail-heading-recent-runs",
    headingProjects: "user-detail-heading-projects",
    textNoDefects: "user-detail-text-no-defects",
    textNoRuns: "user-detail-text-no-runs",
    textNoProjects: "user-detail-text-no-projects",
    statDefectsReportedLabel: "user-detail-stat-defects-reported-label",
    statDefectsReportedValue: "user-detail-stat-defects-reported-value",
    statDefectsAssignedLabel: "user-detail-stat-defects-assigned-label",
    statDefectsAssignedValue: "user-detail-stat-defects-assigned-value",
    statRunsExecutedLabel: "user-detail-stat-runs-executed-label",
    statRunsExecutedValue: "user-detail-stat-runs-executed-value",
  },
  reports: {
    page: "reports-page",
    filterProject: "reports-filter-project",
    filterDateFrom: "reports-filter-date-from",
    filterDateTo: "reports-filter-date-to",
    defectStats: "reports-defect-stats",
    severityTable: "reports-severity-table",
    statusTable: "reports-status-table",
    projectTable: "reports-project-table",
    coverageStats: "reports-coverage-stats",
    plansTable: "reports-plans-table",
    workloadTable: "reports-workload-table",
    topReporters: "reports-top-reporters",
    topExecutors: "reports-top-executors",
    headingFilters: "reports-heading-filters",
    headingSeverity: "reports-heading-severity",
    headingStatus: "reports-heading-status",
    headingProject: "reports-heading-project",
    headingPlansSummary: "reports-heading-plans-summary",
    headingWorkload: "reports-heading-workload",
    headingTopReporters: "reports-heading-top-reporters",
    headingTopExecutors: "reports-heading-top-executors",
    colSeverity: "reports-col-severity",
    colSeverityCount: "reports-col-severity-count",
    colSeverityPct: "reports-col-severity-pct",
    colStatus: "reports-col-status",
    colStatusCount: "reports-col-status-count",
    colStatusPct: "reports-col-status-pct",
    colProjectName: "reports-col-project-name",
    colProjectTotal: "reports-col-project-total",
    colProjectOpen: "reports-col-project-open",
    colProjectResolved: "reports-col-project-resolved",
    colProjectClosed: "reports-col-project-closed",
    colPlanName: "reports-col-plan-name",
    colPlanProject: "reports-col-plan-project",
    colPlanCases: "reports-col-plan-cases",
    colPlanRuns: "reports-col-plan-runs",
    colPlanLastRun: "reports-col-plan-last-run",
    colPlanPassRate: "reports-col-plan-pass-rate",
    colWorkloadName: "reports-col-workload-name",
    colWorkloadRole: "reports-col-workload-role",
    colWorkloadAssigned: "reports-col-workload-assigned",
    colWorkloadReported: "reports-col-workload-reported",
    colWorkloadExecuted: "reports-col-workload-executed",
    colWorkloadOpenItems: "reports-col-workload-open-items",
    textNoReporters: "reports-text-no-reporters",
    textNoExecutors: "reports-text-no-executors",
  },
  settings: {
    page: "settings-page",
    btnReset: "settings-btn-reset",
    btnClear: "settings-btn-clear",
    btnExport: "settings-btn-export",
    btnImport: "settings-btn-import",
    systemInfo: "settings-system-info",
    headingDataManagement: "settings-heading-data-management",
    headingSystemInfo: "settings-heading-system-info",
    headingEntityCounts: "settings-heading-entity-counts",
    labelAppVersion: "settings-label-app-version",
    textAppVersion: "settings-text-app-version",
    labelStorageUsage: "settings-label-storage-usage",
    textStorageUsage: "settings-text-storage-usage",
    labelUsers: "settings-label-users",
    textUsersCount: "settings-text-users-count",
    labelProjects: "settings-label-projects",
    textProjectsCount: "settings-text-projects-count",
    labelDefects: "settings-label-defects",
    textDefectsCount: "settings-text-defects-count",
    labelTestPlans: "settings-label-test-plans",
    textTestPlansCount: "settings-text-test-plans-count",
    labelTestRuns: "settings-label-test-runs",
    textTestRunsCount: "settings-text-test-runs-count",
    textResetConfirm: "settings-text-reset-confirm",
    textClearConfirm: "settings-text-clear-confirm",
    textImportInstructions: "settings-text-import-instructions",
    textFileLoaded: "settings-text-file-loaded",
  },
  profile: {
    page: "profile-page",
    inputName: "profile-input-name",
    inputEmail: "profile-input-email",
    btnSave: "profile-btn-save",
    activity: "profile-activity",
    headingName: "profile-heading-name",
    labelRole: "profile-label-role",
    labelUsername: "profile-label-username",
    textUsername: "profile-text-username",
    headingActivity: "profile-heading-activity",
    textMyDefectsLabel: "profile-text-my-defects-label",
    textMyDefectsValue: "profile-text-my-defects-value",
    textMyDefectsSubtitle: "profile-text-my-defects-subtitle",
    textAssignedLabel: "profile-text-assigned-label",
    textAssignedValue: "profile-text-assigned-value",
    textAssignedSubtitle: "profile-text-assigned-subtitle",
    textTestRunsLabel: "profile-text-test-runs-label",
    textTestRunsValue: "profile-text-test-runs-value",
    textTestRunsSubtitle: "profile-text-test-runs-subtitle",
    textProjectsLabel: "profile-text-projects-label",
    textNoProjects: "profile-text-no-projects",
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

// ─── ProjectDetail dynamic builders ───────────────────────────────────
export const projectDetailEnvRow = (envId: number): string =>
  `project-detail-env-row-${envId}`;
export const projectDetailEnvCellName = (envId: number): string =>
  `project-detail-env-cell-name-${envId}`;
export const projectDetailEnvCellType = (envId: number): string =>
  `project-detail-env-cell-type-${envId}`;
export const projectDetailEnvCellUrl = (envId: number): string =>
  `project-detail-env-cell-url-${envId}`;
export const projectDetailMemberName = (memberId: number): string =>
  `project-detail-text-member-name-${memberId}`;
export const projectDetailMemberEmail = (memberId: number): string =>
  `project-detail-text-member-email-${memberId}`;

// ─── ProjectForm review environment builders ──────────────────────────
export const projectFormReviewEnvName = (index: number): string =>
  `project-form-review-env-name-${index}`;
export const projectFormReviewEnvUrl = (index: number): string =>
  `project-form-review-env-url-${index}`;

// ─── Login hint builders ───────────────────────────────────────────────
export const loginHintItem = (role: string): string => `login-hint-${role}`;
export const loginHintRole = (role: string): string =>
  `login-hint-role-${role}`;
export const loginHintCredentials = (role: string): string =>
  `login-hint-credentials-${role}`;

// ─── Defect-related builders ───────────────────────────────────────────
export const defectBadge = (
  type: "severity" | "status" | "priority",
  id: number,
): string => `defect-badge-${type}-${id}`;
export const defectDetailBtn = (action: string): string =>
  `defect-detail-btn-${action}`;
export const defectCommentEntry = (commentId: number): string =>
  `defect-detail-comment-${commentId}`;
export const defectCommentAuthor = (commentId: number): string =>
  `defect-detail-comment-${commentId}-author`;
export const defectCommentDate = (commentId: number): string =>
  `defect-detail-comment-${commentId}-date`;
export const defectCommentText = (commentId: number): string =>
  `defect-detail-comment-${commentId}-text`;

// ─── TestPlan-related builders ────────────────────────────────────────
export const testplanCase = (caseIndex: number): string =>
  `testplan-case-${caseIndex}`;
export const testplanCaseToggle = (caseIndex: number): string =>
  `testplan-case-${caseIndex}-toggle`;
export const testplanDetailCaseName = (caseIndex: number): string =>
  `testplan-detail-case-${caseIndex}-heading-name`;
export const testplanDetailCaseDescription = (caseIndex: number): string =>
  `testplan-detail-case-${caseIndex}-text-description`;
export const testplanDetailCaseStepsLabel = (caseIndex: number): string =>
  `testplan-detail-case-${caseIndex}-label-steps`;
export const testplanDetailStepAction = (
  caseIndex: number,
  stepIndex: number,
): string => `testplan-detail-case-${caseIndex}-step-${stepIndex}-text-action`;
export const testplanDetailStepExpected = (
  caseIndex: number,
  stepIndex: number,
): string =>
  `testplan-detail-case-${caseIndex}-step-${stepIndex}-text-expected`;
export const testplanDetailResultCase = (index: number): string =>
  `testplan-detail-modal-result-${index}-text-case`;
export const testplanDetailResultNote = (index: number): string =>
  `testplan-detail-modal-result-${index}-text-note`;
export const testplanFormCaseRow = (caseIndex: number): string =>
  `testplan-form-case-${caseIndex}`;
export const testplanFormCaseStepsLabel = (caseIndex: number): string =>
  `testplan-form-case-${caseIndex}-label-steps`;
export const testplanFormStepRow = (
  caseIndex: number,
  stepIndex: number,
): string => `testplan-form-case-${caseIndex}-step-${stepIndex}`;
export const testplanFormReviewCaseName = (index: number): string =>
  `testplan-form-review-case-${index}-name`;
export const testplanFormReviewCaseSteps = (index: number): string =>
  `testplan-form-review-case-${index}-steps`;

// ─── TestPlanForm validation error builders ───────────────────────────
export const testplanFormCaseStepsError = (caseIndex: number): string =>
  `testplan-form-case-${caseIndex}-steps-error`;
export const testplanFormStepActionError = (
  caseIndex: number,
  stepIndex: number,
): string => `testplan-form-case-${caseIndex}-step-${stepIndex}-action-error`;
export const testplanFormStepExpectedError = (
  caseIndex: number,
  stepIndex: number,
): string => `testplan-form-case-${caseIndex}-step-${stepIndex}-expected-error`;

// ─── TestRun Execution builders ───────────────────────────────────────
export const testrunStepBtn = (
  caseIdx: number,
  stepIdx: number,
  verdict: "pass" | "fail" | "skip",
): string => `testrun-step-${caseIdx}-${stepIdx}-${verdict}`;
export const testrunStepNumber = (caseIdx: number, stepIdx: number): string =>
  `testrun-step-${caseIdx}-${stepIdx}-number`;
export const testrunStepResultStatus = (
  caseIdx: number,
  stepIdx: number,
): string => `testrun-step-${caseIdx}-${stepIdx}-result`;
export const testrunStepActionLabel = (
  caseIdx: number,
  stepIdx: number,
): string => `testrun-step-${caseIdx}-${stepIdx}-label-action`;
export const testrunStepActionValue = (
  caseIdx: number,
  stepIdx: number,
): string => `testrun-step-${caseIdx}-${stepIdx}-text-action`;
export const testrunStepExpectedLabel = (
  caseIdx: number,
  stepIdx: number,
): string => `testrun-step-${caseIdx}-${stepIdx}-label-expected`;
export const testrunStepExpectedValue = (
  caseIdx: number,
  stepIdx: number,
): string => `testrun-step-${caseIdx}-${stepIdx}-text-expected`;
export const testrunStepNoteLabel = (
  caseIdx: number,
  stepIdx: number,
): string => `testrun-step-${caseIdx}-${stepIdx}-label-note`;
export const testrunStepNoteValue = (
  caseIdx: number,
  stepIdx: number,
): string => `testrun-step-${caseIdx}-${stepIdx}-text-note`;

// ─── UserDetail dynamic builders ──────────────────────────────────────
export const userDetailDefectTitle = (id: number): string =>
  `user-detail-text-defect-title-${id}`;
export const userDetailDefectDate = (id: number): string =>
  `user-detail-text-defect-date-${id}`;
export const userDetailRunName = (id: number): string =>
  `user-detail-text-run-name-${id}`;
export const userDetailRunDate = (id: number): string =>
  `user-detail-text-run-date-${id}`;
export const userDetailProjectName = (id: number): string =>
  `user-detail-text-project-name-${id}`;
export const userDetailProjectRole = (id: number): string =>
  `user-detail-text-project-role-${id}`;
