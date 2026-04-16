import { beforeEach, describe, it, expect, vi } from "vitest";
import {
  getAll,
  getById,
  create,
  update,
  remove,
  reset,
  resetAll,
} from "./store";
import type { User, EntityKey } from "./entities";

const mockStorage = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
});

beforeEach(() => {
  mockStorage.clear();
});

interface TestEntity {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

describe("store", () => {
  describe("getAll", () => {
    it("returns empty array when key does not exist", () => {
      const items = getAll<TestEntity>("tqh_test");
      expect(items).toEqual([]);
    });

    it("returns parsed items when key exists", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const items = getAll<TestEntity>("tqh_test");
      expect(items).toEqual(testData);
    });

    it("returns array with multiple items", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
        { id: 2, name: "Test 2", createdAt: "2025-01-02T00:00:00.000Z" },
        { id: 3, name: "Test 3", createdAt: "2025-01-03T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const items = getAll<TestEntity>("tqh_test");
      expect(items).toHaveLength(3);
      expect(items[0].id).toBe(1);
      expect(items[2].id).toBe(3);
    });
  });

  describe("getById", () => {
    it("returns null when item not found", () => {
      const item = getById<TestEntity>("tqh_test", 1);
      expect(item).toBeNull();
    });

    it("returns item by id", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
        { id: 2, name: "Test 2", createdAt: "2025-01-02T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const item = getById<TestEntity>("tqh_test", 2);
      expect(item).not.toBeNull();
      expect(item?.id).toBe(2);
      expect(item?.name).toBe("Test 2");
    });

    it("returns null for non-existent id", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const item = getById<TestEntity>("tqh_test", 999);
      expect(item).toBeNull();
    });
  });

  describe("create", () => {
    it("adds item to storage", () => {
      const item = create<TestEntity>("tqh_test", {
        name: "Test 1",
      });

      expect(item.id).toBe(1);
      expect(item.name).toBe("Test 1");
      expect(item.createdAt).toBeDefined();
    });

    it("persists item to storage", () => {
      create<TestEntity>("tqh_test", { name: "Test 1" });

      const items = getAll<TestEntity>("tqh_test");
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Test 1");
    });

    it("auto-increments id", () => {
      const item1 = create<TestEntity>("tqh_test", { name: "Test 1" });
      const item2 = create<TestEntity>("tqh_test", { name: "Test 2" });

      expect(item1.id).toBe(1);
      expect(item2.id).toBe(2);
    });

    it("starts id from 1 for empty storage", () => {
      const item = create<TestEntity>("tqh_test", { name: "Test 1" });
      expect(item.id).toBe(1);
    });

    it("continues id from existing max", () => {
      const testData: TestEntity[] = [
        { id: 5, name: "Test", createdAt: "2025-01-01T00:00:00.000Z" },
        { id: 10, name: "Test", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const item = create<TestEntity>("tqh_test", { name: "New" });
      expect(item.id).toBe(11);
    });

    it("sets createdAt timestamp", () => {
      const before = Date.now();
      const item = create<TestEntity>("tqh_test", { name: "Test 1" });
      const after = Date.now();

      const itemTime = new Date(item.createdAt).getTime();
      expect(itemTime).toBeGreaterThanOrEqual(before);
      expect(itemTime).toBeLessThanOrEqual(after);
    });

    it("sets updatedAt timestamp", () => {
      const before = Date.now();
      const item = create<TestEntity>("tqh_test", { name: "Test 1" });
      const after = Date.now();

      const itemTime = new Date(item.updatedAt || "").getTime();
      expect(itemTime).toBeGreaterThanOrEqual(before);
      expect(itemTime).toBeLessThanOrEqual(after);
    });
  });

  describe("update", () => {
    it("updates existing item", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const updated = update<TestEntity>("tqh_test", 1, { name: "Updated" });
      expect(updated.name).toBe("Updated");
    });

    it("persists update to storage", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      update<TestEntity>("tqh_test", 1, { name: "Updated" });

      const items = getAll<TestEntity>("tqh_test");
      expect(items[0].name).toBe("Updated");
    });

    it("throws when entity not found", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      expect(() => {
        update<TestEntity>("tqh_test", 999, { name: "Updated" });
      }).toThrow(/not found/);
    });

    it("updates updatedAt timestamp", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const before = Date.now();
      const updated = update<TestEntity>("tqh_test", 1, { name: "Updated" });
      const after = Date.now();

      const itemTime = new Date(updated.updatedAt || "").getTime();
      expect(itemTime).toBeGreaterThanOrEqual(before);
      expect(itemTime).toBeLessThanOrEqual(after);
    });

