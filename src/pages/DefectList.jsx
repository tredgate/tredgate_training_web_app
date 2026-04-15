import { Bug, CheckCircle } from "lucide-react";

const severityColor = {
  Critical: "text-red-400 bg-red-400/10 border-red-400/30",
  Major: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Minor: "text-green-400 bg-green-400/10 border-green-400/30",
};

export default function DefectList({ defects, onResolve, onNavigate }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Defect List</h1>
          <p className="text-gray-400">
            All contained defects — {defects.length} total
          </p>
        </div>
        <button
          onClick={() => onNavigate("report")}
          className="btn-neon-purple"
        >
          + Report Defect
        </button>
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                ID
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                Title
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                Severity
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          {/* CRITICAL TRAP: No data-testid on <tr> or <td> elements */}
          <tbody>
            {defects.map((defect) => (
              <tr
                key={defect.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-neon-purple font-mono font-semibold">
                    #{defect.id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Bug className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-200">{defect.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${severityColor[defect.severity] || "text-gray-400 bg-gray-400/10 border-gray-400/30"}`}
                  >
                    {defect.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* CRITICAL TRAP: Every resolve button has the exact same data-testid */}
                  <button
                    data-testid="resolve-btn"
                    onClick={() => onResolve(defect.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-green-400 bg-green-400/10 hover:bg-green-400/20 border border-green-400/30 transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {defects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No defects found. Production is safe... for now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
