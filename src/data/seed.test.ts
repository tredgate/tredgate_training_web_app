import { describe, it, expect } from "vitest";
import {
  SEED_USERS,
  SEED_PROJECTS,
  SEED_DEFECTS,
  SEED_TEST_PLANS,
  SEED_TEST_RUNS,
  initializeSeedData,
} from "./seed";
import type {
  User,
  Project,
  Defect,
  TestPlan,
  TestRun,
  Role,
  DefectStatus,
} from "./entities";

describe("seed", () => {
  describe("SEED_USERS", () => {
    it("has required fields for each user", () => {
      for (const user of SEED_USERS) {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("password");
        expect(user).toHaveProperty("role");
        expect(user).toHaveProperty("fullName");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("avatarColor");
        expect(user).toHaveProperty("projectIds");
        expect(user).toHaveProperty("createdAt");
      }
    });

    it("has at least 3 users", () => {
      expect(SEED_USERS.length).toBeGreaterThanOrEqual(3);
    });

    it("has one user per role", () => {
      const roles = SEED_USERS.map((u) => u.role);
      expect(roles).toContain("tester");
      expect(roles).toContain("qa_lead");
      expect(roles).toContain("admin");
    });

    it("has unique IDs", () => {
      const ids = SEED_USERS.map((u) => u.id);
      expect(ids).toHaveLength(new Set(ids).size);
    });

    it("has valid credentials for tester", () => {
      const tester = SEED_USERS.find((u) => u.role === "tester");
      expect(tester).toBeDefined();
      expect(tester?.username).toBe("tester");
      expect(tester?.password).toBe("test123");
    });

    it("has valid credentials for qa_lead", () => {
      const lead = SEED_USERS.find((u) => u.role === "qa_lead");
      expect(lead).toBeDefined();
      expect(lead?.username).toBe("lead");
      expect(lead?.password).toBe("lead123");
    });

    it("has valid credentials for admin", () => {
      const admin = SEED_USERS.find((u) => u.role === "admin");
      expect(admin).toBeDefined();
      expect(admin?.username).toBe("admin");
      expect(admin?.password).toBe("admin123");
    });


  });

  describe("SEED_PROJECTS", () => {
    it("has required fields for each project", () => {
      for (const project of SEED_PROJECTS) {
        expect(project).toHaveProperty("id");
        expect(project).toHaveProperty("name");
        expect(project).toHaveProperty("code");
        expect(project).toHaveProperty("status");
        expect(project).toHaveProperty("leadId");
        expect(project).toHaveProperty("memberIds");
        expect(project).toHaveProperty("environments");
        expect(project).toHaveProperty("createdAt");
        expect(project).toHaveProperty("updatedAt");
      }
    });

    it("has at least 2 projects", () => {
      expect(SEED_PROJECTS.length).toBeGreaterThanOrEqual(2);
    });

    it("has unique IDs", () => {
      const ids = SEED_PROJECTS.map((p) => p.id);
      expect(ids).toHaveLength(new Set(ids).size);
    });

    it("all lead IDs reference existing users", () => {
      const userIds = SEED_USERS.map((u) => u.id);
      for (const project of SEED_PROJECTS) {
        expect(userIds).toContain(project.leadId);
      }
    });

    it("all member IDs reference existing users", () => {
      const userIds = SEED_USERS.map((u) => u.id);
      for (const project of SEED_PROJECTS) {
        for (const memberId of project.memberIds) {
          expect(userIds).toContain(memberId);
        }
      }
    });

    it("lead has qa_lead or admin role", () => {
      for (const project of SEED_PROJECTS) {
        const lead = SEED_USERS.find((u) => u.id === project.leadId);
        expect(lead?.role).toMatch(/qa_lead|admin/);
      }
    });

    it("all projects have at least one member", () => {
      for (const project of SEED_PROJECTS) {
        expect(project.memberIds.length).toBeGreaterThan(0);
      }
    });
  });

  describe("SEED_DEFECTS", () => {
    it("has required fields for each defect", () => {
      for (const defect of SEED_DEFECTS) {
        expect(defect).toHaveProperty("id");
        expect(defect).toHaveProperty("projectId");
        expect(defect).toHaveProperty("title");
        expect(defect).toHaveProperty("description");
        expect(defect).toHaveProperty("stepsToReproduce");
        expect(defect).toHaveProperty("severity");
        expect(defect).toHaveProperty("priority");
        expect(defect).toHaveProperty("status");
        expect(defect).toHaveProperty("reporterId");
        expect(defect).toHaveProperty("comments");
        expect(defect).toHaveProperty("history");
        expect(defect).toHaveProperty("createdAt");
        expect(defect).toHaveProperty("updatedAt");
      }
    });

    it("has at least 5 defects", () => {
      expect(SEED_DEFECTS.length).toBeGreaterThanOrEqual(5);
    });

    it("has unique IDs", () => {
      const ids = SEED_DEFECTS.map((d) => d.id);
      expect(ids).toHaveLength(new Set(ids).size);
    });

    it("all projectIds reference existing projects", () => {
      const projectIds = SEED_PROJECTS.map((p) => p.id);
      for (const defect of SEED_DEFECTS) {
        expect(projectIds).toContain(defect.projectId);
      }
    });

    it("all reporterIds reference existing users", () => {
      const userIds = SEED_USERS.map((u) => u.id);
      for (const defect of SEED_DEFECTS) {
        expect(userIds).toContain(defect.reporterId);
      }
    });

    it("all assigneeIds reference existing users or are null", () => {
      const userIds = SEED_USERS.map((u) => u.id);
      for (const defect of SEED_DEFECTS) {
        if (defect.assigneeId !== null) {
          expect(userIds).toContain(defect.assigneeId);
        }
      }
    });

    it("defects span multiple statuses", () => {
      const statuses = new Set(SEED_DEFECTS.map((d) => d.status));
      expect(statuses.size).toBeGreaterThan(1);
    });

    it("includes defects in all required states", () => {
      const statuses = SEED_DEFECTS.map((d) => d.status);
      expect(statuses).toContain("new");
      expect(statuses).toContain("assigned");
      expect(statuses).toContain("in_progress");
      expect(statuses).toContain("resolved");
      expect(statuses).toContain("verified");
      expect(statuses).toContain("closed");
      expect(statuses).toContain("rejected");
    });

    it("all comments reference existing users", () => {
      const userIds = SEED_USERS.map((u) => u.id);
      for (const defect of SEED_DEFECTS) {
        for (const comment of defect.comments) {
          expect(userIds).toContain(comment.userId);
        }
      }
    });

    it("all history entries reference existing users", () => {
      const userIds = SEED_USERS.map((u) => u.id);
      for (const defect of SEED_DEFECTS) {
        for (const entry of defect.history) {
          expect(userIds).toContain(entry.userId);
        }
      }
    });
  });

  describe("SEED_TEST_PLANS", () => {
    it("has required fields for each test plan", () => {
      for (const plan of SEED_TEST_PLANS) {
        expect(plan).toHaveProperty("id");
        expect(plan).toHaveProperty("projectId");
        expect(plan).toHaveProperty("name");
        expect(plan).toHaveProperty("description");
        expect(plan).toHaveProperty("status");
        expect(plan).toHaveProperty("createdById");
        expect(plan).toHaveProperty("testCases");
        expect(plan).toHaveProperty("createdAt");
        expect(plan).toHaveProperty("updatedAt");
      }
    });

    it("has at least 2 test plans", () => {
      expect(SEED_TEST_PLANS.length).toBeGreaterThanOrEqual(2);
    });

    it("has unique IDs", () => {
      const ids = SEED_TEST_PLANS.map((tp) => tp.id);
      expect(ids).toHaveLength(new Set(ids).size);
    });

    it("all projectIds reference existing projects", () => {
      const projectIds = SEED_PROJECTS.map((p) => p.id);
      for (const plan of SEED_TEST_PLANS) {
        expect(projectIds).toContain(plan.projectId);
      }
    });

    it("all createdByIds reference existing users", () => {
      const userIds = SEED_USERS.map((u) => u.id);
      for (const plan of SEED_TEST_PLANS) {
        expect(userIds).toContain(plan.createdById);
      }
    });

    it("all assigneeIds reference existing users or are null", () => {
      const userIds = SEED_USERS.map((u) => u.id);
      for (const plan of SEED_TEST_PLANS) {
        if (plan.assigneeId !== null) {
          expect(userIds).toContain(plan.assigneeId);
        }
      }
    });

    it("all test plans have non-empty test case arrays", () => {
      for (const plan of SEED_TEST_PLANS) {
        expect(plan.testCases.length).toBeGreaterThan(0);
      }
    });

    it("all test cases have required fields", () => {
      for (const plan of SEED_TEST_PLANS) {
        for (const testCase of plan.testCases) {
          expect(testCase).toHaveProperty("id");
          expect(testCase).toHaveProperty("name");
          expect(testCase).toHaveProperty("description");
          expect(testCase).toHaveProperty("preconditions");
          expect(testCase).toHaveProperty("steps");
          expect(testCase).toHaveProperty("priority");
        }
      }
    });

    it("all test cases have non-empty step arrays", () => {
      for (const plan of SEED_TEST_PLANS) {
        for (const testCase of plan.testCases) {
          expect(testCase.steps.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("SEED_TEST_RUNS", () => {
    it("has required fields for each test run", () => {
      for (const run of SEED_TEST_RUNS) {
        expect(run).toHaveProperty("id");
        expect(run).toHaveProperty("testPlanId");
        expect(run).toHaveProperty("executorId");
        expect(run).toHaveProperty("status");
        expect(run).toHaveProperty("results");
        expect(run).toHaveProperty("startedAt");
        expect(run).toHaveProperty("completedAt");
      }
    });

    it("has at least 1 test run", () => {
      expect(SEED_TEST_RUNS.length).toBeGreaterThanOrEqual(1);
    });

    it("has unique IDs", () => {
      const ids = SEED_TEST_RUNS.map((tr) => tr.id);
      expect(ids).toHaveLength(new Set(ids).size);
    });

    it("all testPlanIds reference existing test plans", () => {
      const testPlanIds = SEED_TEST_PLANS.map((tp) => tp.id);
      for (const run of SEED_TEST_RUNS) {
        expect(testPlanIds).toContain(run.testPlanId);
      }
    });

    it("all executorIds reference existing users", () => {
      const userIds = SEED_USERS.map((u) => u.id);
      for (const run of SEED_TEST_RUNS) {
        expect(userIds).toContain(run.executorId);
      }
    });

    it("all results reference existing test cases", () => {
      for (const run of SEED_TEST_RUNS) {
        const testPlan = SEED_TEST_PLANS.find((tp) => tp.id === run.testPlanId);
        const testCaseIds = testPlan?.testCases.map((tc) => tc.id) ?? [];

        for (const result of run.results) {
          expect(testCaseIds).toContain(result.testCaseId);
        }
      }
    });
  });

  describe("initializeSeedData", () => {
    let mockStorage: Map<string, string>;

    beforeEach(() => {
      mockStorage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem: (key: string) => mockStorage.get(key) ?? null,
        setItem: (key: string, val: string) => mockStorage.set(key, val),
        removeItem: (key: string) => mockStorage.delete(key),
        clear: () => mockStorage.clear(),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("populates localStorage on first call", () => {
      initializeSeedData();

      expect(mockStorage.has("tqh_users")).toBe(true);
      expect(mockStorage.has("tqh_projects")).toBe(true);
      expect(mockStorage.has("tqh_defects")).toBe(true);
      expect(mockStorage.has("tqh_test_plans")).toBe(true);
      expect(mockStorage.has("tqh_test_runs")).toBe(true);
    });

    it("does not overwrite existing data on second call", () => {
      const customData = JSON.stringify([{ id: 999, name: "Custom" }]);
      mockStorage.set("tqh_users", customData);

      initializeSeedData();

      expect(mockStorage.get("tqh_users")).toBe(customData);
    });

    it("initializes all empty keys on first call", () => {
      initializeSeedData();

      const users = JSON.parse(mockStorage.get("tqh_users") || "[]");
      const projects = JSON.parse(mockStorage.get("tqh_projects") || "[]");
      const defects = JSON.parse(mockStorage.get("tqh_defects") || "[]");
      const testPlans = JSON.parse(mockStorage.get("tqh_test_plans") || "[]");
      const testRuns = JSON.parse(mockStorage.get("tqh_test_runs") || "[]");

      expect(users.length).toBeGreaterThan(0);
      expect(projects.length).toBeGreaterThan(0);
      expect(defects.length).toBeGreaterThan(0);
      expect(testPlans.length).toBeGreaterThan(0);
      expect(testRuns.length).toBeGreaterThan(0);
    });
  });
});

// Helper to import afterEach
import { afterEach, beforeEach, vi } from "vitest";
