import { useCallback } from "react";
import type { User } from "../data/entities";
import { useStore } from "./useStore";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

export interface UseUsersReturn {
  users: User[];
  getById: (id: number) => User | null;
  create: (data: Omit<User, "id" | "createdAt">) => User;
  update: (id: number, data: Partial<Omit<User, "id" | "createdAt">>) => User;
  remove: (id: number) => void;
  refresh: () => void;
}

/**
 * User management hook.
 * Admin-only. Non-admins can call it but operations will fail with permission error.
 */
export function useUsers(): UseUsersReturn {
  const { items: users, ...store } = useStore<User>("tqh_users");
  const { user } = useAuth();
  const { addToast } = useToast();

  const isAdmin = user?.role === "admin";

  const create = useCallback(
    (data: Omit<User, "id" | "createdAt">): User => {
      if (!isAdmin) {
        addToast("error", "Permission denied: admin only");
        throw new Error("Permission denied: admin only");
      }
      const created = store.create(data);
      addToast("success", "User created");
      return created;
    },
    [isAdmin, store, addToast],
  );

  const update = useCallback(
    (id: number, data: Partial<Omit<User, "id" | "createdAt">>): User => {
      if (!isAdmin) {
        addToast("error", "Permission denied: admin only");
        throw new Error("Permission denied: admin only");
      }
      const updated = store.update(id, data);
      addToast("success", "User updated");
      return updated;
    },
    [isAdmin, store, addToast],
  );

  const remove = useCallback(
    (id: number): void => {
      if (!isAdmin) {
        addToast("error", "Permission denied: admin only");
        throw new Error("Permission denied: admin only");
      }
      store.remove(id);
      addToast("success", "User deleted");
    },
    [isAdmin, store, addToast],
  );

  return {
    users,
    getById: store.getById,
    create,
    update,
    remove,
    refresh: store.refresh,
  };
}
