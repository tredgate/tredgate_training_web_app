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
import { t } from "../../i18n";
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
      label: t.projects.colCode,
      sortable: true,
    },
    {
      key: "name",
      label: t.projects.colName,
      sortable: true,
    },
    {
      key: "status",
      label: t.projects.colStatus,
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
      label: t.projects.colLead,
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
      label: t.projects.colMembers,
      sortable: false,
      render: (value: unknown) => {
        const memberIds = value as number[];
        return t.projects.membersCount(memberIds.length);
      },
    },
    {
      key: "updatedAt",
      label: t.projects.colLastUpdated,
      sortable: true,
      render: (value: unknown) => formatDate(value as string),
    },
  ];

  return (
    <div data-testid={TEST_IDS.projectList.page}>
      <PageHeader
        title={t.projects.pageTitle}
        actions={
          hasPermission("project:create") && (
            <Link
              to="/projects/new"
              data-testid={TEST_IDS.projectList.btnNew}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              {t.projects.btnNewProject}
            </Link>
          )
        }
      />

      <DataTable<Project>
        columns={columns}
        data={projects}
        searchable
        searchPlaceholder={t.projects.searchPlaceholder}
        filters={[
          { key: "status", label: t.projects.filterStatus, options: PROJECT_STATUSES },
        ]}
        pagination
        pageSize={10}
        onRowClick={(project) => navigate(`/projects/${project.id}`)}
        emptyMessage={t.projects.emptyMessage}
        testIdPrefix="project-list"
      />
    </div>
  );
}
