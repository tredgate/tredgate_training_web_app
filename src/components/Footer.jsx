import { RotateCcw } from "lucide-react";

export default function Footer({ onReset }) {
  return (
    <footer className="mt-12 py-6 border-t border-white/5 text-center">
      <button
        onClick={onReset}
        data-testid="reset-data"
        className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-400 text-xs transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        Reset Data
      </button>
      <p className="text-gray-700 text-xs mt-2">
        Defect Containment Board v3.14.159 — Internal Use Only
      </p>
    </footer>
  );
}
