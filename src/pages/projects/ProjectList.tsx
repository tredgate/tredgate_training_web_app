import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/data/DataTable";
import StatusBadge from "../../components/feedback/StatusBadge";
import UserAvatar from "../../components/display/UserAvatar";
import { TEST_IDS } from "../../shared/testIds";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { useUsers } from "../../hooks/useUsers";
import {
  PROJECT_STATUSES,
  type Project,
  type ProjectStatus,
} from "../../data/entities";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

export default function ProjectList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { projects } = useProjects();
  const { users } = useUsers();

  const userMap = new Map(users.map((u) => [u.id, u]));

  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: unknown) => (
        <StatusBadge
          data-testid={TEST_IDS.projectDetail.page}
          type="project_status"
          value={value as ProjectStatus}
        />
      ),
    },
    {
      key: "leadId",
      label: "Lead",
      sortable: false,
      render: (value: unknown) => {
        const lead = userMap.get(value as number);
        return lead ? (
          <UserAvatar
            data-testid="project-list-avatar-lead"
            fullName={lead.fullName}
            avatarColor={lead.avatarColor}
            role={lead.role}
            size="sm"
          />
        ) : null;
      },
    },
    {
      key: "memberIds",
      label: "Members",
      sortable: false,
      render: (value: unknown) => {
        const memberIds = value as number[];
        return `${memberIds.length} members`;
      },
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      sortable: true,
      render: (value: unknown) => formatDate(value as string),
    },
  ];

  return (
    <div data-testid={TEST_IDS.projectList.page}>
      <PageHeader
        title="Projects"
        actions={
          hasPermission("project:create") && (
            <Link
              to="/projects/new"
              data-testid={TEST_IDS.projectList.btnNew}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              New Project
            </Link>
          )
        }
      />

      <DataTable<Project>
        columns={columns}
        data={projects}
        searchable
        searchPlaceholder="Search projects..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: PROJECT_STATUSES,
          },
        ]}
        pagination
        pageSize={10}
        onRowClick={(project) => navigate(`/projects/${project.id}`)}
        emptyMessage="No projects found"
        testIdPrefix="project-list"
      />
    </div>
  );
}