    it("preserves createdAt", () => {
      const createdAt = "2025-01-01T00:00:00.000Z";
      const testData: TestEntity[] = [{ id: 1, name: "Test 1", createdAt }];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const updated = update<TestEntity>("tqh_test", 1, { name: "Updated" });
      expect(updated.createdAt).toBe(createdAt);
    });

    it("preserves id", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const updated = update<TestEntity>("tqh_test", 1, { name: "Updated" });
      expect(updated.id).toBe(1);
    });
  });

  describe("remove", () => {
    it("deletes item from storage", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
        { id: 2, name: "Test 2", createdAt: "2025-01-02T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      remove("tqh_test", 1);

      const items = getAll<TestEntity>("tqh_test");
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(2);
    });

    it("works with single item", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      remove("tqh_test", 1);

      const items = getAll<TestEntity>("tqh_test");
      expect(items).toHaveLength(0);
    });

    it("does not throw if id not found", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Test 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      expect(() => {
        remove("tqh_test", 999);
      }).not.toThrow();
    });
  });

  describe("reset", () => {
    it("overwrites existing data with seed data", () => {
      const testData: TestEntity[] = [
        { id: 1, name: "Old 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];
      mockStorage.set("tqh_test", JSON.stringify(testData));

      const seedData: TestEntity[] = [
        { id: 10, name: "Seed 1", createdAt: "2025-01-10T00:00:00.000Z" },
        { id: 20, name: "Seed 2", createdAt: "2025-01-20T00:00:00.000Z" },
      ];

      reset("tqh_test", seedData);

      const items = getAll<TestEntity>("tqh_test");
      expect(items).toHaveLength(2);
      expect(items[0].name).toBe("Seed 1");
    });

    it("initializes empty storage", () => {
      const seedData: TestEntity[] = [
        { id: 1, name: "Seed 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];

      reset("tqh_test", seedData);

      const items = getAll<TestEntity>("tqh_test");
      expect(items).toEqual(seedData);
    });

    it("returns the seed data", () => {
      const seedData: TestEntity[] = [
        { id: 1, name: "Seed 1", createdAt: "2025-01-01T00:00:00.000Z" },
      ];

      const result = reset("tqh_test", seedData);
      expect(result).toEqual(seedData);
    });
  });

  describe("resetAll", () => {
    it("resets all entity keys", () => {
      mockStorage.set("tqh_users", JSON.stringify([{ id: 1 }]));
      mockStorage.set("tqh_projects", JSON.stringify([{ id: 1 }]));
      mockStorage.set("tqh_defects", JSON.stringify([{ id: 1 }]));
      mockStorage.set("tqh_test_plans", JSON.stringify([{ id: 1 }]));
      mockStorage.set("tqh_test_runs", JSON.stringify([{ id: 1 }]));

      resetAll();

      // Should have valid seed data in each key
      const users = getAll("tqh_users");
      const projects = getAll("tqh_projects");
      const defects = getAll("tqh_defects");
      const testPlans = getAll("tqh_test_plans");
      const testRuns = getAll("tqh_test_runs");

      expect(users.length).toBeGreaterThan(0);
      expect(projects.length).toBeGreaterThan(0);
      expect(defects.length).toBeGreaterThan(0);
      expect(testPlans.length).toBeGreaterThan(0);
      expect(testRuns.length).toBeGreaterThan(0);
    });
  });

  describe("CRUD round-trip", () => {
    it("create → getById → update → getAll shows updated item", () => {
      const created = create<TestEntity>("tqh_test", { name: "Test 1" });
      expect(created.id).toBe(1);

      const retrieved = getById<TestEntity>("tqh_test", created.id);
      expect(retrieved?.name).toBe("Test 1");

      const updated = update<TestEntity>("tqh_test", created.id, {
        name: "Updated",
      });
      expect(updated.name).toBe("Updated");

      const all = getAll<TestEntity>("tqh_test");
      expect(all).toHaveLength(1);
      expect(all[0].name).toBe("Updated");
    });

    it("multiple create, update, remove operations", () => {
      const item1 = create<TestEntity>("tqh_test", { name: "Item 1" });
      const item2 = create<TestEntity>("tqh_test", { name: "Item 2" });
      const item3 = create<TestEntity>("tqh_test", { name: "Item 3" });

      expect([item1.id, item2.id, item3.id]).toEqual([1, 2, 3]);

      update<TestEntity>("tqh_test", 2, { name: "Item 2 Updated" });
      remove("tqh_test", 1);

      const all = getAll<TestEntity>("tqh_test");
      expect(all).toHaveLength(2);
      expect(all[0].id).toBe(2);
      expect(all[0].name).toBe("Item 2 Updated");
      expect(all[1].id).toBe(3);
    });
  });
});
