import { useCallback } from "react";
import type { Project, ProjectStatus } from "../data/entities";
import { useStore } from "./useStore";
import { useToast } from "./useToast";

export interface UseProjectsReturn {
  projects: Project[];
  getById: (id: number) => Project | null;
  create: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => Project;
  update: (
    id: number,
    data: Partial<Omit<Project, "id" | "createdAt">>,
  ) => Project;
  remove: (id: number) => void;
  getByStatus: (status: ProjectStatus) => Project[];
  getMemberProjects: (userId: number) => Project[];
  refresh: () => void;
}

/**
 * Project-specific hook.
 * Wraps useStore<Project> and adds filtering and member-project access.
 */
export function useProjects(): UseProjectsReturn {
  const { items: projects, ...store } = useStore<Project>("tqh_projects");
  const { addToast } = useToast();

  const getByStatus = useCallback(
    (status: ProjectStatus): Project[] => {
      return projects.filter((p) => p.status === status);
    },
    [projects],
  );

  const getMemberProjects = useCallback(
    (userId: number): Project[] => {
      return projects.filter(
        (p) => p.memberIds.includes(userId) || p.leadId === userId,
      );
    },
    [projects],
  );

  const create = useCallback(
    (data: Omit<Project, "id" | "createdAt" | "updatedAt">): Project => {
      const created = store.create(data);
      addToast("success", "Project created");
      return created;
    },
    [store, addToast],
  );

  const update = useCallback(
    (id: number, data: Partial<Omit<Project, "id" | "createdAt">>): Project => {
      const updated = store.update(id, data);
      addToast("success", "Project updated");
      return updated;
    },
    [store, addToast],
  );

  const remove = useCallback(
    (id: number): void => {
      store.remove(id);
      addToast("success", "Project deleted");
    },
    [store, addToast],
  );

  return {
    projects,
    getById: store.getById,
    create,
    update,
    remove,
    getByStatus,
    getMemberProjects,
    refresh: store.refresh,
  };
}
