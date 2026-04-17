import { useState } from "react";
import { TEST_IDS } from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import TextInput from "../../components/forms/TextInput";
import UserAvatar from "../../components/display/UserAvatar";
import StatusBadge from "../../components/feedback/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useUsers } from "../../hooks/useUsers";
import { t } from "../../i18n";
import { useDefects } from "../../hooks/useDefects";
import { useTestRuns } from "../../hooks/useTestRuns";
import { useProjects } from "../../hooks/useProjects";

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { users, getById, update } = useUsers();
  const { defects } = useDefects();
  const { testRuns } = useTestRuns();
  const { projects } = useProjects();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  // ────────────────────────────────────────────────────────────────────────
  // PROFILE UPDATE HANDLER
  // ────────────────────────────────────────────────────────────────────────

  const handleSaveChanges = async () => {
    if (!fullName.trim() || !email.trim()) {
      addToast("error", t.profile.toastErrorRequired);
      return;
    }

    setIsSaving(true);
    try {
      update(user.id, {
        fullName: fullName.trim(),
        email: email.trim(),
      });
      addToast("success", t.profile.toastSuccess);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t.profile.toastErrorFailed;
      addToast("error", message);
    } finally {
      setIsSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // ACTIVITY DATA
  // ────────────────────────────────────────────────────────────────────────

  // My defects (reported)
  const myReportedDefects = defects.filter((d) => d.reporterId === user.id);

  // Assigned to me
  const assignedToMe = defects.filter((d) => d.assigneeId === user.id);

  // My test runs
  const myTestRuns = testRuns.filter((tr) => tr.executorId === user.id);

  // My projects
  const myProjects = projects.filter(
    (p) => p.leadId === user.id || p.memberIds.includes(user.id),
  );

  return (
    <div data-testid={TEST_IDS.profile.page}>
      <PageHeader title={t.profile.pageTitle} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-2">
          <div className="glass rounded-lg p-8">
            <div className="flex flex-col items-center mb-8">
              <UserAvatar
                data-testid="profile-avatar"
                fullName={user.fullName}
                avatarColor={
                  users.find((u) => u.id === user.id)?.avatarColor ?? "#BB8FCE"
                }
                role={user.role}
                size="lg"
              />
              <h1 className="text-2xl font-bold text-white mt-4">
                {user.fullName}
              </h1>
            </div>

            <div className="space-y-6">
              {/* Editable Fields */}
              <div className="space-y-4">
                <TextInput
                  data-testid={TEST_IDS.profile.inputName}
                  label={t.profile.labelFullName}
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.profile.placeholderFullName}
                />

                <TextInput
                  data-testid={TEST_IDS.profile.inputEmail}
                  label={t.profile.labelEmail}
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.profile.placeholderEmail}
                />
              </div>

              {/* Read-only Fields */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.profile.labelRole}
                  </label>
                  <StatusBadge
                    data-testid="profile-role-badge"
                    type="role"
                    value={user.role}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.profile.labelUsername}
                  </label>
                  <div className="px-4 py-2 bg-white/5 rounded-lg text-white">
                    {user.username}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  data-testid={TEST_IDS.profile.btnSave}
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {isSaving ? t.profile.btnSaving : t.profile.btnSave}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Activity Summary */}
        <div className="lg:col-span-1">
          <div
            data-testid={TEST_IDS.profile.activity}
            className="glass rounded-lg p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{t.profile.sectionMyActivity}</h2>

            <div className="space-y-4">
              {/* My Defects */}
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-gray-300 text-sm mb-1">{t.profile.statMyDefects}</p>
                <p className="text-white text-3xl font-bold">
                  {myReportedDefects.length}
                </p>
                <p className="text-gray-400 text-xs mt-1">{t.profile.statReported}</p>
              </div>

              {/* Assigned to Me */}
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-gray-300 text-sm mb-1">{t.profile.statAssignedToMe}</p>
                <p className="text-white text-3xl font-bold">
                  {assignedToMe.length}
                </p>
                <p className="text-gray-400 text-xs mt-1">{t.profile.statDefects}</p>
              </div>

              {/* My Test Runs */}
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-gray-300 text-sm mb-1">{t.profile.statMyTestRuns}</p>
                <p className="text-white text-3xl font-bold">
                  {myTestRuns.length}
                </p>
                <p className="text-gray-400 text-xs mt-1">{t.profile.statExecuted}</p>
              </div>

              {/* My Projects */}
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-gray-300 text-sm mb-1">{t.profile.statMyProjects}</p>
                {myProjects.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {myProjects.map((p) => (
                      <li key={p.id} className="text-white text-sm truncate">
                        • {p.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm mt-2">{t.profile.noProjects}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
