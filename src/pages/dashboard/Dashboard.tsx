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
import { useDefects } from "../../hooks/useDefects";
import { useProjects } from "../../hooks/useProjects";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useTestRuns } from "../../hooks/useTestRuns";
import { useUsers } from "../../hooks/useUsers";
import { t } from "../../i18n";
import type { Column } from "../../components/data/DataTable";
import type { Defect, TestRun } from "../../data/entities";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { defects } = useDefects();
  const { projects } = useProjects();
  const { testPlans } = useTestPlans();
  const { testRuns } = useTestRuns();
  const { users } = useUsers();

  if (!user) return null;

  // ────────────────────────────────────────────────────────────────────────
  // DATA FILTERING BY ROLE
  // ────────────────────────────────────────────────────────────────────────

  // My projects (for QA Lead and Admin context)
  const myProjects = projects.filter(
    (p) => p.leadId === user.id || p.memberIds.includes(user.id),
  );

  // My project IDs
  const myProjectIds = myProjects.map((p) => p.id);

  // Role-specific defect filtering
  let totalDefectsCount: number;
  let openDefectsCount: number;
  let myDefectsForTable: Defect[];
  let unassignedDefects: Defect[] = [];
  let awaitingVerification: Defect[] = [];

  if (user.role === "tester") {
    // Tester: My reported defects
    totalDefectsCount = defects.filter((d) => d.reporterId === user.id).length;
    openDefectsCount = defects.filter(
      (d) =>
        d.reporterId === user.id &&
        d.status !== "closed" &&
        d.status !== "verified",
    ).length;
    myDefectsForTable = defects
      .filter((d) => d.assigneeId === user.id)
      .slice(0, 5);
  } else if (user.role === "qa_lead") {
    // QA Lead: In my projects
    totalDefectsCount = defects.filter((d) =>
      myProjectIds.includes(d.projectId),
    ).length;
    openDefectsCount = defects.filter(
      (d) =>
        myProjectIds.includes(d.projectId) &&
        d.status !== "closed" &&
        d.status !== "verified",
    ).length;
    myDefectsForTable = defects
      .filter((d) => d.assigneeId === user.id)
      .slice(0, 5);
    unassignedDefects = defects.filter(
      (d) => myProjectIds.includes(d.projectId) && d.status === "new",
    );
    awaitingVerification = defects.filter(
      (d) => myProjectIds.includes(d.projectId) && d.status === "resolved",
    );
  } else {
    // Admin: All defects
    totalDefectsCount = defects.length;
    openDefectsCount = defects.filter(
      (d) => d.status !== "closed" && d.status !== "verified",
    ).length;
    myDefectsForTable = defects
      .filter((d) => d.assigneeId === user.id)
      .slice(0, 5);
    unassignedDefects = defects.filter((d) => d.status === "new");
    awaitingVerification = defects.filter((d) => d.status === "resolved");
  }

  // Test Plans filtering
  let testPlansCount: number;
  if (user.role === "tester") {
    testPlansCount = testPlans.filter((tp) => tp.assigneeId === user.id).length;
  } else if (user.role === "qa_lead") {
    testPlansCount = testPlans.filter((tp) =>
      myProjectIds.includes(tp.projectId),
    ).length;
  } else {
    testPlansCount = testPlans.length;
  }

  // Pass Rate calculation
  let passRateRuns: TestRun[];
  if (user.role === "tester") {
    passRateRuns = testRuns.filter((r) => r.executorId === user.id);
  } else if (user.role === "qa_lead") {
    passRateRuns = testRuns.filter((r) => {
      const plan = testPlans.find((tp) => tp.id === r.testPlanId);
      return plan && myProjectIds.includes(plan.projectId);
    });
  } else {
    passRateRuns = testRuns;
  }

  const totalCases = passRateRuns.flatMap((r) => r.results).length;
  const passedCases = passRateRuns
    .flatMap((r) => r.results)
    .filter((r) => r.status === "passed").length;
  const passRate =
    totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;

  // My Recent Test Runs
  const myTestRuns = testRuns
    .filter((r) => r.executorId === user.id)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )
    .slice(0, 5);

  // Activity Timeline (last 10 history entries, merged from all defects)
  const allHistoryEntries = defects.flatMap((d) =>
    d.history.map((h) => ({
      ...h,
      defectId: d.id,
      defectTitle: d.title,
    })),
  );

  // Filter history by role
  let timelineHistoryEntries = allHistoryEntries;
  if (user.role === "tester") {
    timelineHistoryEntries = allHistoryEntries.filter((h) => {
      const defect = defects.find((d) => d.id === h.defectId);
      return defect && defect.reporterId === user.id;
    });
  } else if (user.role === "qa_lead") {
    timelineHistoryEntries = allHistoryEntries.filter((h) => {
      const defect = defects.find((d) => d.id === h.defectId);
      return defect && myProjectIds.includes(defect.projectId);
    });
  }

  const recentActivityEntries = timelineHistoryEntries
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 10)
    .map((h) => ({
      id: h.id,
      type: (h.action === "created"
        ? "created"
        : h.action === "commented"
          ? "comment"
          : "transition") as "created" | "comment" | "transition",
      user: users.find((u) => u.id === h.userId)?.fullName || "Unknown",
      text: `${h.details}`,
      timestamp: h.timestamp,
    }));

  // Helper: Get project name by ID
  const getProjectName = (projectId: number): string => {
    return projects.find((p) => p.id === projectId)?.name || t.dashboard.unknownProject;
  };

  // Helper: Get user name by ID
  const getUserName = (userId: number): string => {
    return users.find((u) => u.id === userId)?.fullName || t.dashboard.unknownUser;
  };

  // Helper: Get test plan name by ID
  const getTestPlanName = (planId: number): string => {
    return testPlans.find((tp) => tp.id === planId)?.name || t.dashboard.unknownPlan;
  };

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
