import { useCallback } from "react";
import type { Defect, DefectStatus, DefectComment } from "../data/entities";
import type { AvailableTransition } from "../utils/workflow";
import {
  getAvailableTransitions,
  executeTransition as execTransition,
} from "../utils/workflow";
import { useStore } from "./useStore";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

export interface UseDefectsReturn {
  defects: Defect[];
  getById: (id: number) => Defect | null;
  create: (
    data: Omit<
      Defect,
      "id" | "createdAt" | "updatedAt" | "comments" | "history"
    >,
  ) => Defect;
  update: (
    id: number,
    data: Partial<Omit<Defect, "id" | "createdAt">>,
  ) => Defect;
  remove: (id: number) => void;
  getTransitions: (defect: Defect) => AvailableTransition[];
  transition: (defect: Defect, action: string, userId: number) => Defect;
  addComment: (defectId: number, userId: number, text: string) => Defect;
  getByProject: (projectId: number) => Defect[];
  getByStatus: (status: DefectStatus) => Defect[];
  getByAssignee: (userId: number) => Defect[];
  getByReporter: (userId: number) => Defect[];
  refresh: () => void;
}

/**
 * Defect-specific hook.
 * Wraps useStore<Defect> and adds workflow transitions, comments, and filtering.
 */
export function useDefects(): UseDefectsReturn {
  const { items: defects, ...store } = useStore<Defect>("tqh_defects");
  const { user } = useAuth();
  const { addToast } = useToast();

  const getTransitions = useCallback(
    (defect: Defect): AvailableTransition[] => {
      if (!user) return [];
      return getAvailableTransitions(defect.status, user.role);
    },
    [user],
  );

  const transition = useCallback(
    (defect: Defect, action: string, userId: number): Defect => {
      try {
        const updated = execTransition(defect, action as any, userId);
        const persisted = store.update(defect.id, {
          status: updated.status,
          history: updated.history,
          updatedAt: updated.updatedAt,
        });
        addToast("success", `Status updated to ${updated.status}`);
        return persisted;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to transition defect";
        addToast("error", message);
        throw err;
      }
    },
    [store, addToast],
  );

  const addComment = useCallback(
    (defectId: number, userId: number, text: string): Defect => {
      const defect = store.getById(defectId);
      if (!defect) throw new Error(`Defect ${defectId} not found`);

      const commentMaxId = defect.comments.reduce(
        (max, c) => Math.max(max, c.id),
        0,
      );
      const newComment: DefectComment = {
        id: commentMaxId + 1,
        userId,
        text,
        createdAt: new Date().toISOString(),
      };

      const updated = store.update(defectId, {
        comments: [...defect.comments, newComment],
      });
      addToast("success", "Comment added");
      return updated;
    },
    [store, addToast],
  );

  const getByProject = useCallback(
    (projectId: number): Defect[] => {
      return defects.filter((d) => d.projectId === projectId);
    },
    [defects],
  );

  const getByStatus = useCallback(
    (status: DefectStatus): Defect[] => {
      return defects.filter((d) => d.status === status);
    },
    [defects],
  );

  const getByAssignee = useCallback(
    (userId: number): Defect[] => {
      return defects.filter((d) => d.assigneeId === userId);
    },
    [defects],
  );

  const getByReporter = useCallback(
    (userId: number): Defect[] => {
      return defects.filter((d) => d.reporterId === userId);
    },
    [defects],
  );

  const create = useCallback(
    (
      data: Omit<
        Defect,
        "id" | "createdAt" | "updatedAt" | "comments" | "history"
      >,
    ): Defect => {
      const now = new Date().toISOString();
      const created = store.create({
        ...data,
        comments: [],
        history: [
          {
            id: 1,
            userId: data.reporterId,
            action: "created",
            fromStatus: null,
            toStatus: "new",
            details: "Defect reported",
            timestamp: now,
          },
        ],
        status: "new" as DefectStatus,
      } as Omit<Defect, "id" | "createdAt" | "updatedAt">);
      addToast("success", "Defect reported");
      return created;
    },
    [store, addToast],
  );

  const remove = useCallback(
    (id: number): void => {
      store.remove(id);
      addToast("success", "Defect deleted");
    },
    [store, addToast],
  );

  return {
    defects,
    getById: store.getById,
    create,
    update: (id, data) => {
      const updated = store.update(id, data);
      addToast("success", "Defect updated");
      return updated;
    },
    remove,
    getTransitions,
    transition,
    addComment,
    getByProject,
    getByStatus,
    getByAssignee,
    getByReporter,
    refresh: store.refresh,
  };
}
