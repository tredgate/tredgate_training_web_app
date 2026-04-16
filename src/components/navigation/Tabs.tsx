import type { JSX } from "react";

export interface Tab {
  key: string;
  label: string;
  badge?: number | null;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  testIdPrefix: string;
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  testIdPrefix,
  className = "",
}: TabsProps): JSX.Element {
  return (
    <div
      data-testid={`${testIdPrefix}-tabs`}
      className={`border-b border-white/10 ${className}`}
    >
      <div className="flex gap-0" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              data-testid={`${testIdPrefix}-tab-${tab.key}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-[3px] ${
                isActive
                  ? "text-white border-neon-purple"
                  : "text-gray-400 border-transparent hover:text-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.badge != null && (
                  <span
                    data-testid={`${testIdPrefix}-tab-badge-${tab.key}`}
                    className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full"
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
