import { useCallback } from "react";
import type { TestPlan, TestCase } from "../data/entities";
import { useStore } from "./useStore";
import { useToast } from "./useToast";

export interface UseTestPlansReturn {
  testPlans: TestPlan[];
  getById: (id: number) => TestPlan | null;
  create: (data: Omit<TestPlan, "id" | "createdAt" | "updatedAt">) => TestPlan;
  update: (
    id: number,
    data: Partial<Omit<TestPlan, "id" | "createdAt">>,
  ) => TestPlan;
  remove: (id: number) => void;
  addTestCase: (planId: number, testCase: Omit<TestCase, "id">) => TestPlan;
  updateTestCase: (
    planId: number,
    testCaseId: number,
    data: Partial<Omit<TestCase, "id">>,
  ) => TestPlan;
  removeTestCase: (planId: number, testCaseId: number) => TestPlan;
  getByProject: (projectId: number) => TestPlan[];
  refresh: () => void;
}

/**
 * Test plan hook.
 * Wraps useStore<TestPlan> and adds test case management (embedded in testCases array).
 */
export function useTestPlans(): UseTestPlansReturn {
  const { items: testPlans, ...store } = useStore<TestPlan>("tqh_test_plans");
  const { addToast } = useToast();

  const addTestCase = useCallback(
    (planId: number, testCase: Omit<TestCase, "id">): TestPlan => {
      const plan = store.getById(planId);
      if (!plan) throw new Error(`TestPlan ${planId} not found`);

      const maxId = plan.testCases.reduce((max, tc) => Math.max(max, tc.id), 0);
      const newTestCase: TestCase = {
        ...testCase,
        id: maxId + 1,
      };

      const updated = store.update(planId, {
        testCases: [...plan.testCases, newTestCase],
      });
      addToast("success", "Test case added");
      return updated;
    },
    [store, addToast],
  );

  const updateTestCase = useCallback(
    (
      planId: number,
      testCaseId: number,
      data: Partial<Omit<TestCase, "id">>,
    ): TestPlan => {
      const plan = store.getById(planId);
      if (!plan) throw new Error(`TestPlan ${planId} not found`);

      const updated = store.update(planId, {
        testCases: plan.testCases.map((tc) =>
          tc.id === testCaseId ? { ...tc, ...data } : tc,
        ),
      });
      addToast("success", "Test case updated");
      return updated;
    },
    [store, addToast],
  );

  const removeTestCase = useCallback(
    (planId: number, testCaseId: number): TestPlan => {
      const plan = store.getById(planId);
      if (!plan) throw new Error(`TestPlan ${planId} not found`);

      const updated = store.update(planId, {
        testCases: plan.testCases.filter((tc) => tc.id !== testCaseId),
      });
      addToast("success", "Test case removed");
      return updated;
    },
    [store, addToast],
  );

  const getByProject = useCallback(
    (projectId: number): TestPlan[] => {
      return testPlans.filter((tp) => tp.projectId === projectId);
    },
    [testPlans],
  );

  const create = useCallback(
    (data: Omit<TestPlan, "id" | "createdAt" | "updatedAt">): TestPlan => {
      const created = store.create(data);
      addToast("success", "Test plan created");
      return created;
    },
    [store, addToast],
  );

  const update = useCallback(
    (
      id: number,
      data: Partial<Omit<TestPlan, "id" | "createdAt">>,
    ): TestPlan => {
      const updated = store.update(id, data);
      addToast("success", "Test plan updated");
      return updated;
    },
    [store, addToast],
  );

  const remove = useCallback(
    (id: number): void => {
      store.remove(id);
      addToast("success", "Test plan deleted");
    },
    [store, addToast],
  );

  return {
    testPlans,
    getById: store.getById,
    create,
    update,
    remove,
    addTestCase,
    updateTestCase,
    removeTestCase,
    getByProject,
    refresh: store.refresh,
  };
}
