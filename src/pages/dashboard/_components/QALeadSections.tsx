import { useNavigate } from "react-router-dom";
import DataTable from "../../../components/data/DataTable";
import { t } from "../../../i18n";
import type { Column } from "../../../components/data/DataTable";
import type { Defect } from "../../../data/entities";

interface QALeadSectionsProps {
  unassignedColumns: Column<Defect>[];
  verificationColumns: Column<Defect>[];
  unassignedDefects: Defect[];
  awaitingVerification: Defect[];
}

export default function QALeadSections({
  unassignedColumns,
  verificationColumns,
  unassignedDefects,
  awaitingVerification,
}: QALeadSectionsProps) {
  const navigate = useNavigate();

  return (
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
  );
}
