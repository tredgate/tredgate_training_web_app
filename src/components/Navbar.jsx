import { LayoutDashboard, Bug, FilePlus, LogOut, Shield } from "lucide-react";

export default function Navbar({ currentPage, onNavigate, onLogout }) {
  const links = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "list", label: "Defect List", icon: Bug },
    { key: "report", label: "Report Defect", icon: FilePlus },
  ];

  return (
    <nav className="glass mb-8 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 mr-4">
          <Shield className="w-5 h-5 text-neon-purple" />
          <span className="font-bold text-white text-sm tracking-wide">
            DCB
          </span>
        </div>

        {links.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              currentPage === key
                ? "text-neon-purple bg-neon-purple/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </nav>
  );
}
