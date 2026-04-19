import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Wizard from "../../components/navigation/Wizard";
import TextInput from "../../components/forms/TextInput";
import TextArea from "../../components/forms/TextArea";
import Select from "../../components/forms/Select";
import MultiSelect from "../../components/forms/MultiSelect";
import EmptyState from "../../components/feedback/EmptyState";
import {
  TEST_IDS,
  projectFormEnvRow,
  projectFormEnvRemove,
} from "../../shared/testIds";
import { useForm } from "../../hooks/useForm";
import { useProjects } from "../../hooks/useProjects";
import { useUsers } from "../../hooks/useUsers";
import { t } from "../../i18n";
import { PROJECT_STATUSES, ENVIRONMENT_TYPES } from "../../data/entities";
import type {
  Project,
  Environment,
  EnvironmentType,
} from "../../data/entities";

interface FormValues extends Record<string, unknown> {
  name: string;
  code: string;
  description: string;
  status: string;
  leadId: string;
}

export default function ProjectForm() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, getById, create, update } = useProjects();
  const { users } = useUsers();

  const id = projectId ? parseInt(projectId, 10) : null;
  const existingProject = id ? getById(id) : null;
  const isEditMode = !!existingProject;

  const initialValues: FormValues = {
    name: existingProject?.name ?? "",
    code: existingProject?.code ?? "",
    description: existingProject?.description ?? "",
    status: existingProject?.status ?? "planning",
    leadId: existingProject?.leadId.toString() ?? "",
  };

  const [environments, setEnvironments] = useState<
    Array<{ name: string; type: EnvironmentType; url: string }>
  >(existingProject?.environments ?? []);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    existingProject?.memberIds.map((id) => id.toString()) ?? [],
  );

  const validateForm = (values: FormValues) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!values.name.trim()) {
      errors.name = t.projectForm.validateNameRequired;
    }

    if (!values.code.trim()) {
      errors.code = t.projectForm.validateCodeRequired;
    } else if (!/^[A-Z0-9]{1,10}$/.test(values.code)) {
      errors.code = t.projectForm.validateCodeFormat;
    }

    if (!values.description.trim()) {
      errors.description = t.projectForm.validateDescriptionRequired;
    }

    if (!values.leadId) {
      errors.leadId = t.projectForm.validateLeadRequired;
    }

    return errors;
  };

  const form = useForm<FormValues>(initialValues, validateForm);

  const validateStep3 = (): boolean => {
    if (environments.length === 0) {
      return false;
    }
    return environments.every((env) => env.name.trim() && env.type);
  };

  const qaLeadUsers = users.filter(
    (u) => u.role === "qa_lead" || u.role === "admin",
  );

  const handleAddEnvironment = () => {
    setEnvironments([...environments, { name: "", type: "dev", url: "" }]);
  };

  const handleRemoveEnvironment = (index: number) => {
    setEnvironments(environments.filter((_, i) => i !== index));
  };

  const handleEnvironmentChange = (
    index: number,
    field: keyof Environment,
    value: string,
  ) => {
    const updated = [...environments];
    (updated[index] as any)[field] = value;
    setEnvironments(updated);
  };

  const handleSubmit = () => {
    const projectData = {
      name: form.values.name,
      code: form.values.code.toUpperCase(),
      description: form.values.description,
      status: form.values.status as any,
      leadId: parseInt(form.values.leadId, 10),
      memberIds: selectedMembers.map((id) => parseInt(id, 10)),
      environments: environments.map((env, idx) => ({
        id: idx + 1,
        ...env,
      })),
    };

    if (isEditMode && existingProject) {
      const updated = update(existingProject.id, projectData);
      navigate(`/projects/${updated.id}`);
    } else {
      const created = create({
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<Project, "id">);
      navigate(`/projects/${created.id}`);
    }
  };

  const handleCancel = () => {
    navigate("/projects");
  };

  if (isEditMode && !existingProject) {
    return (
      <div data-testid={TEST_IDS.projectForm.page}>
        <EmptyState
          variant="not-found"
          title={t.projectForm.notFoundTitle}
          message={t.projectForm.notFoundMessage}
        />
      </div>
    );
  }

  const steps = [
    {
      label: t.projectForm.stepBasicInfo,
      validate: () => {
        const errors = validateForm(form.values);
        const step1Fields: Array<keyof FormValues> = [
          "name",
          "code",
          "description",
          "status",
        ];
        const step1Errors = step1Fields.filter((k) => k in errors);
        if (step1Errors.length > 0) {
          form.validate(); // populates form.errors state for re-render
          step1Errors.forEach((field) => form.setFieldTouched(field));
          return false;
        }
        return true;
      },
      content: (
        <div data-testid={`project-form-step-1`} className="space-y-4 py-4">
          <TextInput
            data-testid={TEST_IDS.projectForm.inputName}
            label={t.projectForm.labelProjectName}
            name="name"
            value={form.values.name}
            onChange={(e) => form.setField("name", e.target.value)}
            error={form.touched.name ? (form.errors.name ?? null) : null}
            required
          />

          <TextInput
            data-testid={TEST_IDS.projectForm.inputCode}
            label={t.projectForm.labelProjectCode}
            name="code"
            value={form.values.code}
            onChange={(e) =>
              form.setField("code", e.target.value.toUpperCase())
            }
            error={form.touched.code ? (form.errors.code ?? null) : null}
            placeholder="e.g., PROJ001"
            required
          />

          <TextArea
            data-testid={TEST_IDS.projectForm.inputDescription}
            label={t.projectForm.labelDescription}
            name="description"
            value={form.values.description}
            onChange={(e) => form.setField("description", e.target.value)}
            error={
              form.touched.description
                ? (form.errors.description ?? null)
                : null
            }
            required
          />

          <Select
            data-testid={TEST_IDS.projectForm.selectStatus}
            label={t.projectForm.labelStatus}
            name="status"
            value={form.values.status}
            onChange={(e) => form.setField("status", e.target.value)}
            options={PROJECT_STATUSES.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            }))}
            required
          />
        </div>
      ),
    },
    {
      label: t.projectForm.stepTeamAssignment,
      validate: () => {
        const errors = validateForm(form.values);
        if (errors.leadId) {
          form.validate(); // populates form.errors state for re-render
          form.setFieldTouched("leadId");
          return false;
        }
        return true;
      },
      content: (
        <div data-testid={`project-form-step-2`} className="space-y-4 py-4">
          <Select
            data-testid={TEST_IDS.projectForm.selectLead}
            label={t.projectForm.labelQaLead}
            name="leadId"
            value={form.values.leadId}
            onChange={(e) => form.setField("leadId", e.target.value)}
            options={qaLeadUsers.map((u) => ({
              value: u.id.toString(),
              label: u.fullName,
            }))}
            error={form.touched.leadId ? (form.errors.leadId ?? null) : null}
            placeholder={t.projectForm.placeholderQaLead}
            required
          />

          <MultiSelect
            data-testid={TEST_IDS.projectForm.selectMembers}
            label={t.projectForm.labelTeamMembers}
            name="memberIds"
            value={selectedMembers}
            onChange={setSelectedMembers}
            options={users.map((u) => ({
              value: u.id.toString(),
              label: u.fullName,
            }))}
          />
        </div>
      ),
    },
    {
      label: t.projectForm.stepEnvironments,
      validate: validateStep3,
      content: (
        <div data-testid={`project-form-step-3`} className="space-y-4 py-4">
          {environments.length === 0 ? (
            <p className="text-gray-400">No environments added yet.</p>
          ) : (
            environments.map((env, idx) => (
              <div
                key={idx}
                data-testid={projectFormEnvRow(idx)}
                className="glass p-4 rounded-lg"
              >
                <div className="grid grid-cols-12 gap-3">
                  <TextInput
                    data-testid={`project-form-env-name-${idx}`}
                    label={t.projectForm.labelEnvName}
                    name={`env-name-${idx}`}
                    value={env.name}
                    onChange={(e) =>
                      handleEnvironmentChange(idx, "name", e.target.value)
                    }
                    className="col-span-4"
                  />

                  <Select
                    data-testid={`project-form-env-type-${idx}`}
                    label={t.projectForm.labelEnvType}
                    name={`env-type-${idx}`}
                    value={env.type}
                    onChange={(e) =>
                      handleEnvironmentChange(
                        idx,
                        "type",
                        e.target.value as EnvironmentType,
                      )
                    }
                    options={ENVIRONMENT_TYPES.map((t) => ({
                      value: t,
                      label: t.charAt(0).toUpperCase() + t.slice(1),
                    }))}
                    className="col-span-4"
                  />

                  <TextInput
                    data-testid={`project-form-env-url-${idx}`}
                    label={t.projectForm.labelEnvUrl}
                    name={`env-url-${idx}`}
                    value={env.url}
                    onChange={(e) =>
                      handleEnvironmentChange(idx, "url", e.target.value)
                    }
                    className="col-span-3"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveEnvironment(idx)}
                    data-testid={projectFormEnvRemove(idx)}
                    className="btn btn-ghost text-red-400 hover:bg-red-500/20 h-fit mt-7"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={handleAddEnvironment}
            data-testid={TEST_IDS.projectForm.btnAddEnv}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Environment
          </button>
        </div>
      ),
    },
    {
      label: t.common.review,
      content: (
        <div data-testid={`project-form-step-4`} className="space-y-4 py-4">
          <div className="glass p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Project Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white">{form.values.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Code:</span>
                <span className="text-white">
                  {form.values.code.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white">
                  {form.values.status.charAt(0).toUpperCase() +
                    form.values.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Description:</span>
                <span className="text-white max-w-xs text-right">
                  {form.values.description}
                </span>
              </div>
            </div>
          </div>

          <div className="glass p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Team Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">QA Lead:</span>
                <span className="text-white">
                  {users.find((u) => u.id === parseInt(form.values.leadId, 10))
                    ?.fullName || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Team Members:</span>
                <span className="text-white">{selectedMembers.length}</span>
              </div>
            </div>
          </div>

          <div className="glass p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Environments
            </h3>
            {environments.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No environments configured
              </p>
            ) : (
              <div className="space-y-2">
                {environments.map((env, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {env.name} ({env.type})
                    </span>
                    <span className="text-blue-400 text-right truncate">
                      {env.url}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div data-testid={TEST_IDS.projectForm.page}>
      <PageHeader
        title={
          isEditMode
            ? `${t.projectForm.editTitle} ${existingProject?.name}`
            : t.projectForm.createTitle
        }
        backTo="/projects"
      />

      <Wizard
        steps={steps}
        onComplete={handleSubmit}
        onCancel={handleCancel}
        testIdPrefix="project-form"
        className="mt-6"
      />
    </div>
  );
}
