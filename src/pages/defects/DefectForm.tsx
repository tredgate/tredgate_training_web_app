import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Wizard from "../../components/navigation/Wizard";
import EmptyState from "../../components/feedback/EmptyState";
import StatusBadge from "../../components/feedback/StatusBadge";
import TextInput from "../../components/forms/TextInput";
import TextArea from "../../components/forms/TextArea";
import Select from "../../components/forms/Select";
import MultiSelect from "../../components/forms/MultiSelect";
import UserAvatar from "../../components/display/UserAvatar";
import { TEST_IDS } from "../../shared/testIds";
import { useForm } from "../../hooks/useForm";
import { useAuth } from "../../hooks/useAuth";
import { useDefects } from "../../hooks/useDefects";
import { useProjects } from "../../hooks/useProjects";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useUsers } from "../../hooks/useUsers";
import { t } from "../../i18n";
import type { Defect, Severity, Priority } from "../../data/entities";
import { DEFECT_SEVERITIES, DEFECT_PRIORITIES } from "../../data/entities";

interface DefectFormData extends Record<string, unknown> {
  title: string;
  projectId: number;
  severity: string;
  priority: string;
  description: string;
  stepsToReproduce: string;
  environmentId: number | null;
  assigneeId: number | null;
  relatedTestCaseIds: number[];
}

