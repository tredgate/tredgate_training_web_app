import { useNavigate, Link } from "react-router-dom";
import { TEST_IDS, dataTableCell, dataTableRow } from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/data/DataTable";
import StatusBadge from "../../components/feedback/StatusBadge";
import UserAvatar from "../../components/display/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useProjects } from "../../hooks/useProjects";
import { useUsers } from "../../hooks/useUsers";
import { hasPermission } from "../../utils/permissions";
import type { Column } from "../../components/data/DataTable";
import type { TestPlan, TestPlanStatus } from "../../data/entities";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TestPlanList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { testPlans } = useTestPlans();
  const { projects } = useProjects();
  const { users } = useUsers();

  if (!user) return null;

  // Get project name by ID
  const getProjectName = (projectId: number): string => {
    return projects.find((p) => p.id === projectId)?.name || "Unknown";
  };

  // Get user full name by ID
  const getUserName = (userId: number | null): string => {
    if (!userId) return "";
    return users.find((u) => u.id === userId)?.fullName || "Unknown";
  };

  // DataTable columns
  const columns: Column<TestPlan>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "projectId",
      label: "Project",
      sortable: true,
      render: (val) => getProjectName(val as number),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val) => (
        <StatusBadge
          data-testid="testplan-list-status"
          type="testplan_status"
          value={val as TestPlanStatus}
        />
      ),
    },
    {
      key: "testCases",
      label: "Test Cases",
      sortable: false,
      render: (val) => {
        const cases = val as any[];
        return `${cases.length} cases`;
      },
    },
    {
      key: "assigneeId",
      label: "Assignee",
      sortable: false,
      render: (val) => {
        const userId = val as number | null;
        if (!userId) return "—";
        const assignee = users.find((u) => u.id === userId);
        if (!assignee) return "Unknown";
        return (
          <UserAvatar
            data-testid={`testplan-list-assignee-${userId}`}
            fullName={assignee.fullName}
            avatarColor={assignee.avatarColor}
            role={assignee.role}
            size="sm"
          />
        );
      },
    },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (val) => formatDate(val as string),
    },
  ];

  return (
    <div data-testid={TEST_IDS.testplanList.page}>
      <PageHeader
        title="Test Plans"
        actions={
          hasPermission(user.role, "testplan:create") && (
            <Link
              to="/test-plans/new"
              className="btn btn-primary"
              data-testid={TEST_IDS.testplanList.btnNew}
            >
              New Test Plan
            </Link>
          )
        }
      />

      <div className="mt-6">
        <DataTable<TestPlan>
          columns={columns}
          data={testPlans}
          searchable
          searchPlaceholder="Search test plans..."
          filters={[
            {
              key: "status",
              label: "Status",
              options: ["draft", "active", "completed", "archived"],
            },
            {
              key: "projectId",
              label: "Project",
              options: projects.map((p) => p.name),
            },
          ]}
          pagination
          pageSize={10}
          onRowClick={(row) => navigate(`/test-plans/${row.id}`)}
          testIdPrefix="testplan-list"
        />
      </div>
    </div>
  );
}
