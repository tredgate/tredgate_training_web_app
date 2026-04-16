import { describe, it, expect } from "vitest";
import { hasPermission, type PermissionKey } from "./permissions";
import type { Role } from "../data/entities";

describe("permissions", () => {
  describe("defect:create", () => {
    it("allows tester to create defects", () => {
      expect(hasPermission("tester", "defect:create")).toBe(true);
    });

    it("allows qa_lead to create defects", () => {
      expect(hasPermission("qa_lead", "defect:create")).toBe(true);
    });

    it("allows admin to create defects", () => {
      expect(hasPermission("admin", "defect:create")).toBe(true);
    });
  });

  describe("defect:assign", () => {
    it("denies tester from assigning", () => {
      expect(hasPermission("tester", "defect:assign")).toBe(false);
    });

    it("allows qa_lead to assign defects", () => {
      expect(hasPermission("qa_lead", "defect:assign")).toBe(true);
    });

    it("allows admin to assign defects", () => {
      expect(hasPermission("admin", "defect:assign")).toBe(true);
    });
  });

  describe("defect:transition", () => {
    it("denies tester transition from new status", () => {
      expect(hasPermission("tester", "defect:transition", "new")).toBe(false);
    });

    it("allows qa_lead transition from new status", () => {
      expect(hasPermission("qa_lead", "defect:transition", "new")).toBe(true);
    });

    it("allows admin transition from new status", () => {
      expect(hasPermission("admin", "defect:transition", "new")).toBe(true);
    });

    it("allows qa_lead transition from verified status", () => {
      expect(hasPermission("qa_lead", "defect:transition", "verified")).toBe(
        true,
      );
    });

    it("allows admin transition from verified status", () => {
      expect(hasPermission("admin", "defect:transition", "verified")).toBe(
        true,
      );
    });

    it("allows tester transition from assigned status", () => {
      expect(hasPermission("tester", "defect:transition", "assigned")).toBe(
        true,
      );
    });

    it("allows tester transition from in_progress status", () => {
      expect(hasPermission("tester", "defect:transition", "in_progress")).toBe(
        true,
      );
    });

    it("allows tester transition from resolved status", () => {
      expect(hasPermission("tester", "defect:transition", "resolved")).toBe(
        true,
      );
    });

    it("allows qa_lead transition from defined statuses", () => {
      const statuses = [
        "new" as const,
        "assigned" as const,
        "in_progress" as const,
        "resolved" as const,
        "verified" as const,
        "rejected" as const,
      ];
      for (const status of statuses) {
        expect(hasPermission("qa_lead", "defect:transition", status)).toBe(
          true,
        );
      }
    });

    it("allows admin transition from defined statuses", () => {
      const statuses = [
        "new" as const,
        "assigned" as const,
        "in_progress" as const,
        "resolved" as const,
        "verified" as const,
      ];
      for (const status of statuses) {
        expect(hasPermission("admin", "defect:transition", status)).toBe(true);
      }
    });

    it("returns false when no status context provided", () => {
      expect(hasPermission("tester", "defect:transition")).toBe(false);
      expect(hasPermission("qa_lead", "defect:transition")).toBe(false);
      expect(hasPermission("admin", "defect:transition")).toBe(false);
    });
  });

  describe("project:create", () => {
    it("denies tester from creating projects", () => {
      expect(hasPermission("tester", "project:create")).toBe(false);
    });

    it("allows qa_lead to create projects", () => {
      expect(hasPermission("qa_lead", "project:create")).toBe(true);
    });

    it("allows admin to create projects", () => {
      expect(hasPermission("admin", "project:create")).toBe(true);
    });
  });

  describe("project:edit", () => {
    it("denies tester from editing projects", () => {
      expect(hasPermission("tester", "project:edit")).toBe(false);
    });

    it("allows qa_lead to edit projects", () => {
      expect(hasPermission("qa_lead", "project:edit")).toBe(true);
    });

    it("allows admin to edit projects", () => {
      expect(hasPermission("admin", "project:edit")).toBe(true);
    });
  });

  describe("project:delete", () => {
    it("denies tester from deleting projects", () => {
      expect(hasPermission("tester", "project:delete")).toBe(false);
    });

    it("denies qa_lead from deleting projects", () => {
      expect(hasPermission("qa_lead", "project:delete")).toBe(false);
    });

    it("allows admin to delete projects", () => {
      expect(hasPermission("admin", "project:delete")).toBe(true);
    });
  });

  describe("testplan:create", () => {
    it("denies tester from creating test plans", () => {
      expect(hasPermission("tester", "testplan:create")).toBe(false);
    });

    it("allows qa_lead to create test plans", () => {
      expect(hasPermission("qa_lead", "testplan:create")).toBe(true);
    });

    it("allows admin to create test plans", () => {
      expect(hasPermission("admin", "testplan:create")).toBe(true);
    });
  });

  describe("testplan:execute", () => {
    it("allows tester to execute test plans", () => {
      expect(hasPermission("tester", "testplan:execute")).toBe(true);
    });

    it("allows qa_lead to execute test plans", () => {
      expect(hasPermission("qa_lead", "testplan:execute")).toBe(true);
    });

    it("allows admin to execute test plans", () => {
      expect(hasPermission("admin", "testplan:execute")).toBe(true);
    });
  });

  describe("user:manage", () => {
    it("denies tester from managing users", () => {
      expect(hasPermission("tester", "user:manage")).toBe(false);
    });

    it("denies qa_lead from managing users", () => {
      expect(hasPermission("qa_lead", "user:manage")).toBe(false);
    });

    it("allows admin to manage users", () => {
      expect(hasPermission("admin", "user:manage")).toBe(true);
    });
  });

  describe("settings:manage", () => {
    it("denies tester from managing settings", () => {
      expect(hasPermission("tester", "settings:manage")).toBe(false);
    });

    it("denies qa_lead from managing settings", () => {
      expect(hasPermission("qa_lead", "settings:manage")).toBe(false);
    });

    it("allows admin to manage settings", () => {
      expect(hasPermission("admin", "settings:manage")).toBe(true);
    });
  });

  describe("reports:view", () => {
    it("denies tester from viewing reports", () => {
      expect(hasPermission("tester", "reports:view")).toBe(false);
    });

    it("allows qa_lead to view reports", () => {
      expect(hasPermission("qa_lead", "reports:view")).toBe(true);
    });

    it("allows admin to view reports", () => {
      expect(hasPermission("admin", "reports:view")).toBe(true);
    });
  });

  describe("all permissions", () => {
    it("admin has all base permissions", () => {
      const permissions: PermissionKey[] = [
        "defect:create",
        "defect:assign",
        "project:create",
        "project:edit",
        "project:delete",
        "testplan:create",
        "testplan:execute",
        "user:manage",
        "settings:manage",
        "reports:view",
      ];

      for (const permission of permissions) {
        expect(hasPermission("admin", permission)).toBe(true);
      }
    });

    it("tester has limited permissions", () => {
      const allowed: PermissionKey[] = ["defect:create", "testplan:execute"];
      const denied: PermissionKey[] = [
        "defect:assign",
        "project:create",
        "project:edit",
        "project:delete",
        "testplan:create",
        "user:manage",
        "settings:manage",
        "reports:view",
      ];

      for (const permission of allowed) {
        expect(hasPermission("tester", permission)).toBe(true);
      }

      for (const permission of denied) {
        expect(hasPermission("tester", permission)).toBe(false);
      }
    });
  });
});
