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
import { t } from "../../i18n";
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
    return projects.find((p) => p.id === projectId)?.name || t.testPlans.unknownAssignee;
  };

  // Get user full name by ID
  const getUserName = (userId: number | null): string => {
    if (!userId) return "";
    return users.find((u) => u.id === userId)?.fullName || t.testPlans.unknownAssignee;
  };

  // DataTable columns
  const columns: Column<TestPlan>[] = [
    {
      key: "name",
      label: t.testPlans.colName,
      sortable: true,
    },
    {
      key: "projectId",
      label: t.testPlans.colProject,
      sortable: true,
      render: (val) => getProjectName(val as number),
    },
    {
      key: "status",
      label: t.testPlans.colStatus,
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
      label: t.testPlans.colTestCases,
      sortable: false,
      render: (val) => {
        const cases = val as any[];
        return t.testPlans.casesCount(cases.length);
      },
    },
    {
      key: "assigneeId",
      label: t.testPlans.colAssignee,
      sortable: false,
      render: (val) => {
        const userId = val as number | null;
        if (!userId) return "—";
        const assignee = users.find((u) => u.id === userId);
        if (!assignee) return t.testPlans.unknownAssignee;
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
      label: t.testPlans.colUpdated,
      sortable: true,
      render: (val) => formatDate(val as string),
    },
  ];

  return (
    <div data-testid={TEST_IDS.testplanList.page}>
      <PageHeader
        title={t.testPlans.pageTitle}
        actions={
          hasPermission(user.role, "testplan:create") && (
            <Link
              to="/test-plans/new"
              className="btn btn-primary"
              data-testid={TEST_IDS.testplanList.btnNew}
            >
              {t.testPlans.btnNewTestPlan}
            </Link>
          )
        }
      />

      <div className="mt-6">
        <DataTable<TestPlan>
          columns={columns}
          data={testPlans}
          searchable
          searchPlaceholder={t.testPlans.searchPlaceholder}
          filters={[
            { key: "status", label: t.testPlans.filterStatus, options: ["draft", "active", "completed", "archived"] },
            { key: "projectId", label: t.testPlans.filterProject, options: projects.map((p) => p.name) },
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
