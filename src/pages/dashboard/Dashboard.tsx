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
import ActivityTimeline from "../../components/display/ActivityTimeline";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardData } from "../../hooks/useDashboardData";
import { t } from "../../i18n";
import { buildDefectColumns, buildTestRunColumns } from "./_columns";
import type { ColumnHelpers } from "./_columns";
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

  const helpers: ColumnHelpers = { getProjectName, getUserName, getTestPlanName };
  const defectColumns = buildDefectColumns("my", helpers);
  const testRunColumns = buildTestRunColumns(helpers);
  const unassignedColumns = buildDefectColumns("unassigned", helpers);
  const verificationColumns = buildDefectColumns("verification", helpers);

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
