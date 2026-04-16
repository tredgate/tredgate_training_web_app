import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Bug,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "../../data/entities";
import { useAuth } from "../../hooks/useAuth";
import { TEST_IDS } from "../../shared/testIds";

interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
  roles: readonly Role[];
  testId: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["tester", "qa_lead", "admin"],
    testId: TEST_IDS.sidebar.linkDashboard,
  },
  {
    key: "projects",
    label: "Projects",
    icon: FolderKanban,
    path: "/projects",
    roles: ["tester", "qa_lead", "admin"],
    testId: TEST_IDS.sidebar.linkProjects,
  },
  {
    key: "defects",
    label: "Defects",
    icon: Bug,
    path: "/defects",
    roles: ["tester", "qa_lead", "admin"],
    testId: TEST_IDS.sidebar.linkDefects,
  },
  {
    key: "test-plans",
    label: "Test Plans",
    icon: ClipboardList,
    path: "/test-plans",
    roles: ["tester", "qa_lead", "admin"],
    testId: TEST_IDS.sidebar.linkTestPlans,
  },
  {
    key: "team",
    label: "Team",
    icon: Users,
    path: "/team",
    roles: ["tester", "qa_lead", "admin"],
    testId: TEST_IDS.sidebar.linkTeam,
  },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
    roles: ["qa_lead", "admin"],
    testId: TEST_IDS.sidebar.linkReports,
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ["admin"],
    testId: TEST_IDS.sidebar.linkSettings,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = MENU_ITEMS.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      data-testid={TEST_IDS.sidebar.nav}
      className={`flex flex-col h-full bg-white/5 border-r border-white/10 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <Shield className="text-neon-purple shrink-0" size={24} />
        {!collapsed && (
          <span
            data-testid={TEST_IDS.sidebar.logo}
            className="text-lg font-bold text-white truncate"
          >
            TredGate QA Hub
          </span>
        )}
        {collapsed && (
          <span data-testid={TEST_IDS.sidebar.logo} className="sr-only">
            TQH
          </span>
        )}
      </div>

      <div className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            data-testid={item.testId}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-neon-purple/20 text-neon-purple"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>

      <div className="border-t border-white/10 p-2 space-y-1">
        <button
          data-testid={TEST_IDS.sidebar.btnLogout}
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all w-full ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          data-testid={TEST_IDS.sidebar.btnCollapse}
          onClick={() => setCollapsed((prev) => !prev)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? (
            <ChevronRight size={20} className="shrink-0" />
          ) : (
            <ChevronLeft size={20} className="shrink-0" />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </nav>
  );
}
