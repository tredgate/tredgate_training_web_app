import { useAuth } from "./useAuth";
import { useDefects } from "./useDefects";
import { useProjects } from "./useProjects";
import { useTestPlans } from "./useTestPlans";
import { useTestRuns } from "./useTestRuns";
import { useUsers } from "./useUsers";
import { t } from "../i18n";
import type { AuthUser } from "../contexts/AuthContext";
import type {
  Defect,
  Project,
  TestPlan,
  TestRun,
  User,
} from "../data/entities";
import type { ActivityEntry } from "../components/display/ActivityTimeline";

// ─── Pure helpers (exported for testing) ─────────────────────────────────

export interface ScopePredicates {
  defectInScope: (d: Defect) => boolean;
  planInScope: (p: TestPlan) => boolean;
  runInScope: (r: TestRun, plans: TestPlan[]) => boolean;
}

export function getScope(user: AuthUser, projects: Project[]): ScopePredicates {
  if (user.role === "tester") {
    return {
      defectInScope: (d) => d.reporterId === user.id,
      planInScope: (p) => p.assigneeId === user.id,
      runInScope: (r) => r.executorId === user.id,
    };
  }

  if (user.role === "qa_lead") {
    const myProjectIds = projects
      .filter((p) => p.leadId === user.id || p.memberIds.includes(user.id))
      .map((p) => p.id);
    return {
      defectInScope: (d) => myProjectIds.includes(d.projectId),
      planInScope: (p) => myProjectIds.includes(p.projectId),
      runInScope: (r, plans) => {
        const plan = plans.find((tp) => tp.id === r.testPlanId);
        return plan !== undefined && myProjectIds.includes(plan.projectId);
      },
    };
  }

  // Admin — everything in scope
  return {
    defectInScope: () => true,
    planInScope: () => true,
    runInScope: () => true,
  };
}

export function computePassRate(runs: TestRun[]): number {
  const totalCases = runs.flatMap((r) => r.results).length;
  const passedCases = runs
    .flatMap((r) => r.results)
    .filter((r) => r.status === "passed").length;
  return totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;
}

// ─── Return type ─────────────────────────────────────────────────────────

export interface DashboardData {
  totalDefectsCount: number;
  openDefectsCount: number;
  testPlansCount: number;
  passRate: number;

  myDefectsForTable: Defect[];
  myTestRuns: TestRun[];
  unassignedDefects: Defect[];
  awaitingVerification: Defect[];

  recentActivityEntries: ActivityEntry[];

  getProjectName: (projectId: number) => string;
  getUserName: (userId: number) => string;
  getTestPlanName: (planId: number) => string;

  users: User[];
  projects: Project[];
  testPlans: TestPlan[];
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useDashboardData(): DashboardData | null {
  const { user } = useAuth();
  const { defects } = useDefects();
  const { projects } = useProjects();
  const { testPlans } = useTestPlans();
  const { testRuns } = useTestRuns();
  const { users } = useUsers();

  if (!user) return null;

  const { defectInScope, planInScope, runInScope } = getScope(user, projects);

  // ── Counts ──────────────────────────────────────────────────────────
  const scopedDefects = defects.filter(defectInScope);
  const totalDefectsCount = scopedDefects.length;
  const openDefectsCount = scopedDefects.filter(
    (d) => d.status !== "closed" && d.status !== "verified",
  ).length;

  const testPlansCount = testPlans.filter(planInScope).length;

  const passRateRuns = testRuns.filter((r) => runInScope(r, testPlans));
  const passRate = computePassRate(passRateRuns);

  // ── Table data ──────────────────────────────────────────────────────
  const myDefectsForTable = defects
    .filter((d) => d.assigneeId === user.id)
    .slice(0, 5);

  const myTestRuns = testRuns
    .filter((r) => r.executorId === user.id)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )
    .slice(0, 5);

  const isLeadOrAdmin = user.role === "qa_lead" || user.role === "admin";
  const unassignedDefects = isLeadOrAdmin
    ? defects.filter((d) => defectInScope(d) && d.status === "new")
    : [];
  const awaitingVerification = isLeadOrAdmin
    ? defects.filter((d) => defectInScope(d) && d.status === "resolved")
    : [];

  // ── Activity timeline ───────────────────────────────────────────────
  const allHistoryEntries = defects.flatMap((d) =>
    d.history.map((h) => ({
      ...h,
      defectId: d.id,
      defectTitle: d.title,
    })),
  );

  const timelineHistoryEntries = allHistoryEntries.filter((h) => {
    const defect = defects.find((d) => d.id === h.defectId);
    return defect !== undefined && defectInScope(defect);
  });

  const recentActivityEntries: ActivityEntry[] = timelineHistoryEntries
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 10)
    .map((h) => ({
      id: h.id,
      type: (h.action === "created"
        ? "created"
        : h.action === "commented"
          ? "comment"
          : "transition") as "created" | "comment" | "transition",
      user: users.find((u) => u.id === h.userId)?.fullName || "Unknown",
      text: `${h.details}`,
      timestamp: h.timestamp,
    }));

  // ── Lookup helpers ──────────────────────────────────────────────────
  const getProjectName = (projectId: number): string =>
    projects.find((p) => p.id === projectId)?.name ||
    t.dashboard.unknownProject;

  const getUserName = (userId: number): string =>
    users.find((u) => u.id === userId)?.fullName || t.dashboard.unknownUser;

  const getTestPlanName = (planId: number): string =>
    testPlans.find((tp) => tp.id === planId)?.name || t.dashboard.unknownPlan;

  return {
    totalDefectsCount,
    openDefectsCount,
    testPlansCount,
    passRate,
    myDefectsForTable,
    myTestRuns,
    unassignedDefects,
    awaitingVerification,
    recentActivityEntries,
    getProjectName,
    getUserName,
    getTestPlanName,
    users,
    projects,
    testPlans,
  };
}
