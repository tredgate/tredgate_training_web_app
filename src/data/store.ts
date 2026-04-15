import type { EntityKey } from "./entities";
import {
  SEED_USERS,
  SEED_PROJECTS,
  SEED_DEFECTS,
  SEED_TEST_PLANS,
  SEED_TEST_RUNS,
} from "./seed";

interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt?: string;
}

export function getAll<T extends BaseEntity>(key: EntityKey): T[] {
  const raw = localStorage.getItem(key);
  if (raw === null) return [];
  return JSON.parse(raw) as T[];
}

export function getById<T extends BaseEntity>(
  key: EntityKey,
  id: number,
): T | null {
  const items = getAll<T>(key);
  return items.find((item) => item.id === id) ?? null;
}

export function create<T extends BaseEntity>(
  key: EntityKey,
  data: Omit<T, "id" | "createdAt" | "updatedAt">,
): T {
  const items = getAll<T>(key);
  const maxId = items.reduce((max, item) => Math.max(max, item.id), 0);
  const now = new Date().toISOString();
  const newItem = {
    ...data,
    id: maxId + 1,
    createdAt: now,
    updatedAt: now,
  } as T;
  items.push(newItem);
  localStorage.setItem(key, JSON.stringify(items));
  return newItem;
}

export function update<T extends BaseEntity>(
  key: EntityKey,
  id: number,
  data: Partial<Omit<T, "id" | "createdAt">>,
): T {
  const items = getAll<T>(key);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) throw new Error(`Entity with id ${id} not found in ${key}`);
  const updated = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString(),
  } as T;
  items[index] = updated;
  localStorage.setItem(key, JSON.stringify(items));
  return updated;
}

export function remove(key: EntityKey, id: number): void {
  const items = getAll(key);
  const filtered = items.filter((item) => item.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
}

export function reset<T>(key: EntityKey, seedData: T[]): T[] {
  localStorage.setItem(key, JSON.stringify(seedData));
  return seedData;
}

export function resetAll(): void {
  reset("tqh_users", SEED_USERS);
  reset("tqh_projects", SEED_PROJECTS);
  reset("tqh_defects", SEED_DEFECTS);
  reset("tqh_test_plans", SEED_TEST_PLANS);
  reset("tqh_test_runs", SEED_TEST_RUNS);
}
