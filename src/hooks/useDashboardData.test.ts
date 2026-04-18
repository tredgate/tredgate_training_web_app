import { describe, it, expect } from "vitest";
import { getScope, computePassRate } from "./useDashboardData";
import type { AuthUser } from "../contexts/AuthContext";
import type { Defect, Project, TestPlan, TestRun } from "../data/entities";

// ─── Minimal factory helpers ─────────────────────────────────────────────

function makeUser(overrides: Partial<AuthUser> & { id: number }): AuthUser {
  return {
    username: "user",
    role: "tester",
    fullName: "Test User",
    email: "test@example.com",
    ...overrides,
  };
}

function makeProject(
  overrides: Partial<Project> & { id: number },
): Project {
  return {
    name: "Project",
    code: "PRJ",
    description: "",
    status: "active",
    leadId: 0,
    memberIds: [],
    environments: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeDefect(
  overrides: Partial<Defect> & { id: number; projectId: number },
): Defect {
  return {
    title: "Defect",
    description: "",
    stepsToReproduce: "",
    severity: "major",
    priority: "P2",
    status: "new",
    reporterId: 0,
    assigneeId: null,
    environmentId: null,
    relatedTestCaseIds: [],
    comments: [],
    history: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeTestPlan(
  overrides: Partial<TestPlan> & { id: number; projectId: number },
): TestPlan {
  return {
    name: "Plan",
    description: "",
    status: "active",
    createdById: 0,
    assigneeId: null,
    testCases: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeTestRun(
  overrides: Partial<TestRun> & { id: number; testPlanId: number },
): TestRun {
  return {
    executorId: 0,
    status: "completed",
    results: [],
    startedAt: "2025-01-01T00:00:00Z",
    completedAt: "2025-01-01T01:00:00Z",
    ...overrides,
  };
}

// ─── getScope ────────────────────────────────────────────────────────────

describe("getScope", () => {
  describe("tester", () => {
    const user = makeUser({ id: 10, role: "tester" });
    const projects = [makeProject({ id: 1, leadId: 99 })];
    const scope = getScope(user, projects);

    it("defectInScope returns true only when reporterId matches", () => {
      expect(
        scope.defectInScope(makeDefect({ id: 1, projectId: 1, reporterId: 10 })),
      ).toBe(true);
      expect(
        scope.defectInScope(makeDefect({ id: 2, projectId: 1, reporterId: 99 })),
      ).toBe(false);
    });

    it("planInScope returns true only when assigneeId matches", () => {
      expect(
        scope.planInScope(makeTestPlan({ id: 1, projectId: 1, assigneeId: 10 })),
      ).toBe(true);
      expect(
        scope.planInScope(makeTestPlan({ id: 2, projectId: 1, assigneeId: 99 })),
      ).toBe(false);
    });

    it("runInScope returns true only when executorId matches", () => {
      const plans = [makeTestPlan({ id: 1, projectId: 1 })];
      expect(
        scope.runInScope(makeTestRun({ id: 1, testPlanId: 1, executorId: 10 }), plans),
      ).toBe(true);
      expect(
        scope.runInScope(makeTestRun({ id: 2, testPlanId: 1, executorId: 99 }), plans),
      ).toBe(false);
    });
  });

  describe("qa_lead", () => {
    const user = makeUser({ id: 20, role: "qa_lead" });
    const projects = [
      makeProject({ id: 1, leadId: 20, memberIds: [] }),
      makeProject({ id: 2, leadId: 99, memberIds: [20] }),
      makeProject({ id: 3, leadId: 99, memberIds: [] }),
    ];
    const scope = getScope(user, projects);

    it("defectInScope returns true for defects in user's projects", () => {
      expect(
        scope.defectInScope(makeDefect({ id: 1, projectId: 1 })),
      ).toBe(true);
      expect(
        scope.defectInScope(makeDefect({ id: 2, projectId: 2 })),
      ).toBe(true);
      expect(
        scope.defectInScope(makeDefect({ id: 3, projectId: 3 })),
      ).toBe(false);
    });

    it("planInScope returns true for plans in user's projects", () => {
      expect(
        scope.planInScope(makeTestPlan({ id: 1, projectId: 1 })),
      ).toBe(true);
      expect(
        scope.planInScope(makeTestPlan({ id: 2, projectId: 3 })),
      ).toBe(false);
    });

    it("runInScope returns true for runs whose plan is in user's projects", () => {
      const plans = [
        makeTestPlan({ id: 10, projectId: 1 }),
        makeTestPlan({ id: 11, projectId: 3 }),
      ];
      expect(
        scope.runInScope(makeTestRun({ id: 1, testPlanId: 10 }), plans),
      ).toBe(true);
      expect(
        scope.runInScope(makeTestRun({ id: 2, testPlanId: 11 }), plans),
      ).toBe(false);
    });
  });

  describe("admin", () => {
    const user = makeUser({ id: 30, role: "admin" });
    const projects: Project[] = [];
    const scope = getScope(user, projects);

    it("all predicates return true for everything", () => {
      expect(
        scope.defectInScope(makeDefect({ id: 1, projectId: 99, reporterId: 1 })),
      ).toBe(true);
      expect(
        scope.planInScope(makeTestPlan({ id: 1, projectId: 99 })),
      ).toBe(true);
      expect(
        scope.runInScope(makeTestRun({ id: 1, testPlanId: 99 }), []),
      ).toBe(true);
    });
  });
});

// ─── computePassRate ─────────────────────────────────────────────────────

describe("computePassRate", () => {
  it("returns 0 for empty runs", () => {
    expect(computePassRate([])).toBe(0);
  });

  it("returns 0 when runs have no results", () => {
    expect(
      computePassRate([makeTestRun({ id: 1, testPlanId: 1, results: [] })]),
    ).toBe(0);
  });

  it("returns 100 when all passed", () => {
    const run = makeTestRun({
      id: 1,
      testPlanId: 1,
      results: [
        { testCaseId: 1, status: "passed", notes: "", duration: null },
        { testCaseId: 2, status: "passed", notes: "", duration: null },
      ],
    });
    expect(computePassRate([run])).toBe(100);
  });

  it("rounds correctly with mixed pass/fail", () => {
    const run = makeTestRun({
      id: 1,
      testPlanId: 1,
      results: [
        { testCaseId: 1, status: "passed", notes: "", duration: null },
        { testCaseId: 2, status: "failed", notes: "", duration: null },
        { testCaseId: 3, status: "passed", notes: "", duration: null },
      ],
    });
    // 2/3 = 66.666... rounds to 67
    expect(computePassRate([run])).toBe(67);
  });

  it("aggregates across multiple runs", () => {
    const run1 = makeTestRun({
      id: 1,
      testPlanId: 1,
      results: [
        { testCaseId: 1, status: "passed", notes: "", duration: null },
      ],
    });
    const run2 = makeTestRun({
      id: 2,
      testPlanId: 1,
      results: [
        { testCaseId: 2, status: "failed", notes: "", duration: null },
      ],
    });
    expect(computePassRate([run1, run2])).toBe(50);
  });
});
