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
  testplanFormCaseStepsError,
  testplanFormCaseStepsLabel,
  testplanFormReviewCaseName,
  testplanFormReviewCaseSteps,
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
  const { planId: testPlanId } = useParams<{ planId: string }>();
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
  const [testCaseListError, setTestCaseListError] = useState<string | null>(
    null,
  );
  const [testCaseErrors, setTestCaseErrors] = useState<
    Array<{ name?: string; steps?: string }>
  >([]);
  const [stepErrors, setStepErrors] = useState<
    Array<Array<{ action?: string; expectedResult?: string }>>
  >([]);

  const validateStep2 = (): boolean => {
    if (testCases.length === 0) {
      setTestCaseListError(t.testPlanForm.validateCasesRequired);
      setTestCaseErrors([]);
      setStepErrors([]);
      return false;
    }

    setTestCaseListError(null);

    let isValid = true;
    const caseErrorsComputed: Array<{ name?: string; steps?: string }> = [];
    const stepErrorsComputed: Array<
      Array<{ action?: string; expectedResult?: string }>
    > = [];

    testCases.forEach((testCase) => {
      const caseError: { name?: string; steps?: string } = {};
      if (!testCase.name.trim()) {
        caseError.name = t.testPlanForm.validateCaseNameRequired;
        isValid = false;
      }
      if (testCase.steps.length === 0) {
        caseError.steps = t.testPlanForm.validateCaseStepsRequired;
        isValid = false;
      }
      caseErrorsComputed.push(caseError);

      const perStepErrors: Array<{
        action?: string;
        expectedResult?: string;
      }> = [];
      testCase.steps.forEach((step) => {
        const stepError: { action?: string; expectedResult?: string } = {};
        if (!step.action.trim()) {
          stepError.action = t.testPlanForm.validateStepActionRequired;
          isValid = false;
        }
        if (!step.expectedResult.trim()) {
          stepError.expectedResult =
            t.testPlanForm.validateStepExpectedRequired;
          isValid = false;
        }
        perStepErrors.push(stepError);
      });
      stepErrorsComputed.push(perStepErrors);
    });

    setTestCaseErrors(caseErrorsComputed);
    setStepErrors(stepErrorsComputed);

    return isValid;
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
    setTestCaseErrors((previous) => [...previous, {}]);
    setStepErrors((previous) => [...previous, [{}]]);
    setTestCaseListError(null);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
    setTestCaseErrors((previous) => previous.filter((_, i) => i !== index));
    setStepErrors((previous) => previous.filter((_, i) => i !== index));
  };

  const handleUpdateTestCase = (
    index: number,
    field: keyof FormTestCase,
    value: any,
  ) => {
    const updated = [...testCases];
    (updated[index] as any)[field] = value;
    setTestCases(updated);

    if (field === "name") {
      setTestCaseErrors((previous) => {
        const updatedErrors = [...previous];
        if (updatedErrors[index]) {
          const { name: _, ...rest } = updatedErrors[index];
          updatedErrors[index] = rest;
        }
        return updatedErrors;
      });
    }
  };

  const handleAddStep = (caseIndex: number) => {
    const updated = [...testCases];
    const tc = updated[caseIndex];
    if (tc) {
      tc.steps.push({ action: "", expectedResult: "" });
    }
    setTestCases(updated);

    setTestCaseErrors((previous) => {
      const updatedErrors = [...previous];
      if (updatedErrors[caseIndex]) {
        const { steps: _, ...rest } = updatedErrors[caseIndex];
        updatedErrors[caseIndex] = rest;
      }
      return updatedErrors;
    });
    setStepErrors((previous) => {
      const updatedErrors = [...previous];
      if (updatedErrors[caseIndex]) {
        updatedErrors[caseIndex] = [...updatedErrors[caseIndex], {}];
      }
      return updatedErrors;
    });
  };

  const handleRemoveStep = (caseIndex: number, stepIndex: number) => {
    const updated = [...testCases];
    const tc = updated[caseIndex];
    if (tc) {
      tc.steps = tc.steps.filter((_, i) => i !== stepIndex);
    }
    setTestCases(updated);

    setStepErrors((previous) => {
      const updatedErrors = [...previous];
      if (updatedErrors[caseIndex]) {
        updatedErrors[caseIndex] = updatedErrors[caseIndex].filter(
          (_, i) => i !== stepIndex,
        );
      }
      return updatedErrors;
    });
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

    setStepErrors((previous) => {
      const updatedErrors = [...previous];
      const caseStepErrors = updatedErrors[caseIndex];
      const currentStepError = caseStepErrors?.[stepIndex];
      if (caseStepErrors && currentStepError) {
        const updatedStepErrors = [...caseStepErrors];
        const { [field]: _, ...rest } = currentStepError;
        updatedStepErrors[stepIndex] = rest;
        updatedErrors[caseIndex] = updatedStepErrors;
      }
      return updatedErrors;
    });
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
      validate: () => form.validateFields(["name", "projectId", "description"]),
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
            placeholder="Select a project"
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
            name="description"
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
            options={users.map((u) => ({
              value: u.id.toString(),
              label: u.fullName,
            }))}
            placeholder={t.common.none}
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

          {testCaseListError && (
            <p
              data-testid={TEST_IDS.testplanForm.casesError}
              className="text-red-400 text-sm"
            >
              {testCaseListError}
            </p>
          )}

          {testCases.length === 0 ? (
            <p
              className="text-gray-400"
              data-testid={TEST_IDS.testplanForm.textNoCases}
            >
              {t.testPlanForm.noTestCasesYet}
            </p>
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
                      error={testCaseErrors[caseIdx]?.name ?? null}
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
                      name={`case-${caseIdx}-description`}
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

                    <TextArea
                      data-testid={`testplan-form-case-${caseIdx}-preconditions`}
                      name={`case-${caseIdx}-preconditions`}
                      label={t.common.preconditions}
                      value={testCase.preconditions}
                      onChange={(e) =>
                        handleUpdateTestCase(
                          caseIdx,
                          "preconditions",
                          e.target.value,
                        )
                      }
                      rows={2}
                    />

                    {/* Steps */}
                    <div>
                      <label
                        className="block text-sm font-medium text-white mb-2"
                        data-testid={testplanFormCaseStepsLabel(caseIdx)}
                      >
                        {t.common.steps}
                      </label>
                      {testCaseErrors[caseIdx]?.steps && (
                        <p
                          data-testid={testplanFormCaseStepsError(caseIdx)}
                          className="text-red-400 text-sm mt-1"
                        >
                          {testCaseErrors[caseIdx].steps}
                        </p>
                      )}
                      <div className="space-y-2">
                        {testCase.steps.map((step, stepIdx) => (
                          <div
                            key={stepIdx}
                            data-testid={testplanFormStepRow(caseIdx, stepIdx)}
                            className="flex gap-2"
                          >
                            <TextInput
                              data-testid={`testplan-form-case-${caseIdx}-step-${stepIdx}-action`}
                              name={`case-${caseIdx}-step-${stepIdx}-action`}
                              label=""
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
                              error={
                                stepErrors[caseIdx]?.[stepIdx]?.action ?? null
                              }
                              className="flex-1"
                            />
                            <TextInput
                              data-testid={`testplan-form-case-${caseIdx}-step-${stepIdx}-expected`}
                              name={`case-${caseIdx}-step-${stepIdx}-expected`}
                              label=""
                              placeholder={
                                t.testPlanForm.placeholderExpectedResult
                              }
                              value={step.expectedResult}
                              onChange={(e) =>
                                handleUpdateStep(
                                  caseIdx,
                                  stepIdx,
                                  "expectedResult",
                                  e.target.value,
                                )
                              }
                              error={
                                stepErrors[caseIdx]?.[stepIdx]
                                  ?.expectedResult ?? null
                              }
                              className="flex-1"
                            />
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
            <h3
              className="text-lg font-semibold text-white mb-4"
              data-testid={TEST_IDS.testplanForm.headingReviewSummary}
            >
              {t.testPlanForm.sectionPlanSummary}
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span
                  className="text-gray-400"
                  data-testid={TEST_IDS.testplanForm.labelReviewName}
                >
                  {t.testPlanForm.reviewLabelName}
                </span>
                <span
                  className="text-white ml-2"
                  data-testid={TEST_IDS.testplanForm.textReviewName}
                >
                  {form.values.name}
                </span>
              </div>
              <div>
                <span
                  className="text-gray-400"
                  data-testid={TEST_IDS.testplanForm.labelReviewProject}
                >
                  {t.testPlanForm.reviewLabelProject}
                </span>
                <span
                  className="text-white ml-2"
                  data-testid={TEST_IDS.testplanForm.textReviewProject}
                >
                  {projects.find(
                    (p) => p.id.toString() === form.values.projectId,
                  )?.name || "—"}
                </span>
              </div>
              <div>
                <span
                  className="text-gray-400"
                  data-testid={TEST_IDS.testplanForm.labelReviewDescription}
                >
                  {t.testPlanForm.reviewLabelDescription}
                </span>
                <span
                  className="text-white ml-2"
                  data-testid={TEST_IDS.testplanForm.textReviewDescription}
                >
                  {form.values.description}
                </span>
              </div>
              <div>
                <span
                  className="text-gray-400"
                  data-testid={TEST_IDS.testplanForm.labelReviewAssignee}
                >
                  {t.testPlanForm.reviewLabelAssignee}
                </span>
                <span
                  className="text-white ml-2"
                  data-testid={TEST_IDS.testplanForm.textReviewAssignee}
                >
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
            <h3
              className="text-lg font-semibold text-white mb-4"
              data-testid={TEST_IDS.testplanForm.headingReviewCases}
            >
              Test Cases ({testCases.length})
            </h3>
            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded-lg text-sm">
                  <p
                    className="font-medium text-white"
                    data-testid={testplanFormReviewCaseName(idx)}
                  >
                    {tc.name}
                  </p>
                  <p
                    className="text-gray-400 text-xs"
                    data-testid={testplanFormReviewCaseSteps(idx)}
                  >
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
        title={
          isEditMode ? t.testPlanForm.editTitle : t.testPlanForm.createTitle
        }
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
