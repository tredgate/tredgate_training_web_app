import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { TEST_IDS } from "../../shared/testIds";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  defects: "Defects",
  "test-plans": "Test Plans",
  team: "Team",
  reports: "Reports",
  settings: "Settings",
  profile: "Profile",
  new: "New",
  edit: "Edit",
  execute: "Execute",
};

interface BreadcrumbsProps {
  labels?: Record<string, string>;
}

export default function Breadcrumbs({ labels }: BreadcrumbsProps) {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const label =
      labels?.[segment] ??
      SEGMENT_LABELS[segment] ??
      (segment.match(/^\d+$/) ? `#${segment}` : segment);
    const isLast = index === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav
      data-testid={TEST_IDS.breadcrumbs.nav}
      className="flex items-center gap-1 text-sm text-gray-400 mb-4"
    >
      <Link
        to="/dashboard"
        data-testid={TEST_IDS.breadcrumbs.link}
        className="hover:text-white transition-colors"
      >
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-gray-600" />
          {crumb.isLast ? (
            <span className="text-gray-200">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              data-testid={TEST_IDS.breadcrumbs.link}
              className="hover:text-white transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
