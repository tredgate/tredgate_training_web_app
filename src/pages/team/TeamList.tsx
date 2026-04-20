import { useNavigate } from "react-router-dom";
import { TEST_IDS } from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/data/DataTable";
import UserAvatar from "../../components/display/UserAvatar";
import StatusBadge from "../../components/feedback/StatusBadge";
import { useUsers } from "../../hooks/useUsers";
import { ROLES } from "../../data/entities";

export default function TeamList() {
  const { users } = useUsers();
  const navigate = useNavigate();

  const columns = [
    {
      key: "avatar",
      label: "",
      sortable: false as const,
      render: (_: unknown, row: any) => (
        <UserAvatar
          data-testid={`team-list-avatar-${row.id}`}
          fullName={row.fullName}
          avatarColor={row.avatarColor}
          size="sm"
        />
      ),
    },
    { key: "fullName", label: "Name", sortable: true as const },
    { key: "email", label: "Email", sortable: true as const },
    {
      key: "role",
      label: "Role",
      sortable: true as const,
      render: (value: unknown) => (
        <StatusBadge
          data-testid={`team-list-badge-role`}
          type="severity"
          value={String(value) as any}
        />
      ),
    },
    {
      key: "projectIds",
      label: "Projects",
      sortable: false as const,
      render: (value: any) => `${value.length} projects`,
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true as const,
      render: (value: any) =>
        value ? (
          <span className="text-green-400" data-testid={TEST_IDS.teamList.textStatusActive}>Active</span>
        ) : (
          <span className="text-red-400" data-testid={TEST_IDS.teamList.textStatusInactive}>Inactive</span>
        ),
    },
  ];

  return (
    <div data-testid={TEST_IDS.teamList.page}>
      <PageHeader title="Team" />
      <DataTable
        columns={columns}
        data={users}
        searchable
        searchPlaceholder="Search team members..."
        filters={[
          {
            key: "role",
            label: "Role",
            options: ROLES,
          },
          {
            key: "isActive",
            label: "Status",
            options: ["true", "false"] as const,
          },
        ]}
        pagination
        pageSize={10}
        onRowClick={(row) => navigate(`/team/${row.id}`)}
        emptyMessage="No team members found"
        testIdPrefix="team-list"
      />
    </div>
  );
}
