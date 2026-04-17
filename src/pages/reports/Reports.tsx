import { useState } from "react";
import { TEST_IDS } from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import Tabs from "../../components/navigation/Tabs";
import StatCard from "../../components/display/StatCard";
import DataTable from "../../components/data/DataTable";
import Select from "../../components/forms/Select";
import DatePicker from "../../components/forms/DatePicker";
import { useAuth } from "../../hooks/useAuth";
import { useDefects } from "../../hooks/useDefects";
import { useProjects } from "../../hooks/useProjects";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useTestRuns } from "../../hooks/useTestRuns";
import { useUsers } from "../../hooks/useUsers";
import type { Column } from "../../components/data/DataTable";
import type { Defect, TestRun } from "../../data/entities";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

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

  // ────────────────────────────────────────────────────────────────────────
  // DATA FILTERING BY ROLE
  // ────────────────────────────────────────────────────────────────────────

  // Filter defects by role (same pattern as Dashboard)
  let defectsInScope: Defect[];
  const myProjectIds = projects
    .filter((p) => p.leadId === user.id || p.memberIds.includes(user.id))
    .map((p) => p.id);

  if (user.role === "tester") {
    defectsInScope = defects.filter((d) => d.reporterId === user.id);
  } else if (user.role === "qa_lead") {
    defectsInScope = defects.filter((d) => myProjectIds.includes(d.projectId));
  } else {
    // admin
    defectsInScope = defects;
  }

  // Apply filters
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

  // ────────────────────────────────────────────────────────────────────────
  // DEFECT TRENDS TAB
  // ────────────────────────────────────────────────────────────────────────

  const openDefects = filteredDefects.filter(
    (d) => d.status !== "closed" && d.status !== "verified",
  );
  const criticalDefects = filteredDefects.filter((d) => d.severity === "critical");

  // Average time to resolve
  const resolvedDefects = filteredDefects.filter(
    (d) => d.status === "resolved" || d.status === "verified" || d.status === "closed",
  );
  let avgTimeToResolve = "N/A";
  if (resolvedDefects.length > 0) {
    const totalHours = resolvedDefects.reduce((sum, d) => {
      const created = new Date(d.createdAt);
      const updated = new Date(d.updatedAt || d.createdAt);
      const hours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    const avg = Math.round(totalHours / resolvedDefects.length);
    avgTimeToResolve = `${avg} hrs`;
  }

  // Severity breakdown
  const severityData = [
    { severity: "critical", count: 0 },
    { severity: "major", count: 0 },
    { severity: "minor", count: 0 },
    { severity: "trivial", count: 0 },
  ];
  filteredDefects.forEach((d) => {
    const entry = severityData.find((s) => s.severity === d.severity);
    if (entry) entry.count++;
  });
  const severityTotal = severityData.reduce((sum, s) => sum + s.count, 0);

  // Status breakdown
  const statusData = [
    { status: "new", count: 0 },
    { status: "assigned", count: 0 },
    { status: "in_progress", count: 0 },
    { status: "resolved", count: 0 },
    { status: "verified", count: 0 },
    { status: "closed", count: 0 },
    { status: "rejected", count: 0 },
    { status: "reopened", count: 0 },
  ];
  filteredDefects.forEach((d) => {
    const entry = statusData.find((s) => s.status === d.status);
    if (entry) entry.count++;
  });
  const statusTotal = statusData.reduce((sum, s) => sum + s.count, 0);

  // Project breakdown
  const projectBreakdown = projects
    .filter((p) =>
      selectedProject === "all"
        ? user.role === "admin"
          ? true
          : myProjectIds.includes(p.id)
        : p.id === parseInt(selectedProject, 10),
    )
    .map((p) => {
      const projDefects = filteredDefects.filter((d) => d.projectId === p.id);
      return {
        projectName: p.name,
        total: projDefects.length,
        open: projDefects.filter(
          (d) => d.status !== "closed" && d.status !== "verified",
        ).length,
        resolved: projDefects.filter((d) => d.status === "resolved").length,
        closed: projDefects.filter(
          (d) => d.status === "closed" || d.status === "verified",
        ).length,
      };
    });

  // ────────────────────────────────────────────────────────────────────────
  // TEST COVERAGE TAB
  // ────────────────────────────────────────────────────────────────────────

  // Filter test plans by role
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

  // Calculate pass rate from completed test runs
  const completedRuns = testRuns.filter((tr) => tr.status === "completed");
  let overallPassRate = 0;
  if (completedRuns.length > 0) {
    const totalResults = completedRuns.reduce(
      (sum, tr) => sum + tr.results.length,
      0,
    );
    const passedResults = completedRuns.reduce(
      (sum, tr) =>
        sum + tr.results.filter((r) => r.status === "passed").length,
      0,
    );
    overallPassRate =
      totalResults > 0
        ? Math.round((passedResults / totalResults) * 100)
        : 0;
  }

  // Test plans with pass rates
  const plansWithRates = testPlansInScope.map((tp) => {
    const planRuns = testRuns.filter((tr) => tr.testPlanId === tp.id);
    const completedPlanRuns = planRuns.filter((tr) => tr.status === "completed");
    let passRate = "—";
    if (completedPlanRuns.length > 0) {
      const lastRun = completedPlanRuns[completedPlanRuns.length - 1];
      if (lastRun.results.length > 0) {
        const passed = lastRun.results.filter(
          (r) => r.status === "passed",
        ).length;
        const rate = Math.round((passed / lastRun.results.length) * 100);
        passRate = `${rate}%`;
      }
    }

    const lastRun = completedPlanRuns[completedPlanRuns.length - 1] || null;
    const lastRunStatus = lastRun ? lastRun.status : "—";

    return {
      id: tp.id,
      name: tp.name,
      projectName:
        projects.find((p) => p.id === tp.projectId)?.name || "—",
      cases: tp.testCases.length,
      runs: planRuns.length,
      lastRunStatus,
      passRate,
    };
  });

  // ────────────────────────────────────────────────────────────────────────
  // TEAM WORKLOAD TAB
  // ────────────────────────────────────────────────────────────────────────

  // Workload data per user
  const workloadData = users.map((u) => {
    const assignedDefects = defects.filter((d) => d.assigneeId === u.id);
    const reportedDefects = defects.filter((d) => d.reporterId === u.id);
    const executedRuns = testRuns.filter((tr) => tr.executedBy === u.id);
    const openItems =
      assignedDefects.filter(
        (d) => d.status !== "closed" && d.status !== "verified",
      ).length + executedRuns.filter((tr) => tr.status === "pending").length;

    return {
      id: u.id,
      name: u.fullName,
      role: u.role,
      assigned: assignedDefects.length,
      reported: reportedDefects.length,
      executed: executedRuns.length,
      openItems,
    };
  });

  // Top reporters
  const topReporters = users
    .map((u) => ({
      name: u.fullName,
      count: defects.filter((d) => d.reporterId === u.id).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top executors
  const topExecutors = users
    .map((u) => ({
      name: u.fullName,
      count: testRuns.filter((tr) => tr.executedBy === u.id).length,
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ────────────────────────────────────────────────────────────────────────
  // TABLE COLUMNS
  // ────────────────────────────────────────────────────────────────────────

  const severityColumns: Column[] = [
    { key: "severity", label: "Severity", sortable: true },
    {
      key: "count",
      label: "Count",
      sortable: true,
      render: (value: unknown) => value || 0,
    },
    {
      key: "percentage",
      label: "% of Total",
      sortable: true,
      render: (value: unknown) => {
        if (!severityTotal) return "0%";
        const count = value as number;
        return `${Math.round((count / severityTotal) * 100)}%`;
      },
    },
  ];

  const statusColumns: Column[] = [
    { key: "status", label: "Status", sortable: true },
    {
      key: "count",
      label: "Count",
      sortable: true,
      render: (value: unknown) => value || 0,
    },
    {
      key: "percentage",
      label: "% of Total",
      sortable: true,
      render: (value: unknown) => {
        if (!statusTotal) return "0%";
        const count = value as number;
        return `${Math.round((count / statusTotal) * 100)}%`;
      },
    },
  ];

  const projectColumns: Column[] = [
    { key: "projectName", label: "Project", sortable: true },
    { key: "total", label: "Total", sortable: true },
    { key: "open", label: "Open", sortable: true },
    { key: "resolved", label: "Resolved", sortable: true },
    { key: "closed", label: "Closed", sortable: true },
  ];

  const plansColumns: Column[] = [
    { key: "name", label: "Plan Name", sortable: true },
    { key: "projectName", label: "Project", sortable: true },
    { key: "cases", label: "Cases", sortable: true },
    { key: "runs", label: "Runs", sortable: true },
    { key: "lastRunStatus", label: "Last Run Status", sortable: true },
    { key: "passRate", label: "Pass Rate", sortable: true },
  ];

  const workloadColumns: Column[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "assigned", label: "Assigned Defects", sortable: true },
    { key: "reported", label: "Reported Defects", sortable: true },
    { key: "executed", label: "Test Runs Executed", sortable: true },
    { key: "openItems", label: "Open Items", sortable: true },
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
        onTabChange={setActiveTab}
      >
        {activeTab === "defect-trends" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="glass rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  data-testid={TEST_IDS.reports.filterProject}
                  label="Project"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  options={[
                    { value: "all", label: "All Projects" },
                    ...(user.role === "admin"
                      ? projects.map((p) => ({ value: String(p.id), label: p.name }))
                      : projects
                          .filter((p) =>
                            myProjectIds.includes(p.id),
                          )
                          .map((p) => ({ value: String(p.id), label: p.name }))),
                  ]}
                />
                <DatePicker
                  data-testid={TEST_IDS.reports.filterDateFrom}
                  label="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <DatePicker
                  data-testid={TEST_IDS.reports.filterDateTo}
                  label="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Stats */}
            <div
              data-testid={TEST_IDS.reports.defectStats}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <StatCard
                title="Total Defects"
                value={filteredDefects.length}
                icon="AlertTriangle"
              />
              <StatCard
                title="Open Defects"
                value={openDefects.length}
                icon="AlertTriangle"
              />
              <StatCard
                title="Critical Defects"
                value={criticalDefects.length}
                icon="AlertTriangle"
              />
              <StatCard title="Avg Time to Resolve" value={avgTimeToResolve} />
            </div>

            {/* Tables */}
            <div className="space-y-6">
              <div className="glass rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Defects by Severity
                </h3>
                <DataTable
                  data-testid={TEST_IDS.reports.severityTable}
                  columns={severityColumns}
                  rows={severityData.map((s) => ({
                    ...s,
                    percentage: s.count,
                  }))}
                  pageSize={10}
                />
              </div>

              <div className="glass rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Defects by Status
                </h3>
                <DataTable
                  data-testid={TEST_IDS.reports.statusTable}
                  columns={statusColumns}
                  rows={statusData.map((s) => ({
                    ...s,
                    percentage: s.count,
                  }))}
                  pageSize={10}
                />
              </div>

              <div className="glass rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Defects by Project
                </h3>
                <DataTable
                  data-testid={TEST_IDS.reports.projectTable}
                  columns={projectColumns}
                  rows={projectBreakdown}
                  pageSize={10}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "test-coverage" && (
          <div className="space-y-6">
            {/* Stats */}
            <div
              data-testid={TEST_IDS.reports.coverageStats}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <StatCard
                title="Total Test Plans"
                value={testPlansInScope.length}
                icon="ClipboardList"
              />
              <StatCard
                title="Total Test Cases"
                value={totalCases}
                icon="ClipboardList"
              />
              <StatCard
                title="Overall Pass Rate"
                value={`${overallPassRate}%`}
                icon="CheckCircle"
              />
            </div>

            {/* Table */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Test Plans Summary
              </h3>
              <DataTable
                data-testid={TEST_IDS.reports.plansTable}
                columns={plansColumns}
                rows={plansWithRates}
                pageSize={10}
              />
            </div>
          </div>
        )}

        {activeTab === "team-workload" && (
          <div className="space-y-6">
            {/* Workload Table */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Team Members Summary
              </h3>
              <DataTable
                data-testid={TEST_IDS.reports.workloadTable}
                columns={workloadColumns}
                rows={workloadData}
                pageSize={10}
              />
            </div>

            {/* Top Reporters and Executors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Top Reporters
                </h3>
                <div data-testid={TEST_IDS.reports.topReporters} className="space-y-3">
                  {topReporters.length > 0 ? (
                    topReporters.map((reporter, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                      >
                        <span className="text-white">{reporter.name}</span>
                        <span className="text-gray-300 text-sm">
                          {reporter.count} defects
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
                <div data-testid={TEST_IDS.reports.topExecutors} className="space-y-3">
                  {topExecutors.length > 0 ? (
                    topExecutors.map((executor, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                      >
                        <span className="text-white">{executor.name}</span>
                        <span className="text-gray-300 text-sm">
                          {executor.count} runs
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
      </Tabs>
    </div>
  );
}
