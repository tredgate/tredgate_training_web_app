import { useState } from "react";
import { useParams } from "react-router-dom";
import { TEST_IDS } from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/feedback/EmptyState";
import UserAvatar from "../../components/display/UserAvatar";
import StatusBadge from "../../components/feedback/StatusBadge";
import Select from "../../components/forms/Select";
import MultiSelect from "../../components/forms/MultiSelect";
import { useUsers } from "../../hooks/useUsers";
import { useDefects } from "../../hooks/useDefects";
import { useTestRuns } from "../../hooks/useTestRuns";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useProjects } from "../../hooks/useProjects";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { t } from "../../i18n";
import { ROLES } from "../../data/entities";
import { Users, Bug, TestTube } from "lucide-react";

interface ProjectRole {
  projectId: number;
  role: "lead" | "member";
}

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { users, getById, update } = useUsers();
  const { defects } = useDefects();
  const { testRuns } = useTestRuns();
  const { testPlans } = useTestPlans();
  const { projects } = useProjects();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editRole, setEditRole] = useState<string>("");
  const [editProjects, setEditProjects] = useState<string[]>([]);

  const user = userId ? getById(Number(userId)) : null;

  if (!user) {
    return (
      <div data-testid={TEST_IDS.userDetail.page}>
        <EmptyState
          variant="not-found"
          title={t.team.notFoundTitle}
          message={t.team.notFoundMessage}
        />
      </div>
    );
  }

  // Derive project roles for display
  const userProjectRoles: ProjectRole[] = user.projectIds.map((projectId) => {
    const proj = projects.find((p) => p.id === projectId);
    return {
      projectId,
      role: proj?.leadId === user.id ? "lead" : "member",
    };
  });

  // Activity: recent defects reported by this user
  const recentDefects = defects
    .filter((d) => d.reporterId === user.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  // Activity: recent test runs executed by this user
  const recentRuns = testRuns
    .filter((tr) => tr.executorId === user.id)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )
    .slice(0, 5);

  // Stats
  const defectsReported = defects.filter(
    (d) => d.reporterId === user.id,
  ).length;
  const defectsAssigned = defects.filter(
    (d) => d.assigneeId === user.id,
  ).length;
  const runsExecuted = testRuns.filter(
    (tr) => tr.executorId === user.id,
  ).length;

  // Edit mode handlers
  const canEditRole =
    currentUser?.role === "admin" && currentUser.id !== user.id;

  const handleEditClick = () => {
    setEditRole(user.role);
    setEditProjects(user.projectIds.map((id) => String(id)));
    setIsEditing(true);
  };

  const handleSave = () => {
    try {
      update(user.id, {
        role: editRole as any,
        projectIds: editProjects.map((id) => Number(id)),
      });
      addToast("success", "User updated successfully");
      setIsEditing(false);
    } catch {
      addToast("error", "Failed to update user");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div data-testid={TEST_IDS.userDetail.page}>
      <PageHeader
        title={user.fullName}
        backTo="/team"
        actions={
          canEditRole
            ? !isEditing && (
                <button
                  data-testid={TEST_IDS.userDetail.btnEdit}
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {t.team.btnEditRole}
                </button>
              )
            : null
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="col-span-2 space-y-6">
          {/* Profile Card */}
          <div
            data-testid={TEST_IDS.userDetail.profile}
            className="glass p-8 rounded-lg"
          >
            <div className="flex items-center gap-6 mb-6">
              <UserAvatar
                data-testid={`user-avatar-${user.id}`}
                fullName={user.fullName}
                avatarColor={user.avatarColor}
                role={user.role}
                size="lg"
              />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.fullName}
                </h2>
                <p className="text-gray-400 mb-3">{user.email}</p>
                {!isEditing ? (
                  <StatusBadge
                    data-testid={`user-badge-role`}
                    type="severity"
                    value={user.role as any}
                  />
                ) : (
                  <Select
                    data-testid={TEST_IDS.userDetail.selectRole}
                    label=""
                    name="role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    options={ROLES.map((r) => ({
                      value: r,
                      label: r.replace("_", " ").toUpperCase(),
                    }))}
                  />
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <MultiSelect
                  data-testid={TEST_IDS.userDetail.selectProjects}
                  label={t.team.labelProjects}
                  name="projects"
                  value={editProjects}
                  onChange={setEditProjects}
                  options={projects.map((p) => ({
                    value: String(p.id),
                    label: p.name,
                  }))}
                />

                <div className="flex gap-3 pt-4">
                  <button
                    data-testid={TEST_IDS.userDetail.btnSave}
                    onClick={handleSave}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t.team.btnSave}
                  </button>
                  <button
                    data-testid={TEST_IDS.userDetail.btnCancel}
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t.team.btnCancel}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Activity Section */}
          <div data-testid={TEST_IDS.userDetail.activity} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                {t.team.sectionRecentDefects}
              </h3>
              {recentDefects.length > 0 ? (
                <div className="glass rounded-lg overflow-hidden">
                  {recentDefects.map((defect) => (
                    <a
                      key={defect.id}
                      href={`/defects/${defect.id}`}
                      className="block p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {defect.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDate(defect.createdAt)}
                          </p>
                        </div>
                        <StatusBadge
                          data-testid={`defect-badge-status-${defect.id}`}
                          type="status"
                          value={defect.status}
                        />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  {t.team.noDefectsReported}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                {t.team.sectionRecentRuns}
              </h3>
              {recentRuns.length > 0 ? (
                <div className="glass rounded-lg overflow-hidden">
                  {recentRuns.map((run) => {
                    const plan = testPlans.find((p) => p.id === run.testPlanId);
                    const planName =
                      plan?.name || `Test Plan ${run.testPlanId}`;
                    return (
                      <div
                        key={run.id}
                        className="p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              {planName}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatDate(run.startedAt)}
                            </p>
                          </div>
                          <StatusBadge
                            data-testid={`run-badge-status-${run.id}`}
                            type="status"
                            value={
                              run.status === "completed"
                                ? "verified"
                                : "in_progress"
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">{t.team.noTestRuns}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column (1/3) */}
        <div className="col-span-1 space-y-6">
          {/* Projects Card */}
          <div
            data-testid={TEST_IDS.userDetail.projects}
            className="glass p-6 rounded-lg"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.team.sectionProjects}
            </h3>
            {userProjectRoles.length > 0 ? (
              <ul className="space-y-3">
                {userProjectRoles.map(({ projectId, role: projRole }) => {
                  const proj = projects.find((p) => p.id === projectId);
                  return (
                    <li key={projectId}>
                      <a
                        href={`/projects/${projectId}`}
                        className="text-neon-purple hover:text-neon-purple/80 block mb-1"
                      >
                        {proj?.name}
                      </a>
                      <span className="text-xs text-gray-400">
                        {projRole === "lead"
                          ? t.team.roleLead
                          : t.team.roleMember}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">
                {t.team.noProjectsAssigned}
              </p>
            )}
          </div>

          {/* Stats Card */}
          <div
            data-testid={TEST_IDS.userDetail.stats}
            className="glass p-6 rounded-lg space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-red-400" />
                <p className="text-sm text-gray-400">Defects Reported</p>
              </div>
              <p className="text-2xl font-bold text-white">{defectsReported}</p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-amber-400" />
                <p className="text-sm text-gray-400">Defects Assigned</p>
              </div>
              <p className="text-2xl font-bold text-white">{defectsAssigned}</p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <TestTube className="w-4 h-4 text-blue-400" />
                <p className="text-sm text-gray-400">Test Runs Executed</p>
              </div>
              <p className="text-2xl font-bold text-white">{runsExecuted}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
