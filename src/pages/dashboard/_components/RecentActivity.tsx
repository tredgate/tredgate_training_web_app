import ActivityTimeline from "../../../components/display/ActivityTimeline";
import { TEST_IDS } from "../../../shared/testIds";
import { t } from "../../../i18n";
import type { ActivityEntry } from "../../../components/display/ActivityTimeline";

interface RecentActivityProps {
  entries: ActivityEntry[];
}

export default function RecentActivity({ entries }: RecentActivityProps) {
  return (
    <div>
      <h2
        className="text-lg font-semibold text-white mb-3"
        data-testid={TEST_IDS.dashboard.headingRecentActivity}
      >
        {t.dashboard.sectionRecentActivity}
      </h2>
      <div className="glass p-6">
        <ActivityTimeline
          data-testid={TEST_IDS.dashboard.activityTimeline}
          entries={entries}
        />
      </div>
    </div>
  );
}
