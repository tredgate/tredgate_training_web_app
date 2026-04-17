import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, SkipForward } from "lucide-react";
import { TEST_IDS, testrunStepBtn } from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import Modal from "../../components/feedback/Modal";
import EmptyState from "../../components/feedback/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { useTestRuns } from "../../hooks/useTestRuns";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useToast } from "../../hooks/useToast";
import type { TestRun, TestRunResult, TestCaseResultStatus } from "../../data/entities";

interface FailNoteModalData {
  caseIndex: number;
  stepIndex: number;
}

export default function TestRunExecution() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { testRuns, getById: getRunById, updateResult, completeRun } = useTestRuns();
  const { getById: getPlanById } = useTestPlans();
  const { addToast } = useToast();

  const id = runId ? parseInt(runId, 10) : null;
  const testRun = id ? getRunById(id) : null;

  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [failNoteModal, setFailNoteModal] = useState<FailNoteModalData | null>(
    null,
  );
  const [failNote, setFailNote] = useState("");

  if (!user) return null;

  if (!testRun) {
    return (
      <div data-testid={TEST_IDS.testrunExecution.page}>
        <EmptyState
          variant="not-found"
          title="Test Run not found"
          message="The test run you're looking for doesn't exist."
        />
      </div>
    );
  }

  const testPlan = getPlanById(testRun.testPlanId);
  if (!testPlan) {
    return (
      <div data-testid={TEST_IDS.testrunExecution.page}>
        <EmptyState
          variant="not-found"
          title="Test Plan not found"
          message="The associated test plan doesn't exist."
        />
      </div>
    );
  }

  // Get current case
  const currentCase = testPlan.testCases[currentCaseIndex];
  if (!currentCase) {
    return (
      <div data-testid={TEST_IDS.testrunExecution.page}>
        <EmptyState
          variant="not-found"
          title="Test case not found"
          message="The current test case doesn't exist."
        />
      </div>
    );
  }

  // Calculate progress
  const totalSteps = testPlan.testCases.reduce(
    (sum, tc) => sum + tc.steps.length,
    0,
  );
  const completedSteps = testRun.results.filter(
    (r) => r.status !== "not_run",
  ).length;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Get results for current case
  const currentCaseResults = testRun.results.filter(
    (r) => r.testCaseId === currentCase.id,
  );

  // Check if current case is fully executed
  const currentCaseFullyExecuted = currentCase.steps.every((step, stepIdx) => {
    const result = currentCaseResults[stepIdx];
    return result && result.status !== "not_run";
  });

  // Count passed/failed/skipped in current case
  const casePassed = currentCaseResults.filter(
    (r) => r.status === "passed",
  ).length;
  const caseFailed = currentCaseResults.filter(
    (r) => r.status === "failed",
  ).length;
  const caseSkipped = currentCaseResults.filter(
    (r) => r.status === "skipped",
  ).length;

  // Check if all cases are fully executed
  const allCasesExecuted = testPlan.testCases.every((tc) => {
    const tcResults = testRun.results.filter((r) => r.testCaseId === tc.id);
    return tc.steps.every((step, stepIdx) => {
      const result = tcResults[stepIdx];
      return result && result.status !== "not_run";
    });
  });

  // Handle step verdict
  const handleStepVerdict = (
    caseIndex: number,
    stepIndex: number,
    verdict: "pass" | "fail" | "skip",
  ) => {
    if (verdict === "fail") {
      setFailNoteModal({ caseIndex, stepIndex });
      setFailNote("");
      return;
    }

    recordStepResult(caseIndex, stepIndex, verdict, "");
  };

  const recordStepResult = (
    caseIndex: number,
    stepIndex: number,
    verdict: "pass" | "fail" | "skip",
    note: string,
  ) => {
    const caseId = testPlan.testCases[caseIndex]?.id;
    if (!caseId) return;

    const status: TestCaseResultStatus =
      verdict === "pass"
        ? "passed"
        : verdict === "skip"
          ? "skipped"
          : "failed";

    const resultData: Partial<TestRunResult> = {
      status,
      notes: note || "",
    };

    updateResult(testRun.id, caseId, resultData);

    // Auto-advance to next step/case
    const nextStepIndex = stepIndex + 1;
    if (nextStepIndex < currentCase.steps.length) {
      // Next step in same case
    } else {
      // Move to next case
      const nextCaseIndex = caseIndex + 1;
      if (nextCaseIndex < testPlan.testCases.length) {
        setCurrentCaseIndex(nextCaseIndex);
      }
    }
  };

  const handleFailNoteSubmit = () => {
    if (failNoteModal) {
      recordStepResult(
        failNoteModal.caseIndex,
        failNoteModal.stepIndex,
        "fail",
        failNote,
      );
      setFailNoteModal(null);
      setFailNote("");
    }
  };

  const handleCompleteRun = () => {
    completeRun(testRun.id);
    navigate(`/test-plans/${testPlan.id}`);
  };

  const handlePrevCase = () => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex(currentCaseIndex - 1);
    }
  };

  const handleNextCase = () => {
    if (currentCaseIndex < testPlan.testCases.length - 1) {
      setCurrentCaseIndex(currentCaseIndex + 1);
    }
  };

  return (
    <div data-testid={TEST_IDS.testrunExecution.page}>
      <PageHeader
        title={`Executing: ${testPlan.name}`}
        backTo={`/test-plans/${testPlan.id}`}
      />

      <div className="mt-6 space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">
              Case {currentCaseIndex + 1} of {testPlan.testCases.length}
            </span>
            <span className="text-gray-400">
              {Math.round(progressPercent)}% complete
            </span>
          </div>
          <div
            data-testid={TEST_IDS.testrunExecution.progressBar}
            className="h-2 bg-white/10 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-neon-purple transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current test case card */}
        <div className="glass p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-2">
            {currentCase.name}
          </h2>
          {currentCase.description && (
            <p className="text-gray-400 text-sm mb-4">{currentCase.description}</p>
          )}

          {/* Case status if completed */}
          {currentCaseFullyExecuted && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg text-sm">
              <p className="text-gray-300">
                <span className="text-green-400">✓</span> Passed: {casePassed} ·{" "}
                <span className="text-red-400">✗</span> Failed: {caseFailed} ·{" "}
                <span className="text-yellow-400">⊘</span> Skipped: {caseSkipped}
              </p>
            </div>
          )}

          {/* Steps list */}
          <div className="space-y-3">
            {currentCase.steps.map((step, stepIdx) => {
              const result = currentCaseResults[stepIdx];
              const isCompleted = result && result.status !== "not_run";
              const isCurrentStep = stepIdx === 0; // Assume first incomplete step or first step

              return (
                <div
                  key={stepIdx}
                  className={`p-4 rounded-lg border ${
                    isCurrentStep && !isCompleted
                      ? "border-neon-purple bg-neon-purple/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-400">
                          Step {stepIdx + 1}
                        </span>
                        {isCompleted && result && (
                          <span
                            className={`text-xs font-medium ${
                              result.status === "passed"
                                ? "text-green-400"
                                : result.status === "failed"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                            }`}
                          >
                            [{result.status.toUpperCase()}]
                          </span>
                        )}
                      </div>
                      <p className="text-white font-medium">Action:</p>
                      <p className="text-gray-300 text-sm ml-2">{step.action}</p>
                      <p className="text-white font-medium mt-2">Expected:</p>
                      <p className="text-gray-300 text-sm ml-2">
                        {step.expectedResult}
                      </p>
                      {result?.notes && (
                        <>
                          <p className="text-white font-medium mt-2">Note:</p>
                          <p className="text-gray-300 text-sm ml-2">
                            {result.notes}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Verdict buttons */}
                    {!isCompleted && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStepVerdict(
                              currentCaseIndex,
                              stepIdx,
                              "pass",
                            )
                          }
                          className="btn btn-ghost bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          data-testid={testrunStepBtn(
                            currentCaseIndex,
                            stepIdx,
                            "pass",
                          )}
                          title="Pass"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() =>
                            handleStepVerdict(
                              currentCaseIndex,
                              stepIdx,
                              "fail",
                            )
                          }
                          className="btn btn-ghost bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          data-testid={testrunStepBtn(
                            currentCaseIndex,
                            stepIdx,
                            "fail",
                          )}
                          title="Fail"
                        >
                          <XCircle size={20} />
                        </button>
                        <button
                          onClick={() =>
                            handleStepVerdict(
                              currentCaseIndex,
                              stepIdx,
                              "skip",
                            )
                          }
                          className="btn btn-ghost bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                          data-testid={testrunStepBtn(
                            currentCaseIndex,
                            stepIdx,
                            "skip",
                          )}
                          title="Skip"
                        >
                          <SkipForward size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={handlePrevCase}
            disabled={currentCaseIndex === 0}
            className="btn btn-secondary disabled:opacity-50"
            data-testid={TEST_IDS.testrunExecution.btnPrevCase}
          >
            <ChevronLeft size={18} />
            Previous Case
          </button>

          <button
            onClick={handleNextCase}
            disabled={currentCaseIndex === testPlan.testCases.length - 1}
            className="btn btn-secondary disabled:opacity-50"
            data-testid={TEST_IDS.testrunExecution.btnNextCase}
          >
            Next Case
            <ChevronRight size={18} />
          </button>

          <button
            onClick={handleCompleteRun}
            disabled={!allCasesExecuted}
            className="btn btn-primary disabled:opacity-50"
            data-testid={TEST_IDS.testrunExecution.btnComplete}
          >
            Complete Run
          </button>
        </div>
      </div>

      {/* Fail note modal */}
      {failNoteModal && (
        <Modal
          title="Record Failure"
          onClose={() => setFailNoteModal(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Failure Note (optional)
              </label>
              <textarea
                value={failNote}
                onChange={(e) => setFailNote(e.target.value)}
                placeholder="Why did this step fail?"
                className="input-field w-full"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setFailNoteModal(null)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleFailNoteSubmit}
                className="btn btn-primary"
              >
                Record Failure
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
