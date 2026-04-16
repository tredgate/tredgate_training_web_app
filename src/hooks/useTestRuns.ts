import { useCallback } from "react";
import type { TestRun, TestRunResult } from "../data/entities";
import { useStore } from "./useStore";
import { useToast } from "./useToast";

export interface UseTestRunsReturn {
  testRuns: TestRun[];
  getById: (id: number) => TestRun | null;
  create: (data: Omit<TestRun, "id" | "startedAt" | "completedAt">) => TestRun;
  update: (id: number, data: Partial<Omit<TestRun, "id">>) => TestRun;
  updateResult: (
    runId: number,
    testCaseId: number,
    result: Partial<TestRunResult>,
  ) => TestRun;
  completeRun: (runId: number) => TestRun;
  getByPlan: (testPlanId: number) => TestRun[];
  getByExecutor: (userId: number) => TestRun[];
  refresh: () => void;
}

/**
 * Test run hook.
 * Wraps useStore<TestRun> and adds execution helpers (recordResult, completeRun).
 */
export function useTestRuns(): UseTestRunsReturn {
  const { items: testRuns, ...store } = useStore<TestRun>("tqh_test_runs");
  const { addToast } = useToast();

  const updateResult = useCallback(
    (
      runId: number,
      testCaseId: number,
      result: Partial<TestRunResult>,
    ): TestRun => {
      const run = store.getById(runId);
      if (!run) throw new Error(`TestRun ${runId} not found`);

      const updated = store.update(runId, {
        results: run.results.map((r) =>
          r.testCaseId === testCaseId ? { ...r, ...result, testCaseId } : r,
        ),
      });
      addToast("success", "Result recorded");
      return updated;
    },
    [store, addToast],
  );

  const completeRun = useCallback(
    (runId: number): TestRun => {
      const updated = store.update(runId, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });
      addToast("success", "Test run completed");
      return updated;
    },
    [store, addToast],
  );

  const getByPlan = useCallback(
    (testPlanId: number): TestRun[] => {
      return testRuns.filter((tr) => tr.testPlanId === testPlanId);
    },
    [testRuns],
  );

  const getByExecutor = useCallback(
    (userId: number): TestRun[] => {
      return testRuns.filter((tr) => tr.executorId === userId);
    },
    [testRuns],
  );

  const create = useCallback(
    (data: Omit<TestRun, "id" | "startedAt" | "completedAt">): TestRun => {
      const now = new Date().toISOString();
      const created = store.create({
        ...data,
        startedAt: now,
        completedAt: null,
        status: "in_progress",
      } as Omit<TestRun, "id">);
      addToast("success", "Test run started");
      return created;
    },
    [store, addToast],
  );

  const update = useCallback(
    (id: number, data: Partial<Omit<TestRun, "id">>): TestRun => {
      const updated = store.update(id, data);
      addToast("success", "Test run updated");
      return updated;
    },
    [store, addToast],
  );

  return {
    testRuns,
    getById: store.getById,
    create,
    update,
    updateResult,
    completeRun,
    getByPlan,
    getByExecutor,
    refresh: store.refresh,
  };
}
