import { Bug, AlertTriangle, ClipboardList, CheckCircle } from "lucide-react";
import StatCard from "../../../components/display/StatCard";
import { TEST_IDS } from "../../../shared/testIds";
import { t } from "../../../i18n";

interface DashboardStatsProps {
  totalDefectsCount: number;
  openDefectsCount: number;
  testPlansCount: number;
  passRate: number;
}

export default function DashboardStats({
  totalDefectsCount,
  openDefectsCount,
  testPlansCount,
  passRate,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        data-testid={TEST_IDS.dashboard.cardTotalDefects}
        icon={Bug}
        label={t.dashboard.statTotalDefects}
        value={totalDefectsCount}
      />
      <StatCard
        data-testid={TEST_IDS.dashboard.cardOpenDefects}
        icon={AlertTriangle}
        label={t.dashboard.statOpenDefects}
        value={openDefectsCount}
      />
      <StatCard
        data-testid={TEST_IDS.dashboard.cardTestPlans}
        icon={ClipboardList}
        label={t.dashboard.statTestPlans}
        value={testPlansCount}
      />
      <StatCard
        data-testid={TEST_IDS.dashboard.cardPassRate}
        icon={CheckCircle}
        label={t.dashboard.statPassRate}
        value={`${passRate}%`}
      />
    </div>
  );
}
