import { useState } from "react";
import { Bug, AlertTriangle, TrendingUp, Skull } from "lucide-react";

export default function Dashboard({ defects }) {
  const [showChaos, setShowChaos] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Mission Control for Defect Containment</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-neon-purple/20 flex items-center justify-center">
              <Bug className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Contained Defects</p>
              <p
                className="text-3xl font-bold text-white"
                data-testid="defect-count"
              >
                {defects.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Critical</p>
              <p className="text-3xl font-bold text-red-400">
                {defects.filter((d) => d.severity === "Critical").length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-electric-blue/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-electric-blue" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Containment Rate</p>
              <p className="text-3xl font-bold text-electric-blue">98.7%</p>
            </div>
          </div>
        </div>
      </div>

      {/* DO NOT TOUCH Easter Egg */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => setShowChaos(true)}
          className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white text-xl font-black rounded-xl shadow-glow-red transition-all duration-300 hover:scale-105 border-2 border-red-400/50 cursor-pointer"
          data-testid="do-not-touch-btn"
        >
          <div className="flex items-center gap-3">
            <Skull className="w-7 h-7" />
            DO NOT TOUCH
            <Skull className="w-7 h-7" />
          </div>
        </button>
      </div>

      {/* Chaos Overlay */}
      {showChaos && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 chaos-bg"
          onClick={() => setShowChaos(false)}
          data-testid="chaos-overlay"
        >
          <div className="text-center glitch-text select-none">
            <p className="text-red-500 text-8xl font-black mb-4">💀</p>
            <h2 className="text-red-500 text-5xl font-black mb-4">
              YOU BROKE PRODUCTION!
            </h2>
            <p className="text-red-400 text-xl mb-2">
              All systems are now offline.
            </p>
            <p className="text-red-400 text-xl mb-8">
              The CEO has been notified.
            </p>
            <p className="text-gray-500 text-sm">
              (click anywhere to dismiss... if you dare)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
