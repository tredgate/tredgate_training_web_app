import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  TEST_IDS,
  dataTableCell,
  dataTableRow,
  testplanCase,
  testplanCaseToggle,
  testplanDetailCaseName,
  testplanDetailCaseDescription,
  testplanDetailCaseStepsLabel,
  testplanDetailStepAction,
  testplanDetailStepExpected,
  testplanDetailResultCase,
  testplanDetailResultNote,
} from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import Tabs from "../../components/navigation/Tabs";
import EmptyState from "../../components/feedback/EmptyState";
import StatusBadge from "../../components/feedback/StatusBadge";
import UserAvatar from "../../components/display/UserAvatar";
import DataTable from "../../components/data/DataTable";
import Modal from "../../components/feedback/Modal";
import { useAuth } from "../../hooks/useAuth";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useTestRuns } from "../../hooks/useTestRuns";
import { useProjects } from "../../hooks/useProjects";
import { useUsers } from "../../hooks/useUsers";
import { t } from "../../i18n";
import { hasPermission } from "../../utils/permissions";
import type { Column } from "../../components/data/DataTable";
import type { TestRun } from "../../data/entities";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface RunResultsModalData {
  run: TestRun | null;
}

export default function TestPlanDetail() {
  const { planId: id } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { testPlans, getById } = useTestPlans();
  const { testRuns, create: createTestRun } = useTestRuns();
  const { projects } = useProjects();
  const { users } = useUsers();
  const [activeTab, setActiveTab] = useState("overview");
  const [resultsModal, setResultsModal] = useState<RunResultsModalData>({
    run: null,
  });
  const [expandedCases, setExpandedCases] = useState<Set<number>>(new Set());

  if (!user) return null;

  const planId = id ? parseInt(id, 10) : null;
  const testPlan = planId ? getById(planId) : null;

  if (!testPlan) {
    return (
      <div data-testid={TEST_IDS.testplanDetail.page}>
        <EmptyState
          variant="not-found"
          title={t.testPlanDetail.notFoundTitle}
          message={t.testPlanDetail.notFoundMessage}
        />
      </div>
    );
  }

  // Get project name
  const project = projects.find((p) => p.id === testPlan.projectId);

  // Get assignee info
  const assignee = testPlan.assigneeId
    ? users.find((u) => u.id === testPlan.assigneeId)
    : null;

  // Get test runs for this plan
  const planRuns = testRuns.filter((tr) => tr.testPlanId === testPlan.id);

  // Calculate test case metrics
  const totalCases = testPlan.testCases.length;
  const totalSteps = testPlan.testCases.reduce(
    (sum, tc) => sum + tc.steps.length,
    0,
  );

  // Get last run result
  const lastRun = planRuns.length > 0 ? planRuns[planRuns.length - 1] : null;
  const lastRunPassRate =
    lastRun && lastRun.results.length > 0
      ? Math.round(
          (lastRun.results.filter((r) => r.status === "passed").length /
            lastRun.results.length) *
            100,
        )
      : 0;

  // Handle start new run
  const handleStartRun = () => {
    const newRun = createTestRun({
      testPlanId: testPlan.id,
      executorId: user.id,
      status: "in_progress" as const,
      results: testPlan.testCases.map((tc) => ({
        testCaseId: tc.id,
        status: "not_run" as const,
        notes: "",
        duration: null,
      })),
    });
    navigate(`/test-runs/${newRun.id}/execute`);
  };

  // Toggle case expansion
  const toggleCaseExpansion = (caseId: number) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(caseId)) {
      newExpanded.delete(caseId);
    } else {
      newExpanded.add(caseId);
    }
    setExpandedCases(newExpanded);
  };

  const tabs = [
    { key: "overview", label: t.testPlanDetail.tabOverview },
    { key: "cases", label: t.testPlanDetail.tabCases, badge: totalCases },
    {
      key: "history",
      label: t.testPlanDetail.tabHistory,
      badge: planRuns.length,
    },
  ];

  return (
    <div data-testid={TEST_IDS.testplanDetail.page}>
      <PageHeader
        title={testPlan.name}
        backTo="/test-plans"
        actions={
          <div className="flex gap-2">
            {hasPermission(user.role, "testplan:edit") && (
              <Link
                to={`/test-plans/${testPlan.id}/edit`}
                className="btn btn-secondary"
                data-testid={TEST_IDS.testplanDetail.btnEdit}
              >
                {t.testPlanDetail.btnEdit}
              </Link>
            )}
            <button
              className="btn btn-primary"
              data-testid={TEST_IDS.testplanDetail.btnExecute}
            >
              {t.testPlanDetail.btnExecuteRun}
            </button>
          </div>
        }
      />

      <div className="mt-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          testIdPrefix="testplan-detail"
        />

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div
            data-testid={TEST_IDS.testplanDetail.overview}
            className="mt-6 space-y-6"
          >
            {/* Plan Info Card */}
            <div className="glass p-6 rounded-lg">
              <h3
                className="text-lg font-semibold text-white mb-4"
                data-testid={TEST_IDS.testplanDetail.headingPlanInfo}
              >
                {t.testPlanDetail.sectionPlanInfo}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p
                    className="text-sm text-gray-400 mb-1"
                    data-testid={TEST_IDS.testplanDetail.labelStatus}
                  >
                    {t.testPlanDetail.labelStatus}
                  </p>
                  <StatusBadge
                    data-testid="testplan-detail-status"
                    type="testplan_status"
                    value={testPlan.status}
                  />
                </div>
                <div>
                  <p
                    className="text-sm text-gray-400 mb-1"
                    data-testid={TEST_IDS.testplanDetail.labelProject}
                  >
                    {t.testPlanDetail.labelProject}
                  </p>
                  <p
                    className="text-white font-medium"
                    data-testid={TEST_IDS.testplanDetail.textProject}
                  >
                    {project?.name || t.testPlanDetail.unknownProject}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm text-gray-400 mb-1"
                    data-testid={TEST_IDS.testplanDetail.labelDescription}
                  >
                    {t.testPlanDetail.labelDescription}
                  </p>
                  <p
                    className="text-gray-300"
                    data-testid={TEST_IDS.testplanDetail.textDescription}
                  >
                    {testPlan.description}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm text-gray-400 mb-1"
                    data-testid={TEST_IDS.testplanDetail.labelAssignee}
                  >
                    {t.testPlanDetail.labelAssignee}
                  </p>
                  {assignee ? (
                    <UserAvatar
                      data-testid="testplan-detail-assignee-avatar"
                      fullName={assignee.fullName}
                      avatarColor={assignee.avatarColor}
                      role={assignee.role}
                      size="sm"
                    />
                  ) : (
                    <p
                      className="text-gray-300"
                      data-testid={TEST_IDS.testplanDetail.textUnassigned}
                    >
                      {t.testPlanDetail.unassignedLabel}
                    </p>
                  )}
                </div>
                <div>
                  <p
                    className="text-sm text-gray-400 mb-1"
                    data-testid={TEST_IDS.testplanDetail.labelCreated}
                  >
                    {t.testPlanDetail.labelCreated}
                  </p>
                  <p
                    className="text-gray-300"
                    data-testid={TEST_IDS.testplanDetail.textCreated}
                  >
                    {formatDate(testPlan.createdAt)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm text-gray-400 mb-1"
                    data-testid={TEST_IDS.testplanDetail.labelUpdated}
                  >
                    {t.testPlanDetail.labelUpdated}
                  </p>
                  <p
                    className="text-gray-300"
                    data-testid={TEST_IDS.testplanDetail.textUpdated}
                  >
                    {formatDate(testPlan.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass p-4 rounded-lg text-center">
                <p
                  className="text-2xl font-bold text-white"
                  data-testid={TEST_IDS.testplanDetail.statTotalCasesValue}
                >
                  {totalCases}
                </p>
                <p
                  className="text-sm text-gray-400"
                  data-testid={TEST_IDS.testplanDetail.statTotalCasesLabel}
                >
                  {t.testPlanDetail.statTestCases}
                </p>
              </div>
              <div className="glass p-4 rounded-lg text-center">
                <p
                  className="text-2xl font-bold text-white"
                  data-testid={TEST_IDS.testplanDetail.statTotalStepsValue}
                >
                  {totalSteps}
                </p>
                <p
                  className="text-sm text-gray-400"
                  data-testid={TEST_IDS.testplanDetail.statTotalStepsLabel}
                >
                  {t.testPlanDetail.statTotalSteps}
                </p>
              </div>
              <div className="glass p-4 rounded-lg text-center">
                <p
                  className="text-2xl font-bold text-white"
                  data-testid={TEST_IDS.testplanDetail.statPassRateValue}
                >
                  {lastRunPassRate}%
                </p>
                <p
                  className="text-sm text-gray-400"
                  data-testid={TEST_IDS.testplanDetail.statPassRateLabel}
                >
                  {lastRun
                    ? t.testPlanDetail.statLastRunPassRate
                    : t.testPlanDetail.statNoRunsYet}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Cases Tab */}
        {activeTab === "cases" && (
          <div
            data-testid={TEST_IDS.testplanDetail.cases}
            className="mt-6 space-y-3"
          >
            {testPlan.testCases.length === 0 ? (
              <p
                className="text-gray-400"
                data-testid={TEST_IDS.testplanDetail.textNoCases}
              >
                {t.testPlanDetail.noTestCasesYet}
              </p>
            ) : (
              testPlan.testCases.map((testCase, caseIdx) => {
                const isExpanded = expandedCases.has(testCase.id);
                return (
                  <div key={testCase.id} className="glass p-4 rounded-lg">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCaseExpansion(testCase.id)}
                      data-testid={testplanCaseToggle(caseIdx)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronUp size={18} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-400" />
                          )}
                          <h4
                            className="font-medium text-white"
                            data-testid={testplanDetailCaseName(caseIdx)}
                          >
                            {testCase.name}
                          </h4>
                        </div>
                        {testCase.description && (
                          <p
                            className="text-sm text-gray-400 ml-6 mt-1"
                            data-testid={testplanDetailCaseDescription(caseIdx)}
                          >
                            {testCase.description}
                          </p>
                        )}
                      </div>
                      <StatusBadge
                        data-testid={`testplan-case-priority-${caseIdx}`}
                        type="testcase_priority"
                        value={testCase.priority}
                      />
                    </div>

                    {isExpanded && (
                      <div
                        className="mt-4 ml-6 space-y-2"
                        data-testid={testplanCase(caseIdx)}
                      >
                        <p
                          className="text-xs text-gray-500 font-semibold mb-3"
                          data-testid={testplanDetailCaseStepsLabel(caseIdx)}
                        >
                          STEPS
                        </p>
                        {testCase.steps.map((step, stepIdx) => (
                          <div
                            key={stepIdx}
                            className="bg-white/5 p-3 rounded-lg text-sm"
                          >
                            <p
                              className="font-medium text-gray-300 mb-1"
                              data-testid={testplanDetailStepAction(
                                caseIdx,
                                stepIdx,
                              )}
                            >
                              Step {stepIdx + 1}: {step.action}
                            </p>
                            <p
                              className="text-gray-400 text-xs"
                              data-testid={testplanDetailStepExpected(
                                caseIdx,
                                stepIdx,
                              )}
                            >
                              Expected: {step.expectedResult}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Execution History Tab */}
        {activeTab === "history" && (
          <div data-testid={TEST_IDS.testplanDetail.history} className="mt-6">
            {planRuns.length === 0 ? (
              <p
                className="text-gray-400"
                data-testid={TEST_IDS.testplanDetail.textNoRuns}
              >
                No test runs yet.
              </p>
            ) : (
              <DataTable<TestRun>
                columns={[
                  {
                    key: "executorId",
                    label: t.testPlanDetail.colExecutedBy,
                    sortable: false,
                    render: (val) => {
                      const executor = users.find(
                        (u) => u.id === (val as number),
                      );
                      return executor ? (
                        <UserAvatar
                          data-testid={`testplan-history-executor-${executor.id}`}
                          fullName={executor.fullName}
                          avatarColor={executor.avatarColor}
                          role={executor.role}
                          size="sm"
                        />
                      ) : (
                        t.testPlanDetail.unknownProject
                      );
                    },
                  },
                  {
                    key: "status",
                    label: t.common.status,
                    sortable: true,
                    render: (val) => (
                      <StatusBadge
                        data-testid="testplan-history-run-status"
                        type="testrun_status"
                        value={val as "in_progress" | "completed"}
                      />
                    ),
                  },
                  {
                    key: "results",
                    label: t.testPlanDetail.colResults,
                    sortable: false,
                    render: (val) => {
                      const results = val as any[];
                      const passed = results.filter(
                        (r) => r.status === "passed",
                      ).length;
                      return t.dashboard.resultsPassed(passed, results.length);
                    },
                  },
                  {
                    key: "startedAt",
                    label: t.testPlanDetail.colDate,
                    sortable: true,
                    render: (val) => formatDateTime(val as string),
                  },
                ]}
                data={planRuns}
                onRowClick={(row) => setResultsModal({ run: row })}
                testIdPrefix="testplan-history"
              />
            )}
          </div>
        )}
      </div>

      {/* Results Modal */}
      {resultsModal.run && (
        <Modal
          isOpen={!!resultsModal.run}
          data-testid="testplan-results-modal"
          title={t.testPlanDetail.modalResultsTitle}
          onClose={() => setResultsModal({ run: null })}
        >
          <div className="space-y-4">
            <div>
              <p
                className="text-sm text-gray-400 mb-1"
                data-testid={TEST_IDS.testplanDetail.modalLabelStatus}
              >
                Status
              </p>
              <StatusBadge
                data-testid="testplan-results-run-status"
                type="testrun_status"
                value={resultsModal.run.status}
              />
            </div>
            <div>
              <p
                className="text-sm text-gray-400 mb-2"
                data-testid={TEST_IDS.testplanDetail.modalLabelResults}
              >
                Results
              </p>
              <div className="space-y-2">
                {resultsModal.run.results.map((result, idx) => (
                  <div key={idx} className="bg-white/5 p-3 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-gray-300"
                        data-testid={testplanDetailResultCase(idx)}
                      >
                        Test Case {result.testCaseId}
                      </span>
                      <StatusBadge
                        data-testid={`testplan-results-case-${idx}`}
                        type="testcase_result"
                        value={result.status}
                      />
                    </div>
                    {result.notes && (
                      <p
                        className="text-gray-400 text-xs mt-1"
                        data-testid={testplanDetailResultNote(idx)}
                      >
                        Note: {result.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p
                className="text-sm text-gray-400 mb-1"
                data-testid={TEST_IDS.testplanDetail.modalLabelStarted}
              >
                Started
              </p>
              <p
                className="text-gray-300"
                data-testid={TEST_IDS.testplanDetail.modalTextStarted}
              >
                {formatDateTime(resultsModal.run.startedAt)}
              </p>
            </div>
            {resultsModal.run.completedAt && (
              <div>
                <p
                  className="text-sm text-gray-400 mb-1"
                  data-testid={TEST_IDS.testplanDetail.modalLabelCompleted}
                >
                  Completed
                </p>
                <p
                  className="text-gray-300"
                  data-testid={TEST_IDS.testplanDetail.modalTextCompleted}
                >
                  {formatDateTime(resultsModal.run.completedAt)}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
