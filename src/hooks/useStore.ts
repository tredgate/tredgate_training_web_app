import { useState, useEffect } from "react";
import type { EntityKey } from "../data/entities";
import * as store from "../data/store";

export interface UseStoreReturn<T extends { id: number }> {
  items: T[];
  getById: (id: number) => T | null;
  create: (data: Omit<T, "id" | "createdAt" | "updatedAt">) => T;
  update: (id: number, data: Partial<Omit<T, "id" | "createdAt">>) => T;
  remove: (id: number) => void;
  refresh: () => void;
}

/**
 * Generic hook wrapping store.ts CRUD operations for any entity type.
 * Other hooks compose on top of this.
 *
 * Note: We bypass TypeScript's strict BaseEntity checks at call sites
 * because some entities (like TestRun) don't include createdAt in their
 * type definition, but the store adds it at runtime. The operations
 * are type-safe at runtime even if the types don't perfectly align.
 */
export function useStore<T extends { id: number }>(
  entityKey: EntityKey,
): UseStoreReturn<T> {
  const [items, setItems] = useState<T[]>([]);

  const refresh = () => {
    // Cast getAll to handle type mismatches
    const data = (store.getAll as <U extends { id: number }>(
      key: EntityKey,
    ) => U[])<T>(entityKey);
    setItems(data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = (data: Omit<T, "id" | "createdAt" | "updatedAt">): T => {
    // Runtime behavior: all entities work with store.create despite type mismatches
    const created = (store.create as <U extends { id: number }>(
      key: EntityKey,
      data: Omit<U, "id" | "createdAt" | "updatedAt">,
    ) => U)<T>(entityKey, data);
    refresh();
    return created;
  };

  const update = (
    id: number,
    data: Partial<Omit<T, "id" | "createdAt">>,
  ): T => {
    // Runtime behavior: all entities work with store.update despite type mismatches
    const updated = (store.update as <U extends { id: number }>(
      key: EntityKey,
      id: number,
      data: Partial<Omit<U, "id" | "createdAt">>,
    ) => U)<T>(entityKey, id, data);
    refresh();
    return updated;
  };

  const remove = (id: number): void => {
    store.remove(entityKey, id);
    refresh();
  };

  const getById = (id: number): T | null => {
    // Cast getById to handle type mismatches
    return (store.getById as <U extends { id: number }>(
      key: EntityKey,
      id: number,
    ) => U | null)<T>(entityKey, id);
  };

  return {
    items,
    getById,
    create,
    update,
    remove,
    refresh,
  };
}
