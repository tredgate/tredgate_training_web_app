import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/data/DataTable";
import StatusBadge from "../../components/feedback/StatusBadge";
import UserAvatar from "../../components/display/UserAvatar";
import { TEST_IDS, defectBadge } from "../../shared/testIds";
import { useDefects } from "../../hooks/useDefects";
import { useProjects } from "../../hooks/useProjects";
import { useUsers } from "../../hooks/useUsers";
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

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (val: number) => `#${val}`,
    },
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (val: string) => val,
    },
    {
      key: "projectId",
      label: "Project",
      sortable: true,
      render: (val: number) => {
        const project = projectMap.get(val);
        return project ? project.name : "Unknown";
      },
    },
    {
      key: "severity",
      label: "Severity",
      sortable: true,
      render: (val: string, row: Defect) => (
        <StatusBadge
          type="severity"
          value={val as any}
          data-testid={defectBadge("severity", row.id)}
        />
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (val: string, row: Defect) => (
        <StatusBadge
          type="priority"
          value={val as any}
          data-testid={defectBadge("priority", row.id)}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val: string, row: Defect) => (
        <StatusBadge
          type="status"
          value={val as any}
          data-testid={defectBadge("status", row.id)}
        />
      ),
    },
    {
      key: "assigneeId",
      label: "Assignee",
      sortable: false,
      render: (val: number | null) =>
        val ? (
          <UserAvatar userId={val} user={userMap.get(val)} />
        ) : (
          <span className="text-gray-500">Unassigned</span>
        ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (val: string) => formatDate(val),
    },
  ];

  return (
    <div data-testid={TEST_IDS.defectList.page}>
      <PageHeader
        title="Defects"
        actions={
          <button
            onClick={() => navigate("/defects/new")}
            data-testid={TEST_IDS.defectList.btnNew}
            className="btn btn-neon-purple flex items-center gap-2"
          >
            <Plus size={18} />
            Report Defect
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
          searchPlaceholder="Search defects..."
          filters={[
            {
              key: "severity",
              label: "Severity",
              options: DEFECT_SEVERITIES.map((s) => ({
                value: s,
                label: s,
              })),
            },
            {
              key: "status",
              label: "Status",
              options: DEFECT_STATUSES.map((s) => ({
                value: s,
                label: s,
              })),
            },
            {
              key: "priority",
              label: "Priority",
              options: DEFECT_PRIORITIES.map((p) => ({
                value: p,
                label: p,
              })),
            },
            {
              key: "projectId",
              label: "Project",
              options: projectOptions,
            },
          ]}
          pagination
          pageSize={10}
          onRowClick={(row: Defect) => navigate(`/defects/${row.id}`)}
          emptyMessage="No defects found"
          testIdPrefix="defect-list"
        />
      </div>
    </div>
  );
}
