import { useState, useRef } from "react";
import { Send, Archive } from "lucide-react";

export default function ReportDefect({ onSubmit, onNavigate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Major");
  const checkboxRef = useRef(null);
  const [checkboxOffset, setCheckboxOffset] = useState({ x: 0, y: 0 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      severity,
    });
    onNavigate("list");
  };

  const handleCheckboxHover = () => {
    const dx = (Math.random() > 0.5 ? 1 : -1) * 50;
    const dy = (Math.random() > 0.5 ? 1 : -1) * 50;
    setCheckboxOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Report Defect</h1>
        <p className="text-gray-400">Document a new containment breach</p>
      </div>

      <div className="glass p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              data-testid="defect-title"
              type="text"
              className="input-dark"
              placeholder="e.g., Button achieves sentience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description
            </label>
            <textarea
              data-testid="defect-description"
              className="input-dark min-h-[120px] resize-y"
              placeholder="Describe the defect in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Severity</label>
            <select
              data-testid="defect-severity"
              className="input-dark appearance-none"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

          <button
            type="submit"
            data-testid="submit-defect"
            className="btn-neon-purple w-full flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Defect Report
          </button>
        </form>
      </div>

      {/* EASTER EGG: Legacy Module */}
      <div className="glass p-6 max-w-2xl mt-8 border-yellow-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Archive className="w-4 h-4 text-yellow-500/60" />
          <p className="text-yellow-500/60 text-sm font-medium">
            Legacy Module: No need to test this
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            ref={checkboxRef}
            onMouseEnter={handleCheckboxHover}
            style={{
              transform: `translate(${checkboxOffset.x}px, ${checkboxOffset.y}px)`,
              transition: "transform 0.2s ease-out",
            }}
          >
            <input
              type="checkbox"
              data-testid="legacy-checkbox"
              className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer"
            />
          </div>
          <span className="text-gray-500 text-sm">
            Enable legacy compatibility mode
          </span>
        </div>
      </div>
    </div>
  );
}
