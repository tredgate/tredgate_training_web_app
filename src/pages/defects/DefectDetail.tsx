import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit2 } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Modal from "../../components/feedback/Modal";
import EmptyState from "../../components/feedback/EmptyState";
import StatusBadge from "../../components/feedback/StatusBadge";
import UserAvatar from "../../components/display/UserAvatar";
import ActivityTimeline from "../../components/display/ActivityTimeline";
import TextArea from "../../components/forms/TextArea";
import Select from "../../components/forms/Select";
import {
  TEST_IDS,
  defectDetailBtn,
  defectCommentEntry,
  defectBadge,
} from "../../shared/testIds";
import { useAuth } from "../../hooks/useAuth";
import { useDefects } from "../../hooks/useDefects";
import { useProjects } from "../../hooks/useProjects";
import { useUsers } from "../../hooks/useUsers";
import { t } from "../../i18n";
import type { Defect } from "../../data/entities";
import type { ActivityEntry } from "../../components/display/ActivityTimeline";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

function getUserAvatarColor(userId: number): string {
  // Generate a consistent color based on user ID
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#FFA07A", // Light Salmon
    "#98D8C8", // Mint
    "#F7DC6F", // Yellow
    "#BB8FCE", // Purple
    "#85C1E2", // Light Blue
  ];
  return colors[userId % colors.length] ?? "#BB8FCE";
}

