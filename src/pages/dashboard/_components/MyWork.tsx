import { useNavigate } from "react-router-dom";
import DataTable from "../../../components/data/DataTable";
import { TEST_IDS } from "../../../shared/testIds";
import { t } from "../../../i18n";
import type { Column } from "../../../components/data/DataTable";
import type { Defect, TestRun, TestPlan } from "../../../data/entities";

interface MyWorkProps {
  defectColumns: Column<Defect>[];
  testRunColumns: Column<TestRun>[];
  myDefectsForTable: Defect[];
  myTestRuns: TestRun[];
  testPlans: TestPlan[];
}

export default function MyWork({
  defectColumns,
  testRunColumns,
  myDefectsForTable,
  myTestRuns,
  testPlans,
}: MyWorkProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-3" data-testid={TEST_IDS.dashboard.headingMyDefects}>
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
        <h2 className="text-lg font-semibold text-white mb-3" data-testid={TEST_IDS.dashboard.headingMyRuns}>
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
  );
}
