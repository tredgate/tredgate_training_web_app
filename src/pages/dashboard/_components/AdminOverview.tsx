import { Users as UsersIcon, Folder, Activity } from "lucide-react";
import StatCard from "../../../components/display/StatCard";
import { TEST_IDS } from "../../../shared/testIds";
import { t } from "../../../i18n";
import type { Project, User } from "../../../data/entities";

interface AdminOverviewProps {
  users: User[];
  projects: Project[];
}

export default function AdminOverview({ users, projects }: AdminOverviewProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3" data-testid={TEST_IDS.dashboard.headingSystemOverview}>System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          data-testid={TEST_IDS.dashboard.cardTotalUsers}
          icon={UsersIcon}
          label={t.dashboard.statTotalUsers}
          value={users.length}
        />
        <StatCard
          data-testid={TEST_IDS.dashboard.cardTotalProjects}
          icon={Folder}
          label={t.dashboard.statTotalProjects}
          value={projects.length}
        />
        <StatCard
          data-testid={TEST_IDS.dashboard.cardActiveProjects}
          icon={Activity}
          label={t.dashboard.statActiveProjects}
          value={projects.filter((p) => p.status === "active").length}
        />
      </div>
    </div>
  );
}
