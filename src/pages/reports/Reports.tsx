import { useState } from "react";
import { AlertTriangle, ClipboardList, CheckCircle } from "lucide-react";
import { TEST_IDS } from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import Tabs from "../../components/navigation/Tabs";
import StatCard from "../../components/display/StatCard";
import Select from "../../components/forms/Select";
import DatePicker from "../../components/forms/DatePicker";
import { useAuth } from "../../hooks/useAuth";
import { useDefects } from "../../hooks/useDefects";
import { useProjects } from "../../hooks/useProjects";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useTestRuns } from "../../hooks/useTestRuns";
import { useUsers } from "../../hooks/useUsers";
import type { Defect } from "../../data/entities";

export default function Reports() {
  const { user } = useAuth();
  const { defects } = useDefects();
  const { projects } = useProjects();
  const { testPlans } = useTestPlans();
  const { testRuns } = useTestRuns();
  const { users } = useUsers();
  const [activeTab, setActiveTab] = useState("defect-trends");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  if (!user) return null;

  // ── DATA FILTERING BY ROLE ──

  let defectsInScope: Defect[];
  const myProjectIds = projects
    .filter((p) => p.leadId === user.id || p.memberIds.includes(user.id))
    .map((p) => p.id);

  if (user.role === "tester") {
    defectsInScope = defects.filter((d) => d.reporterId === user.id);
  } else if (user.role === "qa_lead") {
    defectsInScope = defects.filter((d) => myProjectIds.includes(d.projectId));
  } else {
    defectsInScope = defects;
  }

  let filteredDefects = defectsInScope;
  if (selectedProject !== "all") {
    const projectId = parseInt(selectedProject, 10);
    filteredDefects = filteredDefects.filter((d) => d.projectId === projectId);
  }
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    filteredDefects = filteredDefects.filter(
      (d) => new Date(d.createdAt) >= fromDate,
    );
  }
  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    filteredDefects = filteredDefects.filter(
      (d) => new Date(d.createdAt) <= toDate,
    );
  }

  // ── DEFECT TRENDS ──

  const openDefects = filteredDefects.filter(
    (d) => d.status !== "closed" && d.status !== "verified",
  );
  const criticalDefects = filteredDefects.filter(
    (d) => d.severity === "critical",
  );

  const resolvedDefects = filteredDefects.filter(
    (d) =>
      d.status === "resolved" ||
      d.status === "verified" ||
      d.status === "closed",
  );
  let avgTimeToResolve = "N/A";
  if (resolvedDefects.length > 0) {
    const totalHours = resolvedDefects.reduce((sum, d) => {
      const created = new Date(d.createdAt);
      const updated = new Date(d.updatedAt || d.createdAt);
      return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgTimeToResolve = `${Math.round(totalHours / resolvedDefects.length)} hrs`;
  }

  const severityRows = (["critical", "major", "minor", "trivial"] as const).map(
    (s) => ({
      severity: s,
      count: filteredDefects.filter((d) => d.severity === s).length,
    }),
  );
  const severityTotal = filteredDefects.length;

  const statusRows = (
    [
      "new",
      "assigned",
      "in_progress",
      "resolved",
      "verified",
      "closed",
      "rejected",
      "reopened",
    ] as const
  ).map((s) => ({
    status: s,
    count: filteredDefects.filter((d) => d.status === s).length,
  }));
  const statusTotal = filteredDefects.length;

  const projectRows = projects
    .filter((p) =>
      selectedProject === "all"
        ? user.role === "admin" || myProjectIds.includes(p.id)
        : p.id === parseInt(selectedProject, 10),
    )
    .map((p) => {
      const pd = filteredDefects.filter((d) => d.projectId === p.id);
      return {
        id: p.id,
        name: p.name,
        total: pd.length,
        open: pd.filter((d) => d.status !== "closed" && d.status !== "verified")
          .length,
        resolved: pd.filter((d) => d.status === "resolved").length,
        closed: pd.filter(
          (d) => d.status === "closed" || d.status === "verified",
        ).length,
      };
    });

  // ── TEST COVERAGE ──

  let testPlansInScope = testPlans;
  if (user.role === "qa_lead") {
    testPlansInScope = testPlans.filter((tp) =>
      myProjectIds.includes(tp.projectId),
    );
  }

  const totalCases = testPlansInScope.reduce(
    (sum, tp) => sum + tp.testCases.length,
    0,
  );

  const completedRuns = testRuns.filter((tr) => tr.status === "completed");
  let overallPassRate = 0;
  if (completedRuns.length > 0) {
    const totalResults = completedRuns.reduce(
      (sum, tr) => sum + tr.results.length,
      0,
    );
    const passedResults = completedRuns.reduce(
      (sum, tr) => sum + tr.results.filter((r) => r.status === "passed").length,
      0,
    );
    overallPassRate =
      totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0;
  }

  const plansRows = testPlansInScope.map((tp) => {
    const planRuns = testRuns.filter((tr) => tr.testPlanId === tp.id);
    const done = planRuns.filter((tr) => tr.status === "completed");
    let passRate = "—";
    let lastRunStatus = "—";
    if (done.length > 0) {
      const lastRun = done[done.length - 1];
      if (lastRun) {
        lastRunStatus = lastRun.status;
        if (lastRun.results.length > 0) {
          const passed = lastRun.results.filter(
            (r) => r.status === "passed",
          ).length;
          passRate = `${Math.round((passed / lastRun.results.length) * 100)}%`;
        }
      }
    }
    return {
      id: tp.id,
      name: tp.name,
      project: projects.find((p) => p.id === tp.projectId)?.name || "—",
      cases: tp.testCases.length,
      runs: planRuns.length,
      lastRunStatus,
      passRate,
    };
  });

  // ── TEAM WORKLOAD ──

  const workloadRows = users.map((u) => {
    const assigned = defects.filter((d) => d.assigneeId === u.id);
    const reported = defects.filter((d) => d.reporterId === u.id);
    const executed = testRuns.filter((tr) => tr.executorId === u.id);
    return {
      id: u.id,
      name: u.fullName,
      role: u.role,
      assigned: assigned.length,
      reported: reported.length,
      executed: executed.length,
      openItems: assigned.filter(
        (d) => d.status !== "closed" && d.status !== "verified",
      ).length,
    };
  });

  const topReporters = users
    .map((u) => ({
      name: u.fullName,
      count: defects.filter((d) => d.reporterId === u.id).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topExecutors = users
    .map((u) => ({
      name: u.fullName,
      count: testRuns.filter((tr) => tr.executorId === u.id).length,
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const projectOptions = [
    { value: "all", label: "All Projects" },
    ...(user.role === "admin"
      ? projects
      : projects.filter((p) => myProjectIds.includes(p.id))
    ).map((p) => ({ value: String(p.id), label: p.name })),
  ];

  return (
    <div data-testid={TEST_IDS.reports.page}>
      <PageHeader title="Reports" />

      <Tabs
        tabs={[
          { key: "defect-trends", label: "Defect Trends" },
          { key: "test-coverage", label: "Test Coverage" },
          { key: "team-workload", label: "Team Workload" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        testIdPrefix="reports"
      />

      {activeTab === "defect-trends" && (
        <div className="space-y-6 mt-6">
          <div className="glass rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                data-testid={TEST_IDS.reports.filterProject}
                label="Project"
                name="reports-project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                options={projectOptions}
              />
              <DatePicker
                data-testid={TEST_IDS.reports.filterDateFrom}
                label="From Date"
                name="reports-date-from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <DatePicker
                data-testid={TEST_IDS.reports.filterDateTo}
                label="To Date"
                name="reports-date-to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div
            data-testid={TEST_IDS.reports.defectStats}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <StatCard
              data-testid="reports-stat-total"
              label="Total Defects"
              value={filteredDefects.length}
              icon={AlertTriangle}
            />
            <StatCard
              data-testid="reports-stat-open"
              label="Open Defects"
              value={openDefects.length}
              icon={AlertTriangle}
            />
            <StatCard
              data-testid="reports-stat-critical"
              label="Critical Defects"
              value={criticalDefects.length}
              icon={AlertTriangle}
            />
            <StatCard
              data-testid="reports-stat-avg"
              label="Avg Time to Resolve"
              value={avgTimeToResolve}
              icon={CheckCircle}
            />
          </div>

          <div className="space-y-6">
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Defects by Severity
              </h3>
              <table
                data-testid={TEST_IDS.reports.severityTable}
                className="w-full text-sm"
              >
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-300">
                      Severity
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300">Count</th>
                    <th className="text-left py-3 px-4 text-gray-300">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {severityRows.map((row) => (
                    <tr key={row.severity} className="border-b border-white/5">
                      <td className="py-3 px-4 text-white capitalize">
                        {row.severity}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{row.count}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {severityTotal > 0
                          ? `${Math.round((row.count / severityTotal) * 100)}%`
                          : "0%"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Defects by Status
              </h3>
              <table
                data-testid={TEST_IDS.reports.statusTable}
                className="w-full text-sm"
              >
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300">Count</th>
                    <th className="text-left py-3 px-4 text-gray-300">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statusRows.map((row) => (
                    <tr key={row.status} className="border-b border-white/5">
                      <td className="py-3 px-4 text-white capitalize">
                        {row.status.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{row.count}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {statusTotal > 0
                          ? `${Math.round((row.count / statusTotal) * 100)}%`
                          : "0%"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Defects by Project
              </h3>
              <table
                data-testid={TEST_IDS.reports.projectTable}
                className="w-full text-sm"
              >
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-300">
                      Project
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300">Total</th>
                    <th className="text-left py-3 px-4 text-gray-300">Open</th>
                    <th className="text-left py-3 px-4 text-gray-300">
                      Resolved
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300">
                      Closed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projectRows.map((row) => (
                    <tr key={row.id} className="border-b border-white/5">
                      <td className="py-3 px-4 text-white">{row.name}</td>
                      <td className="py-3 px-4 text-gray-300">{row.total}</td>
                      <td className="py-3 px-4 text-gray-300">{row.open}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {row.resolved}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{row.closed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "test-coverage" && (
        <div className="space-y-6 mt-6">
          <div
            data-testid={TEST_IDS.reports.coverageStats}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <StatCard
              data-testid="reports-stat-plans"
              label="Total Test Plans"
              value={testPlansInScope.length}
              icon={ClipboardList}
            />
            <StatCard
              data-testid="reports-stat-cases"
              label="Total Test Cases"
              value={totalCases}
              icon={ClipboardList}
            />
            <StatCard
              data-testid="reports-stat-passrate"
              label="Overall Pass Rate"
              value={`${overallPassRate}%`}
              icon={CheckCircle}
            />
          </div>

          <div className="glass rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Test Plans Summary
            </h3>
            <table
              data-testid={TEST_IDS.reports.plansTable}
              className="w-full text-sm"
            >
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300">
                    Plan Name
                  </th>
                  <th className="text-left py-3 px-4 text-gray-300">Project</th>
                  <th className="text-left py-3 px-4 text-gray-300">Cases</th>
                  <th className="text-left py-3 px-4 text-gray-300">Runs</th>
                  <th className="text-left py-3 px-4 text-gray-300">
                    Last Run
                  </th>
                  <th className="text-left py-3 px-4 text-gray-300">
                    Pass Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {plansRows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{row.name}</td>
                    <td className="py-3 px-4 text-gray-300">{row.project}</td>
                    <td className="py-3 px-4 text-gray-300">{row.cases}</td>
                    <td className="py-3 px-4 text-gray-300">{row.runs}</td>
                    <td className="py-3 px-4 text-gray-300 capitalize">
                      {row.lastRunStatus.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{row.passRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "team-workload" && (
        <div className="space-y-6 mt-6">
          <div className="glass rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Team Members Summary
            </h3>
            <table
              data-testid={TEST_IDS.reports.workloadTable}
              className="w-full text-sm"
            >
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300">Name</th>
                  <th className="text-left py-3 px-4 text-gray-300">Role</th>
                  <th className="text-left py-3 px-4 text-gray-300">
                    Assigned
                  </th>
                  <th className="text-left py-3 px-4 text-gray-300">
                    Reported
                  </th>
                  <th className="text-left py-3 px-4 text-gray-300">
                    Executed
                  </th>
                  <th className="text-left py-3 px-4 text-gray-300">
                    Open Items
                  </th>
                </tr>
              </thead>
              <tbody>
                {workloadRows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{row.name}</td>
                    <td className="py-3 px-4 text-gray-300 capitalize">
                      {row.role.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{row.assigned}</td>
                    <td className="py-3 px-4 text-gray-300">{row.reported}</td>
                    <td className="py-3 px-4 text-gray-300">{row.executed}</td>
                    <td className="py-3 px-4 text-gray-300">{row.openItems}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top Reporters
              </h3>
              <div
                data-testid={TEST_IDS.reports.topReporters}
                className="space-y-3"
              >
                {topReporters.length > 0 ? (
                  topReporters.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                    >
                      <span className="text-white">{r.name}</span>
                      <span className="text-gray-300 text-sm">
                        {r.count} defects
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No reporters yet</p>
                )}
              </div>
            </div>

            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top Executors
              </h3>
              <div
                data-testid={TEST_IDS.reports.topExecutors}
                className="space-y-3"
              >
                {topExecutors.length > 0 ? (
                  topExecutors.map((e, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                    >
                      <span className="text-white">{e.name}</span>
                      <span className="text-gray-300 text-sm">
                        {e.count} runs
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No executors yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
