import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Wizard from "../../components/navigation/Wizard";
import TextInput from "../../components/forms/TextInput";
import TextArea from "../../components/forms/TextArea";
import Select from "../../components/forms/Select";
import EmptyState from "../../components/feedback/EmptyState";
import {
  TEST_IDS,
  testplanFormCaseRow,
  testplanFormStepRow,
} from "../../shared/testIds";
import { useForm } from "../../hooks/useForm";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useProjects } from "../../hooks/useProjects";
import { useUsers } from "../../hooks/useUsers";
import { t } from "../../i18n";
import { TEST_CASE_PRIORITIES } from "../../data/entities";
import type {
  TestPlan,
  TestCaseStep,
  TestCasePriority,
} from "../../data/entities";

interface FormValues extends Record<string, unknown> {
  name: string;
  projectId: string;
  description: string;
  assigneeId: string;
}

interface FormTestCase {
  name: string;
  description: string;
  preconditions: string;
  priority: TestCasePriority;
  steps: Array<Omit<TestCaseStep, "stepNumber">>;
}

export default function TestPlanForm() {
  const { testPlanId } = useParams<{ testPlanId: string }>();
  const navigate = useNavigate();
  const { testPlans, getById, create, update } = useTestPlans();
  const { projects } = useProjects();
  const { users } = useUsers();

  const id = testPlanId ? parseInt(testPlanId, 10) : null;
  const existingPlan = id ? getById(id) : null;
  const isEditMode = !!existingPlan;

  const initialValues: FormValues = {
    name: existingPlan?.name ?? "",
    projectId: existingPlan?.projectId.toString() ?? "",
    description: existingPlan?.description ?? "",
    assigneeId: existingPlan?.assigneeId?.toString() ?? "",
  };

  // Convert existing test cases to form format
  const initialTestCases: FormTestCase[] = existingPlan
    ? existingPlan.testCases.map((tc) => ({
        name: tc.name,
        description: tc.description,
        preconditions: tc.preconditions,
        priority: tc.priority,
        steps: tc.steps.map((s) => ({
          action: s.action,
          expectedResult: s.expectedResult,
        })),
      }))
    : [];

  const validateForm = (values: FormValues) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!values.name.trim()) {
      errors.name = t.testPlanForm.validateNameRequired;
    }

    if (!values.projectId) {
      errors.projectId = t.testPlanForm.validateProjectRequired;
    }

    if (!values.description.trim()) {
      errors.description = t.testPlanForm.validateDescriptionRequired;
    }

    return errors;
  };

  const form = useForm<FormValues>(initialValues, validateForm);
  const [testCases, setTestCases] = useState<FormTestCase[]>(initialTestCases);

  const validateStep1 = (): boolean => {
    const errors = validateForm(form.values);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    // At least 1 test case with at least 1 step
    return (
      testCases.length > 0 &&
      testCases.every(
        (tc) =>
          tc.name.trim() &&
          tc.steps.length > 0 &&
          tc.steps.every((s) => s.action.trim() && s.expectedResult.trim()),
      )
    );
  };

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      {
        name: "",
        description: "",
        preconditions: "",
        priority: "medium" as TestCasePriority,
        steps: [{ action: "", expectedResult: "" }],
      },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleUpdateTestCase = (
    index: number,
    field: keyof FormTestCase,
    value: any,
  ) => {
    const updated = [...testCases];
    (updated[index] as any)[field] = value;
    setTestCases(updated);
  };

  const handleAddStep = (caseIndex: number) => {
    const updated = [...testCases];
    const tc = updated[caseIndex];
    if (tc) {
      tc.steps.push({ action: "", expectedResult: "" });
    }
    setTestCases(updated);
  };

  const handleRemoveStep = (caseIndex: number, stepIndex: number) => {
    const updated = [...testCases];
    const tc = updated[caseIndex];
    if (tc) {
      tc.steps = tc.steps.filter((_, i) => i !== stepIndex);
    }
    setTestCases(updated);
  };

  const handleUpdateStep = (
    caseIndex: number,
    stepIndex: number,
    field: "action" | "expectedResult",
    value: string,
  ) => {
    const updated = [...testCases];
    const tc = updated[caseIndex];
    const step = tc?.steps[stepIndex];
    if (step) {
      (step as any)[field] = value;
    }
    setTestCases(updated);
  };

  const handleSubmit = () => {
    const planData = {
      name: form.values.name,
      projectId: parseInt(form.values.projectId, 10),
      description: form.values.description,
      status: "draft" as const,
      createdById: -1, // Will be set by the create/update handlers
      assigneeId: form.values.assigneeId
        ? parseInt(form.values.assigneeId, 10)
        : null,
      testCases: testCases.map((tc, idx) => ({
        id: existingPlan?.testCases[idx]?.id ?? idx,
        name: tc.name,
        description: tc.description,
        preconditions: tc.preconditions,
        priority: tc.priority,
        steps: tc.steps.map((s, stepIdx) => ({
          stepNumber: stepIdx + 1,
          action: s.action,
          expectedResult: s.expectedResult,
        })),
      })),
    };

    if (isEditMode && existingPlan) {
      const updated = update(existingPlan.id, planData);
      navigate(`/test-plans/${updated.id}`);
    } else {
      const created = create({
        ...planData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<TestPlan, "id">);
      navigate(`/test-plans/${created.id}`);
    }
  };

  const handleCancel = () => {
    navigate("/test-plans");
  };

  if (isEditMode && !existingPlan) {
    return (
      <div data-testid={TEST_IDS.testplanForm.page}>
        <EmptyState
          variant="not-found"
          title={t.testPlanForm.notFoundTitle}
          message={t.testPlanForm.notFoundMessage}
        />
      </div>
    );
  }

  const steps = [
    {
      label: t.testPlanForm.stepPlanDetails,
      validate: validateStep1,
      content: (
        <div data-testid="testplan-form-step-1" className="space-y-4 py-4">
          <TextInput
            data-testid={TEST_IDS.testplanForm.inputName}
            label={t.testPlanForm.labelName}
            name="name"
            value={form.values.name}
            onChange={(e) => form.setField("name", e.target.value)}
            error={form.touched.name ? (form.errors.name ?? null) : null}
            required
          />

          <Select
            data-testid={TEST_IDS.testplanForm.selectProject}
            label={t.testPlanForm.labelProject}
            name="projectId"
            value={form.values.projectId}
            onChange={(e) => form.setField("projectId", e.target.value)}
            options={projects.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            error={
              form.touched.projectId ? (form.errors.projectId ?? null) : null
            }
            required
          />

          <TextArea
            data-testid={TEST_IDS.testplanForm.inputDescription}
            label={t.testPlanForm.labelDescription}
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
            data-testid={TEST_IDS.testplanForm.selectAssignee}
            label={t.testPlanForm.labelAssignee}
            name="assigneeId"
            value={form.values.assigneeId}
            onChange={(e) => form.setField("assigneeId", e.target.value)}
            options={[
              { value: "", label: "— None —" },
              ...users.map((u) => ({
                value: u.id.toString(),
                label: u.fullName,
              })),
            ]}
          />
        </div>
      ),
    },
    {
      label: t.testPlanForm.stepTestCases,
      validate: validateStep2,
      content: (
        <div data-testid="testplan-form-step-2" className="space-y-4 py-4">
          <button
            type="button"
            onClick={handleAddTestCase}
            className="btn btn-secondary"
            data-testid={TEST_IDS.testplanForm.btnAddCase}
          >
            <Plus size={18} />
            {t.testPlanForm.btnAddTestCase}
          </button>

          {testCases.length === 0 ? (
            <p className="text-gray-400">{t.testPlanForm.noTestCasesYet}</p>
          ) : (
            testCases.map((testCase, caseIdx) => (
              <div
                key={caseIdx}
                data-testid={testplanFormCaseRow(caseIdx)}
                className="glass p-4 rounded-lg space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <TextInput
                      data-testid={`testplan-form-case-${caseIdx}-name`}
                      label={t.testPlanForm.labelCaseName}
                      name={`case-name-${caseIdx}`}
                      value={testCase.name}
                      onChange={(e) =>
                        handleUpdateTestCase(caseIdx, "name", e.target.value)
                      }
                      required
                    />

                    <Select
                      data-testid={`testplan-form-case-${caseIdx}-priority`}
                      label={t.testPlanForm.labelCasePriority}
                      name={`case-priority-${caseIdx}`}
                      value={testCase.priority}
                      onChange={(e) =>
                        handleUpdateTestCase(
                          caseIdx,
                          "priority",
                          e.target.value as TestCasePriority,
                        )
                      }
                      options={TEST_CASE_PRIORITIES.map((p) => ({
                        value: p,
                        label: p.charAt(0).toUpperCase() + p.slice(1),
                      }))}
                    />

                    <TextArea
                      data-testid={`testplan-form-case-${caseIdx}-description`}
                      label={t.testPlanForm.labelCaseDescription}
                      value={testCase.description}
                      onChange={(e) =>
                        handleUpdateTestCase(
                          caseIdx,
                          "description",
                          e.target.value,
                        )
                      }
                    />

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {t.common.preconditions}
                      </label>
                      <textarea
                        data-testid={`testplan-form-case-${caseIdx}-preconditions`}
                        value={testCase.preconditions}
                        onChange={(e) =>
                          handleUpdateTestCase(
                            caseIdx,
                            "preconditions",
                            e.target.value,
                          )
                        }
                        className="input-field w-full"
                        rows={2}
                      />
                    </div>

                    {/* Steps */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        {t.common.steps}
                      </label>
                      <div className="space-y-2">
                        {testCase.steps.map((step, stepIdx) => (
                          <div
                            key={stepIdx}
                            data-testid={testplanFormStepRow(caseIdx, stepIdx)}
                            className="flex gap-2"
                          >
                            <div className="flex-1">
                              <input
                                type="text"
                                data-testid={`testplan-form-case-${caseIdx}-step-${stepIdx}-action`}
                                placeholder={t.testPlanForm.placeholderAction}
                                value={step.action}
                                onChange={(e) =>
                                  handleUpdateStep(
                                    caseIdx,
                                    stepIdx,
                                    "action",
                                    e.target.value,
                                  )
                                }
                                className="input-field w-full"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                data-testid={`testplan-form-case-${caseIdx}-step-${stepIdx}-expected`}
                                placeholder={t.testPlanForm.placeholderExpectedResult}
                                value={step.expectedResult}
                                onChange={(e) =>
                                  handleUpdateStep(
                                    caseIdx,
                                    stepIdx,
                                    "expectedResult",
                                    e.target.value,
                                  )
                                }
                                className="input-field w-full"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveStep(caseIdx, stepIdx)}
                              className="btn btn-ghost text-red-400 hover:bg-red-500/20"
                              data-testid={`testplan-form-case-${caseIdx}-step-${stepIdx}-remove`}
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddStep(caseIdx)}
                        className="btn btn-ghost text-neon-purple mt-2 text-sm"
                        data-testid={`testplan-form-case-${caseIdx}-btn-add-step`}
                      >
                        <Plus size={16} />
                        {t.testPlanForm.btnAddStep}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTestCase(caseIdx)}
                    className="btn btn-ghost text-red-400 hover:bg-red-500/20"
                    data-testid={`testplan-form-case-${caseIdx}-btn-remove`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      label: t.testPlanForm.stepReview,
      validate: () => true,
      content: (
        <div data-testid="testplan-form-step-3" className="space-y-6 py-4">
          <div className="glass p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t.testPlanForm.sectionPlanSummary}
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">{t.testPlanForm.reviewLabelName}</span>
                <span className="text-white ml-2">{form.values.name}</span>
              </div>
              <div>
                <span className="text-gray-400">{t.testPlanForm.reviewLabelProject}</span>
                <span className="text-white ml-2">
                  {projects.find(
                    (p) => p.id.toString() === form.values.projectId,
                  )?.name || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">{t.testPlanForm.reviewLabelDescription}</span>
                <span className="text-white ml-2">
                  {form.values.description}
                </span>
              </div>
              <div>
                <span className="text-gray-400">{t.testPlanForm.reviewLabelAssignee}</span>
                <span className="text-white ml-2">
                  {form.values.assigneeId
                    ? users.find(
                        (u) => u.id.toString() === form.values.assigneeId,
                      )?.fullName
                    : "— None —"}
                </span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Test Cases ({testCases.length})
            </h3>
            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded-lg text-sm">
                  <p className="font-medium text-white">{tc.name}</p>
                  <p className="text-gray-400 text-xs">
                    {tc.steps.length} step{tc.steps.length !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div data-testid={TEST_IDS.testplanForm.page}>
      <PageHeader
        title={isEditMode ? t.testPlanForm.editTitle : t.testPlanForm.createTitle}
        backTo="/test-plans"
      />

      <div className="mt-6">
        <Wizard
          steps={steps}
          onComplete={handleSubmit}
          onCancel={handleCancel}
          testIdPrefix="testplan-form"
        />
      </div>
    </div>
  );
}
