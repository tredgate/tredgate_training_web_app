import { TEST_IDS } from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardData } from "../../hooks/useDashboardData";
import { t } from "../../i18n";
import { buildDefectColumns, buildTestRunColumns } from "./_columns";
import type { ColumnHelpers } from "./_columns";
import DashboardStats from "./_components/DashboardStats";
import MyWork from "./_components/MyWork";
import QALeadSections from "./_components/QALeadSections";
import AdminOverview from "./_components/AdminOverview";
import RecentActivity from "./_components/RecentActivity";

export default function Dashboard() {
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

  const helpers: ColumnHelpers = { getProjectName, getUserName, getTestPlanName };
  const defectColumns = buildDefectColumns("my", helpers);
  const testRunColumns = buildTestRunColumns(helpers);
  const unassignedColumns = buildDefectColumns("unassigned", helpers);
  const verificationColumns = buildDefectColumns("verification", helpers);

  return (
    <div data-testid={TEST_IDS.dashboard.page} className="flex flex-col gap-6">
      <PageHeader title={t.dashboard.title} />
      <DashboardStats
        totalDefectsCount={totalDefectsCount}
        openDefectsCount={openDefectsCount}
        testPlansCount={testPlansCount}
        passRate={passRate}
      />
      <MyWork
        defectColumns={defectColumns}
        testRunColumns={testRunColumns}
        myDefectsForTable={myDefectsForTable}
        myTestRuns={myTestRuns}
        testPlans={testPlans}
      />
      {(user.role === "qa_lead" || user.role === "admin") && (
        <QALeadSections
          unassignedColumns={unassignedColumns}
          verificationColumns={verificationColumns}
          unassignedDefects={unassignedDefects}
          awaitingVerification={awaitingVerification}
        />
      )}
      {user.role === "admin" && (
        <AdminOverview users={users} projects={projects} />
      )}
      <RecentActivity entries={recentActivityEntries} />
    </div>
  );
}
