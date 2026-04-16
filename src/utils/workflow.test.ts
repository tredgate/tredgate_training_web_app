import { describe, it, expect } from "vitest";
import {
  getAvailableTransitions,
  executeTransition,
  type AvailableTransition,
  type TransitionAction,
} from "./workflow";
import type { Defect, Role, DefectStatus } from "../data/entities";

const createMockDefect = (
  status: DefectStatus = "new",
  assigneeId: number | null = null,
): Defect => ({
  id: 1,
  projectId: 1,
  title: "Test defect",
  description: "Test",
  stepsToReproduce: "Test",
  severity: "critical",
  priority: "P1",
  status,
  reporterId: 1,
  assigneeId,
  environmentId: null,
  relatedTestCaseIds: [],
  comments: [],
  history: [],
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
});

describe("workflow", () => {
  describe("getAvailableTransitions", () => {
    it("returns assign for new status with qa_lead role", () => {
      const transitions = getAvailableTransitions("new", "qa_lead");
      expect(transitions).toContainEqual(
        expect.objectContaining({
          action: "assign",
          targetStatus: "assigned",
        }),
      );
    });

    it("returns assign for new status with admin role", () => {
      const transitions = getAvailableTransitions("new", "admin");
      expect(transitions).toContainEqual(
        expect.objectContaining({
          action: "assign",
          targetStatus: "assigned",
        }),
      );
    });

    it("returns empty array for new status with tester role", () => {
      const transitions = getAvailableTransitions("new", "tester");
      expect(transitions).toHaveLength(0);
    });

    it("returns start for assigned status with tester role", () => {
      const transitions = getAvailableTransitions("assigned", "tester");
      expect(transitions).toContainEqual(
        expect.objectContaining({
          action: "start",
          targetStatus: "in_progress",
        }),
      );
    });

    it("returns reassign and reject for assigned status with qa_lead", () => {
      const transitions = getAvailableTransitions("assigned", "qa_lead");
      const actions = transitions.map((t) => t.action);
      expect(actions).toContain("start");
      expect(actions).toContain("reject");
    });

    it("returns resolve for in_progress status with tester role", () => {
      const transitions = getAvailableTransitions("in_progress", "tester");
      expect(transitions).toContainEqual(
        expect.objectContaining({
          action: "resolve",
          targetStatus: "resolved",
        }),
      );
    });

    it("returns verify for resolved status with qa_lead", () => {
      const transitions = getAvailableTransitions("resolved", "qa_lead");
      const actions = transitions.map((t) => t.action);
      expect(actions).toContain("verify");
    });

    it("returns verify for resolved status with tester", () => {
      const transitions = getAvailableTransitions("resolved", "tester");
      const actions = transitions.map((t) => t.action);
      expect(actions).toContain("verify");
    });

    it("returns close for verified status with qa_lead", () => {
      const transitions = getAvailableTransitions("verified", "qa_lead");
      expect(transitions).toContainEqual(
        expect.objectContaining({
          action: "close",
          targetStatus: "closed",
        }),
      );
    });

    it("returns close for verified status with admin", () => {
      const transitions = getAvailableTransitions("verified", "admin");
      expect(transitions).toContainEqual(
        expect.objectContaining({
          action: "close",
          targetStatus: "closed",
        }),
      );
    });

    it("returns start for rejected status with tester role", () => {
      const transitions = getAvailableTransitions("rejected", "tester");
      expect(transitions).toContainEqual(
        expect.objectContaining({
          action: "reopen",
          targetStatus: "new",
        }),
      );
    });

    it("returns empty array for closed status with qa_lead", () => {
      const transitions = getAvailableTransitions("closed", "qa_lead");
      expect(transitions).toHaveLength(0);
    });

    it("returns empty array for closed status with admin", () => {
      const transitions = getAvailableTransitions("closed", "admin");
      expect(transitions).toHaveLength(0);
    });

    it("returns reopen from rejected with all roles", () => {
      const roles: Role[] = ["tester", "qa_lead", "admin"];
      for (const role of roles) {
        const transitions = getAvailableTransitions("rejected", role);
        expect(transitions.map((t) => t.action)).toContain("reopen");
      }
    });

    it("returns verify from resolved with tester role", () => {
      const transitions = getAvailableTransitions("resolved", "tester");
      expect(transitions.map((t) => t.action)).toContain("verify");
    });

    it("returns reopen from verified with tester role", () => {
      const transitions = getAvailableTransitions("verified", "tester");
      expect(transitions.map((t) => t.action)).toContain("reopen");
    });
  });

  describe("executeTransition", () => {
    it("updates defect status correctly", () => {
      const defect = createMockDefect("new");
      const updated = executeTransition(defect, "assign", 1);
      expect(updated.status).toBe("assigned");
    });

    it("preserves defect properties other than status", () => {
      const defect = createMockDefect("new");
      const updated = executeTransition(defect, "assign", 1);
      expect(updated.id).toBe(defect.id);
      expect(updated.title).toBe(defect.title);
      expect(updated.projectId).toBe(defect.projectId);
    });

    it("appends to history", () => {
      const defect = createMockDefect("new", null);
      const updated = executeTransition(defect, "assign", 1);
      expect(updated.history.length).toBe(defect.history.length + 1);
    });

    it("history entry has correct properties", () => {
      const defect = createMockDefect("new", null);
      const updated = executeTransition(defect, "assign", 1);
      const newEntry = updated.history[updated.history.length - 1];
      expect(newEntry.userId).toBe(1);
      expect(newEntry.action).toBe("Assign");
      expect(newEntry.fromStatus).toBe("new");
      expect(newEntry.toStatus).toBe("assigned");
    });

    it("updates timestamp", () => {
      const defect = createMockDefect("new", null);
      const originalTime = defect.updatedAt;
      const updated = executeTransition(defect, "assign", 1);
      expect(updated.updatedAt).not.toBe(originalTime);
    });

    it("history entries have unique IDs", () => {
      const defect = createMockDefect("new", null);
      const step1 = executeTransition(defect, "assign", 1);
      const step2 = executeTransition(step1, "start", 2);

      const ids = step2.history.map((e) => e.id);
      expect(ids).toHaveLength(new Set(ids).size);
    });

    it("throws on invalid transition", () => {
      const defect = createMockDefect("new");
      expect(() => {
        executeTransition(defect, "resolve", 1);
      }).toThrow(/Invalid transition/);
    });

    it("throws with descriptive message", () => {
      const defect = createMockDefect("verified");
      expect(() => {
        executeTransition(defect, "assign", 1);
      }).toThrow(/cannot "assign"/);
    });

    it("allows resolve from in_progress", () => {
      const defect = createMockDefect("in_progress", 1);
      const updated = executeTransition(defect, "resolve", 1);
      expect(updated.status).toBe("resolved");
    });

    it("allows verify from resolved", () => {
      const defect = createMockDefect("resolved", 1);
      const updated = executeTransition(defect, "verify", 1);
      expect(updated.status).toBe("verified");
    });

    it("allows close from verified", () => {
      const defect = createMockDefect("verified", 1);
      const updated = executeTransition(defect, "close", 1);
      expect(updated.status).toBe("closed");
    });

    it("cannot reopen from closed", () => {
      const defect = createMockDefect("closed", 1);
      expect(() => {
        executeTransition(defect, "reopen", 1);
      }).toThrow();
    });

    it("allows reopen from rejected", () => {
      const defect = createMockDefect("rejected", 1);
      const updated = executeTransition(defect, "reopen", 1);
      expect(updated.status).toBe("new");
    });

    it("cannot transition from closed to new directly", () => {
      const defect = createMockDefect("closed", 1);
      expect(() => {
        executeTransition(defect, "assign", 1);
      }).toThrow();
    });

    it("cannot transition from new to resolved directly", () => {
      const defect = createMockDefect("new");
      expect(() => {
        executeTransition(defect, "resolve", 1);
      }).toThrow();
    });

    it("cannot transition from new to in_progress directly", () => {
      const defect = createMockDefect("new");
      expect(() => {
        executeTransition(defect, "start", 1);
      }).toThrow();
    });

    it("cannot transition from in_progress to closed directly", () => {
      const defect = createMockDefect("in_progress", 1);
      expect(() => {
        executeTransition(defect, "close", 1);
      }).toThrow();
    });
  });
});