export default function DefectForm() {
  const { defectId } = useParams<{ defectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getById, create, update } = useDefects();
  const { projects } = useProjects();
  const { testPlans } = useTestPlans();
  const { users } = useUsers();

  const id = defectId ? parseInt(defectId, 10) : null;
  const existingDefect = id ? getById(id) : null;

  // Determine if we're in edit mode
  const isEdit = !!existingDefect;

  // Check if defect exists when editing
  if (id && !existingDefect) {
    return (
      <div data-testid={TEST_IDS.defectForm.page}>
        <EmptyState
          variant="not-found"
          title={t.defectForm.notFoundTitle}
          message={t.defectForm.notFoundMessage}
        />
      </div>
    );
  }

  // Initialize form data
  const initialValues: DefectFormData = existingDefect
    ? {
        title: existingDefect.title,
        projectId: existingDefect.projectId,
        severity: existingDefect.severity,
        priority: existingDefect.priority,
        description: existingDefect.description,
        stepsToReproduce: existingDefect.stepsToReproduce,
        environmentId: existingDefect.environmentId,
        assigneeId: existingDefect.assigneeId,
        relatedTestCaseIds: existingDefect.relatedTestCaseIds,
      }
    : {
        title: "",
        projectId: 0,
        severity: DEFECT_SEVERITIES[0],
        priority: DEFECT_PRIORITIES[0],
        description: "",
        stepsToReproduce: "",
        environmentId: null,
        assigneeId: null,
        relatedTestCaseIds: [],
      };

  const form = useForm<DefectFormData>(initialValues, (values) => {
    const errors: Partial<Record<keyof DefectFormData, string>> = {};
    if (!values.title.trim()) errors.title = t.defectForm.validateTitleRequired;
    if (!values.projectId)
      errors.projectId = t.defectForm.validateProjectRequired;
    if (!values.severity)
      errors.severity = t.defectForm.validateSeverityRequired;
    if (!values.priority)
      errors.priority = t.defectForm.validatePriorityRequired;
    if (!values.description.trim())
      errors.description = t.defectForm.validateDescriptionRequired;
    if (!values.stepsToReproduce.trim())
      errors.stepsToReproduce = t.defectForm.validateStepsRequired;
    return errors;
  });

  // Get the selected project
  const selectedProject = form.values.projectId
    ? projects.find((p) => p.id === form.values.projectId)
    : null;

  // Get project members for assignee select
  const projectMembers = selectedProject
    ? [selectedProject.leadId, ...selectedProject.memberIds]
        .map((uid) => users.find((u) => u.id === uid))
        .filter((u) => u !== undefined)
    : [];

  // Get test cases from selected project's test plans
  const projectTestCases = useMemo(() => {
    if (!selectedProject) return [];
    const plans = testPlans.filter((tp) => tp.projectId === selectedProject.id);
    const allCases = plans.flatMap((plan) => plan.testCases);
    return allCases;
  }, [selectedProject, testPlans]);

  const handleSubmit = () => {
    if (!user) return;

    try {
      if (isEdit && existingDefect) {
        update(existingDefect.id, {
          title: form.values.title,
          description: form.values.description,
          stepsToReproduce: form.values.stepsToReproduce,
          severity: form.values.severity as any,
          priority: form.values.priority as any,
          environmentId: form.values.environmentId,
          assigneeId: form.values.assigneeId,
          relatedTestCaseIds: form.values.relatedTestCaseIds,
        });
        navigate(`/defects/${existingDefect.id}`);
      } else {
        const newDefect = create({
          projectId: form.values.projectId,
          title: form.values.title,
          description: form.values.description,
          stepsToReproduce: form.values.stepsToReproduce,
          severity: form.values.severity as Severity,
          priority: form.values.priority as Priority,
          status: "new",
          reporterId: user.id,
          assigneeId: form.values.assigneeId,
          environmentId: form.values.environmentId,
          relatedTestCaseIds: form.values.relatedTestCaseIds,
        });
        navigate(`/defects/${newDefect.id}`);
      }
    } catch (err) {
      // Error already shown via toast
    }
  };

  const wizardSteps = [
    {
      label: t.defectForm.stepBasicInfo,
      content: (
        <div className="space-y-6 p-6">
          <TextInput
            label={t.defectForm.labelTitle}
            name="title"
            value={form.values.title}
            onChange={(e) => form.setField("title", e.target.value)}
            error={form.touched.title ? form.errors.title || null : null}
            placeholder={t.defectForm.placeholderTitle}
            required
            data-testid={TEST_IDS.defectForm.inputTitle}
          />

          <Select
            label={t.defectForm.labelProject}
            name="projectId"
            value={
              form.values.projectId ? form.values.projectId.toString() : ""
            }
            onChange={(e) => {
              const projectId = parseInt(e.target.value, 10);
              form.setField("projectId", projectId);
              // Reset environment when project changes
              form.setField("environmentId", null);
            }}
            error={
              form.touched.projectId ? form.errors.projectId || null : null
            }
            placeholder="Select a project"
            options={projects.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            required
            data-testid={TEST_IDS.defectForm.selectProject}
          />

          <Select
            label={t.defectForm.labelSeverity}
            name="severity"
            value={form.values.severity}
            onChange={(e) => form.setField("severity", e.target.value)}
            error={form.touched.severity ? form.errors.severity || null : null}
            options={DEFECT_SEVERITIES.map((s) => ({
              value: s,
              label: s,
            }))}
            required
            data-testid={TEST_IDS.defectForm.selectSeverity}
          />

          <Select
            label={t.defectForm.labelPriority}
            name="priority"
            value={form.values.priority}
            onChange={(e) => form.setField("priority", e.target.value)}
            error={form.touched.priority ? form.errors.priority || null : null}
            options={DEFECT_PRIORITIES.map((p) => ({
              value: p,
              label: p,
            }))}
            required
            data-testid={TEST_IDS.defectForm.selectPriority}
          />
        </div>
      ),
      validate: () =>
        form.validateFields(["title", "projectId", "severity", "priority"]),
    },
    {
      label: t.defectForm.stepDetails,
      content: (
        <div className="space-y-6 p-6">
          <TextArea
            label={t.defectForm.labelDescription}
            name="description"
            value={form.values.description}
            onChange={(e) => form.setField("description", e.target.value)}
            error={
              form.touched.description ? form.errors.description || null : null
            }
            placeholder={t.defectForm.placeholderDescription}
            required
            data-testid={TEST_IDS.defectForm.inputDescription}
          />

          <TextArea
            label={t.defectForm.labelSteps}
            name="stepsToReproduce"
            value={form.values.stepsToReproduce}
            onChange={(e) => form.setField("stepsToReproduce", e.target.value)}
            error={
              form.touched.stepsToReproduce
                ? form.errors.stepsToReproduce || null
                : null
            }
            placeholder={t.defectForm.placeholderSteps}
            required
            data-testid={TEST_IDS.defectForm.inputSteps}
          />

          {selectedProject && (
            <Select
              label={t.defectForm.labelEnvironment}
              name="environmentId"
              value={form.values.environmentId?.toString() || ""}
              onChange={(e) => {
                const envId = e.target.value
                  ? parseInt(e.target.value, 10)
                  : null;
                form.setField("environmentId", envId);
              }}
              options={selectedProject.environments.map((e) => ({
                value: e.id.toString(),
                label: `${e.name} (${e.type})`,
              }))}
              placeholder={t.defectForm.placeholderEnvironment}
              data-testid={TEST_IDS.defectForm.selectEnvironment}
            />
          )}
          {!selectedProject && (
            <p
              className="text-sm text-gray-500"
              data-testid={TEST_IDS.defectForm.textSelectProjectForEnv}
            >
              Select a project on the previous step to see environment options
            </p>
          )}
        </div>
      ),
      validate: () => form.validateFields(["description", "stepsToReproduce"]),
    },
    {
      label: t.defectForm.stepAssignment,
      content: (
        <div className="space-y-6 p-6">
          {selectedProject ? (
            <Select
              label={t.defectForm.labelAssignTo}
              name="assigneeId"
              value={form.values.assigneeId?.toString() || ""}
              onChange={(e) => {
                const userId = e.target.value
                  ? parseInt(e.target.value, 10)
                  : null;
                form.setField("assigneeId", userId);
              }}
              options={projectMembers.map((u) => ({
                value: u.id.toString(),
                label: u.fullName,
              }))}
              placeholder={t.defectForm.placeholderAssignee}
              data-testid={TEST_IDS.defectForm.selectAssignee}
            />
          ) : (
            <p
              className="text-sm text-gray-500"
              data-testid={TEST_IDS.defectForm.textSelectProjectForAssign}
            >
              Select a project to assign team members
            </p>
          )}

          {selectedProject && projectTestCases.length > 0 ? (
            <MultiSelect
              label={t.defectForm.labelRelatedTestCases}
              name="relatedTestCaseIds"
              value={form.values.relatedTestCaseIds.map((id) => id.toString())}
              onChange={(selected) => {
                form.setField(
                  "relatedTestCaseIds",
                  selected.map((id) => parseInt(id, 10)),
                );
              }}
              options={projectTestCases.map((tc) => ({
                value: tc.id.toString(),
                label: tc.name,
              }))}
              data-testid={TEST_IDS.defectForm.selectTestCases}
            />
          ) : selectedProject ? (
            <p
              className="text-sm text-gray-500"
              data-testid={TEST_IDS.defectForm.textNoTestCases}
            >
              No test cases found in this project's test plans
            </p>
          ) : null}
        </div>
      ),
    },
    {
      label: t.defectForm.stepReview,
      content: (
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <div>
              <p
                className="text-xs text-gray-400 mb-1"
                data-testid={TEST_IDS.defectForm.labelReviewTitle}
              >
                {t.defectForm.reviewLabelTitle}
              </p>
              <p
                className="text-white font-medium"
                data-testid={TEST_IDS.defectForm.textReviewTitle}
              >
                {form.values.title}
              </p>
            </div>

            <div>
              <p
                className="text-xs text-gray-400 mb-1"
                data-testid={TEST_IDS.defectForm.labelReviewProject}
              >
                {t.defectForm.reviewLabelProject}
              </p>
              <p
                className="text-white font-medium"
                data-testid={TEST_IDS.defectForm.textReviewProject}
              >
                {selectedProject?.name || t.defectForm.reviewNotSelected}
              </p>
            </div>

            <div className="flex gap-4">
              <div>
                <p
                  className="text-xs text-gray-400 mb-2"
                  data-testid={TEST_IDS.defectForm.labelReviewSeverity}
                >
                  {t.defectForm.reviewLabelSeverity}
                </p>
                <StatusBadge
                  data-testid="defect-form-review-severity"
                  type="severity"
                  value={form.values.severity as any}
                />
              </div>
              <div>
                <p
                  className="text-xs text-gray-400 mb-2"
                  data-testid={TEST_IDS.defectForm.labelReviewPriority}
                >
                  {t.defectForm.reviewLabelPriority}
                </p>
                <StatusBadge
                  data-testid="defect-form-review-priority"
                  type="priority"
                  value={form.values.priority as any}
                />
              </div>
            </div>

            <div>
              <p
                className="text-xs text-gray-400 mb-2"
                data-testid={TEST_IDS.defectForm.labelReviewDescription}
              >
                {t.defectForm.reviewLabelDescription}
              </p>
              <p
                className="text-gray-300 text-sm"
                data-testid={TEST_IDS.defectForm.textReviewDescription}
              >
                {form.values.description}
              </p>
            </div>

            <div>
              <p
                className="text-xs text-gray-400 mb-2"
                data-testid={TEST_IDS.defectForm.labelReviewSteps}
              >
                {t.defectForm.reviewLabelSteps}
              </p>
              <pre
                className="text-sm text-gray-400 bg-black/20 p-4 rounded border border-white/5 overflow-auto"
                data-testid={TEST_IDS.defectForm.textReviewSteps}
              >
                {form.values.stepsToReproduce}
              </pre>
            </div>

            {form.values.environmentId && (
              <div>
                <p
                  className="text-xs text-gray-400 mb-1"
                  data-testid={TEST_IDS.defectForm.labelReviewEnvironment}
                >
                  {t.defectForm.reviewLabelEnvironment}
                </p>
                <p
                  className="text-white font-medium"
                  data-testid={TEST_IDS.defectForm.textReviewEnvironment}
                >
                  {selectedProject?.environments.find(
                    (e) => e.id === form.values.environmentId,
                  )?.name || t.common.unknown}
                </p>
              </div>
            )}

            {form.values.assigneeId && (
              <div>
                <p
                  className="text-xs text-gray-400 mb-2"
                  data-testid={TEST_IDS.defectForm.labelReviewAssignee}
                >
                  {t.defectForm.reviewLabelAssignedTo}
                </p>
                {users.find((u) => u.id === form.values.assigneeId) && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const assignee = users.find(
                        (u) => u.id === form.values.assigneeId,
                      );
                      return assignee ? (
                        <>
                          <UserAvatar
                            data-testid="defect-form-review-assignee"
                            fullName={assignee.fullName}
                            avatarColor={`#${(assignee.id * 9999).toString(16).padStart(6, "0")}`}
                            role={assignee.role}
                            size="sm"
                          />
                          <span
                            className="text-white font-medium"
                            data-testid={
                              TEST_IDS.defectForm.textReviewAssigneeName
                            }
                          >
                            {assignee.fullName}
                          </span>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div data-testid={TEST_IDS.defectForm.page}>
      <PageHeader
        title={isEdit ? t.defectForm.titleEdit : t.defectForm.titleCreate}
        backTo="/defects"
      />

      <div className="mt-6">
        <Wizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => navigate("/defects")}
          testIdPrefix="defect-form"
        />
      </div>
    </div>
  );
}
