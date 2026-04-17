import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/data/DataTable";
import type { Column } from "../../components/data/DataTable";
import StatusBadge from "../../components/feedback/StatusBadge";
import UserAvatar from "../../components/display/UserAvatar";
import { TEST_IDS, defectBadge } from "../../shared/testIds";
import { useDefects } from "../../hooks/useDefects";
import { useProjects } from "../../hooks/useProjects";
import { useUsers } from "../../hooks/useUsers";
import { t } from "../../i18n";
import type { Defect } from "../../data/entities";
import {
  DEFECT_SEVERITIES,
  DEFECT_STATUSES,
  DEFECT_PRIORITIES,
} from "../../data/entities";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

export default function DefectList() {
  const navigate = useNavigate();
  const { defects } = useDefects();
  const { projects } = useProjects();
  const { users } = useUsers();

  const userMap = new Map(users.map((u) => [u.id, u]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const projectOptions = projects.map((p) => ({
    value: String(p.id),
    label: p.name,
  }));

  const columns: Column<Defect>[] = [
    {
      key: "id",
      label: t.defects.colId,
      sortable: true,
      render: (val) => `#${val as number}`,
    },
    {
      key: "title",
      label: t.defects.colTitle,
      sortable: true,
      render: (val) => val as string,
    },
    {
      key: "projectId",
      label: t.defects.colProject,
      sortable: true,
      render: (val) => {
        const project = projectMap.get(val as number);
        return project ? project.name : t.defects.unknownProject;
      },
    },
    {
      key: "severity",
      label: t.defects.colSeverity,
      sortable: true,
      render: (val, row: Defect) => (
        <StatusBadge
          type="severity"
          value={val as any}
          data-testid={defectBadge("severity", row.id)}
        />
      ),
    },
    {
      key: "priority",
      label: t.defects.colPriority,
      sortable: true,
      render: (val, row: Defect) => (
        <StatusBadge
          type="priority"
          value={val as any}
          data-testid={defectBadge("priority", row.id)}
        />
      ),
    },
    {
      key: "status",
      label: t.defects.colStatus,
      sortable: true,
      render: (val, row: Defect) => (
        <StatusBadge
          type="status"
          value={val as any}
          data-testid={defectBadge("status", row.id)}
        />
      ),
    },
    {
      key: "assigneeId",
      label: t.defects.colAssignee,
      sortable: false,
      render: (val) => {
        if (!val) return <span className="text-gray-500">{t.common.unassigned}</span>;
        const assignee = userMap.get(val as number);
        if (!assignee) return <span className="text-gray-500">{t.defects.unknownAssignee}</span>;
        return (
          <UserAvatar
            data-testid={`defect-list-assignee-avatar-${val}`}
            fullName={assignee.fullName}
            avatarColor={`#${(assignee.id * 9999).toString(16).padStart(6, "0")}`}
            role={assignee.role}
            size="sm"
          />
        );
      },
    },
    {
      key: "updatedAt",
      label: t.defects.colUpdated,
      sortable: true,
      render: (val) => formatDate(val as string),
    },
  ];

  return (
    <div data-testid={TEST_IDS.defectList.page}>
      <PageHeader
        title={t.defects.pageTitle}
        actions={
          <button
            onClick={() => navigate("/defects/new")}
            data-testid={TEST_IDS.defectList.btnNew}
            className="btn btn-neon-purple flex items-center gap-2"
          >
            <Plus size={18} />
            {t.defects.btnReportDefect}
          </button>
        }
      />

      <div className="mt-6">
        <DataTable
          data-testid={TEST_IDS.defectList.table}
          columns={columns}
          data={defects}
          keyField="id"
          searchable
          searchPlaceholder={t.defects.searchPlaceholder}
          filters={[
            { key: "severity", label: t.defects.filterSeverity, options: DEFECT_SEVERITIES as any },
            { key: "status", label: t.defects.filterStatus, options: DEFECT_STATUSES as any },
            { key: "priority", label: t.defects.filterPriority, options: DEFECT_PRIORITIES as any },
            { key: "projectId", label: t.defects.filterProject, options: projectOptions },
          ]}
          pagination
          pageSize={10}
          onRowClick={(row: Defect) => navigate(`/defects/${row.id}`)}
          emptyMessage={t.defects.emptyMessage}
          testIdPrefix="defect-list"
        />
      </div>
    </div>
  );
}