export default function DefectDetail() {
  const { defectId } = useParams<{ defectId: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { getById, transition, addComment } = useDefects();
  const { projects } = useProjects();
  const { users } = useUsers();

  const id = defectId ? parseInt(defectId, 10) : null;
  const defect = id ? getById(id) : null;

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  if (!defect) {
    return (
      <div data-testid={TEST_IDS.defectDetail.page}>
        <EmptyState
          variant="not-found"
          title={t.defectDetail.notFoundTitle}
          message={t.defectDetail.notFoundMessage}
        />
      </div>
    );
  }

  const project = projects.find((p) => p.id === defect.projectId);
  const userMap = new Map(users.map((u) => [u.id, u]));
  const reporter = userMap.get(defect.reporterId);
  const assignee = defect.assigneeId ? userMap.get(defect.assigneeId) : null;
  const projectMembers = project
    ? [project.leadId, ...project.memberIds]
        .map((uid) => userMap.get(uid))
        .filter((u) => u !== undefined)
    : [];

  // Get available transitions for this defect and user
  const { getTransitions } = useDefects();
  const availableTransitions = getTransitions(defect);

  // Build timeline entries from history
  const timelineEntries: ActivityEntry[] = useMemo(
    () =>
      defect.history.map((entry) => ({
        id: entry.id,
        type: "transition" as const,
        user: userMap.get(entry.userId)?.fullName || t.common.unknown,
        text: entry.details,
        timestamp: entry.timestamp,
      })),
    [defect.history, userMap],
  );

  // Build comment entries
  const commentEntries: ActivityEntry[] = useMemo(
    () =>
      defect.comments.map((comment) => ({
        id: comment.id,
        type: "comment" as const,
        user: userMap.get(comment.userId)?.fullName || t.common.unknown,
        text: comment.text,
        timestamp: comment.createdAt,
      })),
    [defect.comments, userMap],
  );

  // Combine and sort by timestamp descending
  const allActivities = [...timelineEntries, ...commentEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const handleTransition = (action: string) => {
    if (!user) return;

    // Check if this is an assign action - show modal
    if (action === "assign") {
      setShowAssignModal(true);
      return;
    }

    try {
      transition(defect, action, user.id);
      // Refresh by navigating back to same page
      setTimeout(() => {
        navigate(`/defects/${defect.id}`, { replace: true });
      }, 100);
    } catch (err) {
      // Error already shown via toast
    }
  };

  const handleAssign = (userId: number) => {
    if (!user) return;
    try {
      transition(defect, "assign", user.id);
      // Update the assignee
      setShowAssignModal(false);
      setTimeout(() => {
        navigate(`/defects/${defect.id}`, { replace: true });
      }, 100);
    } catch (err) {
      // Error already shown via toast
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !user) return;
    try {
      addComment(defect.id, user.id, commentText);
      setCommentText("");
      setTimeout(() => {
        navigate(`/defects/${defect.id}`, { replace: true });
      }, 100);
    } catch (err) {
      // Error already shown via toast
    }
  };

  const getTransitionButtonColor = (action: string): string => {
    if (["assign", "start"].includes(action)) return "btn-neon-blue";
    if (["resolve", "verify", "close"].includes(action))
      return "btn-neon-green";
    if (action === "reject") return "btn-neon-red";
    if (action === "reopen") return "btn-neon-purple";
    return "btn-neon";
  };

  return (
    <div data-testid={TEST_IDS.defectDetail.page}>
      <PageHeader
        title={`#${defect.id} — ${defect.title}`}
        backTo="/defects"
        actions={
          <div className="flex items-center gap-2">
            {availableTransitions.map((t) => (
              <button
                key={t.action}
                onClick={() => handleTransition(t.action)}
                data-testid={defectDetailBtn(t.action)}
                className={`btn ${getTransitionButtonColor(t.action)}`}
              >
                {t.label}
              </button>
            ))}
            {hasPermission("defect:create") && defect.status !== "closed" && (
              <Link
                to={`/defects/${defect.id}/edit`}
                data-testid={TEST_IDS.defectDetail.btnEdit}
                className="btn btn-neon-blue flex items-center gap-2"
              >
                <Edit2 size={18} />
                {t.defectDetail.btnEdit}
              </Link>
            )}
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-3 gap-6">
        {/* Left column: Description + Comments */}
        <div className="col-span-2 space-y-6">
          {/* Description Card */}
          <div
            className="glass p-6 rounded-lg"
            data-testid={TEST_IDS.defectDetail.description}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {t.defectDetail.sectionDescription}
            </h3>
            <p className="text-gray-300 mb-6">{defect.description}</p>
            <h4 className="text-sm font-semibold text-gray-200 mb-2">
              {t.defectDetail.sectionStepsToReproduce}
            </h4>
            <pre className="text-sm text-gray-400 bg-black/20 p-4 rounded border border-white/5 overflow-auto">
              {defect.stepsToReproduce}
            </pre>
          </div>

          {/* Comments Card */}
          <div
            className="glass p-6 rounded-lg"
            data-testid={TEST_IDS.defectDetail.comments}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>

            {defect.comments.length === 0 ? (
              <p className="text-gray-500 mb-6">
                {t.defectDetail.noCommentsYet}
              </p>
            ) : (
              <div className="space-y-4 mb-6">
                {defect.comments.map((comment) => {
                  const commentUser = userMap.get(comment.userId);
                  return (
                    <div
                      key={comment.id}
                      data-testid={defectCommentEntry(comment.id)}
                      className="bg-white/5 p-4 rounded border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {commentUser && (
                          <UserAvatar
                            data-testid={`defect-comment-avatar-${comment.id}`}
                            fullName={commentUser.fullName}
                            avatarColor={getUserAvatarColor(commentUser.id)}
                            role={commentUser.role}
                            size="sm"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-200">
                            {commentUser?.fullName || t.common.unknown}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 ml-9">
                        {comment.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Comment Form */}
            <div className="border-t border-white/10 pt-4">
              <TextArea
                label={t.defectDetail.labelAddComment}
                name="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t.defectDetail.commentPlaceholder}
                data-testid={TEST_IDS.defectDetail.inputComment}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                data-testid={TEST_IDS.defectDetail.btnAddComment}
                className="mt-3 btn btn-neon-purple disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.defectDetail.btnAddComment}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Sidebar cards */}
        <div className="space-y-6">
          {/* Status Card */}
          <div
            className="glass p-6 rounded-lg"
            data-testid={TEST_IDS.defectDetail.cardStatus}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {t.defectDetail.labelCurrentStatus}
                </p>
                <StatusBadge
                  data-testid={defectBadge("status", defect.id)}
                  type="status"
                  value={defect.status}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {t.defectDetail.labelSeverity}
                </p>
                <StatusBadge
                  data-testid={defectBadge("severity", defect.id)}
                  type="severity"
                  value={defect.severity}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {t.defectDetail.labelPriority}
                </p>
                <StatusBadge
                  data-testid={defectBadge("priority", defect.id)}
                  type="priority"
                  value={defect.priority}
                />
              </div>
            </div>
          </div>

          {/* Assignment Card */}
          <div
            className="glass p-6 rounded-lg"
            data-testid={TEST_IDS.defectDetail.cardAssignment}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {t.defectDetail.sectionAssignment}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  {t.defectDetail.labelReporter}
                </p>
                {reporter ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      data-testid="defect-reporter-avatar"
                      fullName={reporter.fullName}
                      avatarColor={getUserAvatarColor(reporter.id)}
                      role={reporter.role}
                      size="sm"
                    />
                    <span className="text-sm text-gray-300">
                      {reporter.fullName}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">
                    {t.common.unknown}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  {t.defectDetail.labelAssignee}
                </p>
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      data-testid="defect-assignee-avatar"
                      fullName={assignee.fullName}
                      avatarColor={getUserAvatarColor(assignee.id)}
                      role={assignee.role}
                      size="sm"
                    />
                    <span className="text-sm text-gray-300">
                      {assignee.fullName}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">
                    {t.common.unassigned}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div
            className="glass p-6 rounded-lg"
            data-testid={TEST_IDS.defectDetail.cardDetails}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {t.defectDetail.labelProject}
                </p>
                {project ? (
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-neon-purple hover:underline"
                  >
                    {project.name}
                  </Link>
                ) : (
                  <span className="text-gray-500">{t.common.unknown}</span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {t.defectDetail.labelEnvironment}
                </p>
                {defect.environmentId ? (
                  <span className="text-gray-300">
                    {project?.environments.find(
                      (e) => e.id === defect.environmentId,
                    )?.name || t.common.unknown}
                  </span>
                ) : (
                  <span className="text-gray-500">{t.common.notSpecified}</span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {t.defectDetail.labelCreated}
                </p>
                <span className="text-gray-300">
                  {formatDate(defect.createdAt)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {t.defectDetail.labelUpdated}
                </p>
                <span className="text-gray-300">
                  {formatDate(defect.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* History Timeline */}
          <div
            className="glass p-6 rounded-lg"
            data-testid={TEST_IDS.defectDetail.timeline}
          >
            <h3 className="text-lg font-semibold text-white mb-4">History</h3>
            <ActivityTimeline
              data-testid={TEST_IDS.defectDetail.timeline}
              entries={allActivities}
            />
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        data-testid={TEST_IDS.defectDetail.modalAssign}
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={t.defectDetail.modalAssignTitle}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label={t.defectDetail.labelAssignTo}
            name="assignee"
            value={defect.assigneeId?.toString() || ""}
            onChange={(e) => {
              if (e.target.value) {
                handleAssign(parseInt(e.target.value, 10));
              }
            }}
            options={projectMembers.map((u) => ({
              value: u.id.toString(),
              label: u.fullName,
            }))}
            placeholder={t.defectDetail.placeholderAssignee}
            data-testid={TEST_IDS.defectDetail.modalAssignSelect}
          />
          <button
            onClick={() => setShowAssignModal(false)}
            className="w-full btn btn-ghost"
          >
            {t.defectDetail.btnCancelAssign}
          </button>
        </div>
      </Modal>
    </div>
  );
}
