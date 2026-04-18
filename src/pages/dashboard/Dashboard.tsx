import { useNavigate } from "react-router-dom";
import {
  Bug,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  Users,
  Folder,
  Activity,
} from "lucide-react";
import {
  TEST_IDS,
  dataTableRow,
  dataTableCell,
  timelineEntry,
} from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import StatCard from "../../components/display/StatCard";
import DataTable from "../../components/data/DataTable";
import StatusBadge from "../../components/feedback/StatusBadge";
import ActivityTimeline from "../../components/display/ActivityTimeline";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardData } from "../../hooks/useDashboardData";
import { t } from "../../i18n";
import type { Column } from "../../components/data/DataTable";
import type { Defect, TestRun } from "../../data/entities";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useDashboardData();

  if (!user || !data) return null;

  const {
    totalDefectsCount,
    openDefectsCount,
    testPlansCount,
    passRate,
    myDefectsForTable,
    myTestRuns,
    unassignedDefects,
    awaitingVerification,
    recentActivityEntries,
    getProjectName,
    getUserName,
    getTestPlanName,
    users,
    projects,
    testPlans,
  } = data;

  // ────────────────────────────────────────────────────────────────────────
  // TABLE COLUMNS
  // ────────────────────────────────────────────────────────────────────────

  const defectColumns: Column<Defect>[] = [
    { key: "title", label: "Title", sortable: true },
    {
      key: "projectId",
      label: "Project",
      render: (value) => getProjectName(value as number),
    },
    {
      key: "severity",
      label: t.dashboard.colSeverity,
      render: (value) => (
        <StatusBadge
          data-testid={TEST_IDS.dashboard.myDefectsTable}
          type="severity"
          value={value as any}
        />
      ),
    },
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

  const testRunColumns: Column<TestRun>[] = [
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

  const unassignedColumns: Column<Defect>[] = [
    { key: "title", label: t.dashboard.colTitle, sortable: true },
    {
      key: "projectId",
      label: t.dashboard.colProject,
      render: (value) => getProjectName(value as number),
    },
    {
      key: "severity",
      label: t.dashboard.colSeverity,
      render: (value) => (
        <StatusBadge
          data-testid={TEST_IDS.dashboard.unassignedTable}
          type="severity"
          value={value as any}
        />
      ),
    },
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

  const verificationColumns: Column<Defect>[] = [
    { key: "title", label: t.dashboard.colTitle, sortable: true },
    {
      key: "projectId",
      label: t.dashboard.colProject,
      render: (value) => getProjectName(value as number),
    },
    {
      key: "severity",
      label: t.dashboard.colSeverity,
      render: (value) => (
        <StatusBadge
          data-testid={TEST_IDS.dashboard.verificationTable}
          type="severity"
          value={value as any}
        />
      ),
    },
    {
      key: "assigneeId",
      label: t.dashboard.colAssignedTo,
      render: (value) => {
        const assigneeId = value as number | null;
        return assigneeId ? getUserName(assigneeId) : t.common.unassigned;
      },
    },
  ];

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div data-testid={TEST_IDS.dashboard.page} className="flex flex-col gap-6">
      <PageHeader title={t.dashboard.title} />

      {/* Top Row: 4 Main StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          data-testid={TEST_IDS.dashboard.cardTotalDefects}
          icon={Bug}
          label={t.dashboard.statTotalDefects}
          value={totalDefectsCount}
        />
        <StatCard
          data-testid={TEST_IDS.dashboard.cardOpenDefects}
          icon={AlertTriangle}
          label={t.dashboard.statOpenDefects}
          value={openDefectsCount}
        />
        <StatCard
          data-testid={TEST_IDS.dashboard.cardTestPlans}
          icon={ClipboardList}
          label={t.dashboard.statTestPlans}
          value={testPlansCount}
        />
        <StatCard
          data-testid={TEST_IDS.dashboard.cardPassRate}
          icon={CheckCircle}
          label={t.dashboard.statPassRate}
          value={`${passRate}%`}
        />
      </div>

      {/* Tester Sections */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            {t.dashboard.sectionMyAssignedDefects}
          </h2>
          <DataTable<Defect>
            columns={defectColumns}
            data={myDefectsForTable}
            testIdPrefix="dashboard-my-defects"
            pagination={false}
            onRowClick={(row) => navigate(`/defects/${row.id}`)}
            emptyMessage={t.dashboard.emptyAssignedDefects}
            className="glass"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            {t.dashboard.sectionMyRecentRuns}
          </h2>
          <DataTable<TestRun>
            columns={testRunColumns}
            data={myTestRuns}
            testIdPrefix="dashboard-my-runs"
            pagination={false}
            onRowClick={(row) => {
              const plan = testPlans.find((tp) => tp.id === row.testPlanId);
              if (plan) navigate(`/test-plans/${plan.id}`);
            }}
            emptyMessage={t.dashboard.emptyTestRuns}
            className="glass"
          />
        </div>
      </div>

      {/* QA Lead Sections */}
      {(user.role === "qa_lead" || user.role === "admin") && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">
              {t.dashboard.sectionUnassignedDefects}
            </h2>
            <DataTable<Defect>
              columns={unassignedColumns}
              data={unassignedDefects}
              testIdPrefix="dashboard-unassigned"
              pagination={false}
              onRowClick={(row) => navigate(`/defects/${row.id}`)}
              emptyMessage={t.dashboard.emptyUnassigned}
              className="glass"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">
              {t.dashboard.sectionAwaitingVerification}
            </h2>
            <DataTable<Defect>
              columns={verificationColumns}
              data={awaitingVerification}
              testIdPrefix="dashboard-verification"
              pagination={false}
              onRowClick={(row) => navigate(`/defects/${row.id}`)}
              emptyMessage={t.dashboard.emptyVerification}
              className="glass"
            />
          </div>
        </div>
      )}

      {/* Admin Sections */}
      {user.role === "admin" && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              data-testid={TEST_IDS.dashboard.cardTotalUsers}
              icon={Users}
              label={t.dashboard.statTotalUsers}
              value={users.length}
            />
            <StatCard
              data-testid={TEST_IDS.dashboard.cardTotalProjects}
              icon={Folder}
              label={t.dashboard.statTotalProjects}
              value={projects.length}
            />
            <StatCard
              data-testid={TEST_IDS.dashboard.cardActiveProjects}
              icon={Activity}
              label={t.dashboard.statActiveProjects}
              value={projects.filter((p) => p.status === "active").length}
            />
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          {t.dashboard.sectionRecentActivity}
        </h2>
        <div className="glass p-6">
          <ActivityTimeline
            data-testid={TEST_IDS.dashboard.activityTimeline}
            entries={recentActivityEntries}
          />
        </div>
      </div>
    </div>
  );
}
