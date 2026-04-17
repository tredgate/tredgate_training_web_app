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
import type { TestPlan } from "../../data/entities";

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
      render: (val) => <StatusBadge type="testplan_status" value={val as string} />,
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
        return (
          <UserAvatar
            userId={userId}
            users={users}
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

  // Project filter options
  const projectOptions = projects.map((p) => ({
    value: p.id.toString(),
    label: p.name,
  }));

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
              options: [
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
                { value: "archived", label: "Archived" },
              ],
            },
            {
              key: "projectId",
              label: "Project",
              options: projectOptions,
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
