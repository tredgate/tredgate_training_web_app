import StatusBadge from "../../components/feedback/StatusBadge";
import { TEST_IDS } from "../../shared/testIds";
import { t } from "../../i18n";
import type { Column } from "../../components/data/DataTable";
import type { Defect, TestRun } from "../../data/entities";

export interface ColumnHelpers {
  getProjectName: (projectId: number) => string;
  getUserName: (userId: number) => string;
  getTestPlanName: (planId: number) => string;
}

export function buildDefectColumns(
  variant: "my" | "unassigned" | "verification",
  helpers: ColumnHelpers,
): Column<Defect>[] {
  const { getProjectName, getUserName } = helpers;

  const titleLabel = variant === "my" ? "Title" : t.dashboard.colTitle;
  const projectLabel = variant === "my" ? "Project" : t.dashboard.colProject;

  const severityTestId =
    variant === "my"
      ? TEST_IDS.dashboard.myDefectsTable
      : variant === "unassigned"
        ? TEST_IDS.dashboard.unassignedTable
        : TEST_IDS.dashboard.verificationTable;

  const shared: Column<Defect>[] = [
    { key: "title", label: titleLabel, sortable: true },
    {
      key: "projectId",
      label: projectLabel,
      render: (value) => getProjectName(value as number),
    },
    {
      key: "severity",
      label: t.dashboard.colSeverity,
      render: (value) => (
        <StatusBadge
          data-testid={severityTestId}
          type="severity"
          value={value as any}
        />
      ),
    },
  ];

  switch (variant) {
    case "my":
      return [
        ...shared,
        {
          key: "status",
          label: t.dashboard.colStatus,
          render: (value) => (
            <StatusBadge
              data-testid={TEST_IDS.dashboard.myDefectsTable}
              type="status"
              value={value as any}
            />
          ),
        },
        {
          key: "priority",
          label: t.dashboard.colPriority,
          render: (value) => (
            <StatusBadge
              data-testid={TEST_IDS.dashboard.myDefectsTable}
              type="priority"
              value={value as any}
            />
          ),
        },
      ];

    case "unassigned":
      return [
        ...shared,
        {
          key: "reporterId",
          label: t.dashboard.colReporter,
          render: (value) => getUserName(value as number),
        },
        {
          key: "createdAt",
          label: t.dashboard.colCreated,
          render: (value) => new Date(value as string).toLocaleDateString(),
        },
      ];

    case "verification":
      return [
        ...shared,
        {
          key: "assigneeId",
          label: t.dashboard.colAssignedTo,
          render: (value) => {
            const assigneeId = value as number | null;
            return assigneeId ? getUserName(assigneeId) : t.common.unassigned;
          },
        },
      ];
  }
}

export function buildTestRunColumns(helpers: ColumnHelpers): Column<TestRun>[] {
  const { getTestPlanName } = helpers;

  return [
    {
      key: "testPlanId",
      label: t.dashboard.colTestPlan,
      render: (value) => getTestPlanName(value as number),
    },
    {
      key: "status",
      label: t.dashboard.colStatus,
      render: (value) => {
        const status = value === "completed" ? "completed" : "in_progress";
        return (
          <StatusBadge
            data-testid={TEST_IDS.dashboard.myRunsTable}
            type="status"
            value={status as any}
          />
        );
      },
    },
    {
      key: "results",
      label: t.dashboard.colResults,
      render: (value) => {
        const results = value as any[];
        const passed = results.filter((r) => r.status === "passed").length;
        return t.dashboard.resultsPassed(passed, results.length);
      },
    },
    {
      key: "startedAt",
      label: t.dashboard.colDate,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ];
}
