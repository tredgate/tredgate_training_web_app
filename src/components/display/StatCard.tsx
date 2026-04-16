import type { JSX } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardTrend {
  value: string;
  positive: boolean;
}

export interface StatCardProps {
  'data-testid': string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: StatCardTrend | null;
  className?: string;
}

export default function StatCard({
  'data-testid': testId,
  icon: Icon,
  label,
  value,
  trend,
  className = '',
}: StatCardProps): JSX.Element {
  return (
    <div data-testid={testId} className={`glass p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-neon-purple" />
        {trend && (
          <span
            data-testid={`${testId}-trend`}
            className={`text-sm font-medium ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {trend.value}
          </span>
        )}
      </div>
      <p data-testid={`${testId}-value`} className="text-3xl font-bold text-white">
        {value}
      </p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}
