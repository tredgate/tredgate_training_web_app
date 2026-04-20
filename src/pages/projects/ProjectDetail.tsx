import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit2, Trash2, Bug, CheckSquare, Users } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Tabs from "../../components/navigation/Tabs";
import DataTable from "../../components/data/DataTable";
import Modal from "../../components/feedback/Modal";
import EmptyState from "../../components/feedback/EmptyState";
import StatusBadge from "../../components/feedback/StatusBadge";
import UserAvatar from "../../components/display/UserAvatar";
import StatCard from "../../components/display/StatCard";
import {
  TEST_IDS,
  projectDetailEnvRow,
  projectDetailEnvCellName,
  projectDetailEnvCellType,
  projectDetailEnvCellUrl,
  projectDetailMemberName,
  projectDetailMemberEmail,
} from "../../shared/testIds";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { useDefects } from "../../hooks/useDefects";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useUsers } from "../../hooks/useUsers";
import { t } from "../../i18n";
import type {
  Project,
  Defect,
  TestPlan,
  Environment,
  User,
} from "../../data/entities";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { projects, getById, remove } = useProjects();
  const { defects } = useDefects();
  const { testPlans } = useTestPlans();
  const { users } = useUsers();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const id = projectId ? parseInt(projectId, 10) : null;
  const project = id ? getById(id) : null;

  if (!project) {
    return (
      <div data-testid={TEST_IDS.projectDetail.page}>
        <EmptyState
          variant="not-found"
          title={t.projectDetail.notFoundTitle}
          message={t.projectDetail.notFoundMessage}
        />
      </div>
    );
  }

  const userMap = new Map(users.map((u) => [u.id, u]));
  const projectDefects = defects.filter((d) => d.projectId === project.id);
  const projectPlans = testPlans.filter((tp) => tp.projectId === project.id);
  const projectMembers = [...new Set([project.leadId, ...project.memberIds])]
    .map((uid) => userMap.get(uid))
    .filter((u) => u !== undefined) as typeof users;

  const handleDelete = () => {
    remove(project.id);
    navigate("/projects");
  };

  const tabs = [
    {
      key: "overview",
      label: t.projectDetail.tabOverview,
    },
    {
      key: "defects",
      label: t.projectDetail.tabDefects,
      badge: projectDefects.length,
    },
    {
      key: "plans",
      label: t.projectDetail.tabTestPlans,
      badge: projectPlans.length,
    },
    {
      key: "team",
      label: t.projectDetail.tabTeam,
      badge: projectMembers.length,
    },
  ];

  return (
    <div data-testid={TEST_IDS.projectDetail.page}>
      <PageHeader
        title={project.name}
        subtitle={project.code}
        backTo="/projects"
        actions={
          <div className="flex items-center gap-2">
            {hasPermission("project:edit") && (
              <Link
                to={`/projects/${project.id}/edit`}
                data-testid={TEST_IDS.projectDetail.btnEdit}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Edit2 size={18} />
                Edit
              </Link>
            )}
            {hasPermission("project:delete") && (
              <button
                onClick={() => setShowDeleteModal(true)}
                data-testid={TEST_IDS.projectDetail.btnDelete}
                className="btn btn-secondary text-red-400 hover:bg-red-500/20"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        }
      />

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        testIdPrefix="project-detail"
      />

      {activeTab === "overview" && (
        <div className="mt-6 space-y-6">
          {/* Project Info Card */}
          <div className="glass p-6 rounded-lg">
            <h3
              data-testid={TEST_IDS.projectDetail.headingProjectInfo}
              className="text-lg font-semibold text-white mb-4"
            >
              {t.projectDetail.sectionProjectInfo}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p
                  data-testid={TEST_IDS.projectDetail.labelStatus}
                  className="text-sm text-gray-400"
                >
                  {t.common.status}
                </p>
                <StatusBadge
                  data-testid="project-detail-badge-status"
                  type="project_status"
                  value={project.status}
                  className="mt-1"
                />
              </div>
              <div>
                <p
                  data-testid={TEST_IDS.projectDetail.labelQALead}
                  className="text-sm text-gray-400"
                >
                  {t.projectDetail.labelQALead}
                </p>
                <div className="mt-2">
                  {userMap.get(project.leadId) && (
                    <UserAvatar
                      data-testid="project-detail-lead-avatar"
                      fullName={userMap.get(project.leadId)!.fullName}
                      avatarColor={userMap.get(project.leadId)!.avatarColor}
                      role={userMap.get(project.leadId)!.role}
                    />
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <p
                  data-testid={TEST_IDS.projectDetail.labelDescription}
                  className="text-sm text-gray-400"
                >
                  {t.common.description}
                </p>
                <p
                  data-testid={TEST_IDS.projectDetail.textDescription}
                  className="text-white mt-1"
                >
                  {project.description}
                </p>
              </div>
              <div>
                <p
                  data-testid={TEST_IDS.projectDetail.labelCreatedAt}
                  className="text-sm text-gray-400"
                >
                  {t.common.createdAt}
                </p>
                <p
                  data-testid={TEST_IDS.projectDetail.textCreatedAt}
                  className="text-white mt-1"
                >
                  {formatDate(project.createdAt)}
                </p>
              </div>
              <div>
                <p
                  data-testid={TEST_IDS.projectDetail.labelUpdatedAt}
                  className="text-sm text-gray-400"
                >
                  {t.common.updatedAt}
                </p>
                <p
                  data-testid={TEST_IDS.projectDetail.textUpdatedAt}
                  className="text-white mt-1"
                >
                  {formatDate(project.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Environments Table */}
          {project.environments.length > 0 && (
            <div className="glass p-6 rounded-lg">
              <h3
                data-testid={TEST_IDS.projectDetail.headingEnvironments}
                className="text-lg font-semibold text-white mb-4"
              >
                {t.projectDetail.sectionEnvironments}
              </h3>
              <table
                data-testid={TEST_IDS.projectDetail.envTable}
                className="w-full"
              >
                <thead>
                  <tr className="border-b border-white/10">
                    <th
                      data-testid={TEST_IDS.projectDetail.envHeaderName}
                      className="text-left py-2 px-4 text-sm font-medium text-gray-400"
                    >
                      {t.common.name}
                    </th>
                    <th
                      data-testid={TEST_IDS.projectDetail.envHeaderUrl}
                      className="text-left py-2 px-4 text-sm font-medium text-gray-400"
                    >
                      URL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {project.environments.map((env: Environment) => (
                    <tr
                      key={env.id}
                      data-testid={projectDetailEnvRow(env.id)}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td
                        data-testid={projectDetailEnvCellName(env.id)}
                        className="py-3 px-4 text-white"
                      >
                        {env.name}
                      </td>
                      <td
                        data-testid={projectDetailEnvCellType(env.id)}
                        className="py-3 px-4 text-gray-400"
                      >
                        {env.type}
                      </td>
                      <td
                        data-testid={projectDetailEnvCellUrl(env.id)}
                        className="py-3 px-4 text-blue-400 truncate"
                      >
                        {env.url}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              data-testid="project-detail-stat-defects"
              icon={Bug}
              label={t.projectDetail.statDefects}
              value={projectDefects.length.toString()}
            />
            <StatCard
              data-testid="project-detail-stat-plans"
              icon={CheckSquare}
              label={t.projectDetail.statTestPlans}
              value={projectPlans.length.toString()}
            />
            <StatCard
              data-testid="project-detail-stat-members"
              icon={Users}
              label={t.projectDetail.statTeamMembers}
              value={projectMembers.length.toString()}
            />
          </div>
        </div>
      )}

      {activeTab === "defects" && (
        <div className="mt-6">
          <DefectsTabContent
            projectId={project.id}
            defects={projectDefects}
            users={users}
          />
        </div>
      )}

      {activeTab === "plans" && (
        <div className="mt-6">
          <TestPlansTabContent
            projectId={project.id}
            testPlans={projectPlans}
          />
        </div>
      )}

      {activeTab === "team" && (
        <div className="mt-6">
          <TeamTabContent members={projectMembers} />
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t.projectDetail.modalDeleteTitle}
        size="sm"
        data-testid="modal-confirm-delete-project"
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              {t.common.cancel}
            </button>
            <button
              className="btn btn-neon-red"
              onClick={handleDelete}
              data-testid="modal-btn-confirm-delete"
            >
              {t.common.delete}
            </button>
          </>
        }
      >
        <p
          data-testid={TEST_IDS.projectDetail.textDeleteConfirm}
          className="text-gray-300"
        >
          {t.projectDetail.modalDeleteConfirm(project.name)}
        </p>
      </Modal>
    </div>
  );
}

interface DefectsTabContentProps {
  projectId: number;
  defects: Defect[];
  users: User[];
}

function DefectsTabContent({ defects, users }: DefectsTabContentProps) {
  const userMap = new Map(users.map((u) => [u.id, u]));

  const columns = [
    {
      key: "title",
      label: t.projectDetail.colTitle,
      sortable: true,
    },
    {
      key: "severity",
      label: t.common.severity,
      sortable: true,
      render: (value: unknown) => (
        <StatusBadge
          data-testid="defect-severity-badge"
          type="severity"
          value={value as any}
        />
      ),
    },
    {
      key: "status",
      label: t.common.status,
      sortable: true,
      render: (value: unknown) => (
        <StatusBadge
          data-testid="defect-status-badge"
          type="status"
          value={value as any}
        />
      ),
    },
    {
      key: "assigneeId",
      label: t.common.assignee,
      sortable: false,
      render: (value: unknown) => {
        const assignee = userMap.get(value as number);
        return assignee ? (
          <UserAvatar
            data-testid="defect-assignee-avatar"
            fullName={assignee.fullName}
            avatarColor={assignee.avatarColor}
            size="sm"
          />
        ) : (
          <span className="text-gray-500">{t.common.unassigned}</span>
        );
      },
    },
  ];

  return (
    <DataTable<Defect>
      columns={columns}
      data={defects}
      pagination
      pageSize={10}
      emptyMessage={t.projectDetail.emptyDefects}
      testIdPrefix="project-detail-defects"
      data-testid={TEST_IDS.projectDetail.defectsTable}
    />
  );
}

interface TestPlansTabContentProps {
  projectId: number;
  testPlans: TestPlan[];
}

function TestPlansTabContent({ testPlans }: TestPlansTabContentProps) {
  const columns = [
    {
      key: "name",
      label: t.projectDetail.planColName,
      sortable: true,
    },
    {
      key: "status",
      label: t.common.status,
      sortable: true,
      render: (value: unknown) => {
        const status = value as string;
        const statusColors: Record<string, string> = {
          draft: "bg-blue-500/20 text-blue-400",
          active: "bg-emerald-500/20 text-emerald-400",
          completed: "bg-purple-500/20 text-purple-400",
          archived: "bg-gray-500/20 text-gray-400",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${statusColors[status] || "bg-gray-500/20 text-gray-400"}`}
          >
            {status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "testCases",
      label: t.projectDetail.planColTestCases,
      sortable: false,
      render: (value: unknown) => {
        const testCases = value as any[];
        return t.projectDetail.casesCount(testCases.length);
      },
    },
    {
      key: "updatedAt",
      label: t.projectDetail.planColLastUpdated,
      sortable: true,
      render: (value: unknown) => formatDate(value as string),
    },
  ];

  return (
    <DataTable<TestPlan>
      columns={columns}
      data={testPlans}
      pagination
      pageSize={10}
      emptyMessage={t.projectDetail.emptyTestPlans}
      testIdPrefix="project-detail-plans"
      data-testid={TEST_IDS.projectDetail.plansTable}
    />
  );
}

interface TeamTabContentProps {
  members: User[];
}

function TeamTabContent({ members }: TeamTabContentProps) {
  return (
    <div data-testid={TEST_IDS.projectDetail.teamList} className="space-y-3">
      {members.length === 0 ? (
        <p
          data-testid={TEST_IDS.projectDetail.textEmptyTeam}
          className="text-gray-400"
        >
          {t.projectDetail.emptyTeam}
        </p>
      ) : (
        members.map((member) => (
          <div
            key={member.id}
            className="glass p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <UserAvatar
                data-testid={`team-member-avatar-${member.id}`}
                fullName={member.fullName}
                avatarColor={member.avatarColor}
                role={member.role}
              />
              <div>
                <p
                  data-testid={projectDetailMemberName(member.id)}
                  className="text-white font-medium"
                >
                  {member.fullName}
                </p>
                <p
                  data-testid={projectDetailMemberEmail(member.id)}
                  className="text-sm text-gray-400"
                >
                  {member.email}
                </p>
              </div>
            </div>
            <StatusBadge
              data-testid="role-badge"
              type="status"
              value={member.role as any}
            />
          </div>
        ))
      )}
    </div>
  );
}
