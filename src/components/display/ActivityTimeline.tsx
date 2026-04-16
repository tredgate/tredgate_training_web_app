import type { JSX } from 'react';
import { MessageSquare, ArrowRight, Plus } from 'lucide-react';

export type ActivityEntryType = 'comment' | 'transition' | 'created';

export interface ActivityEntry {
  id: number;
  type: ActivityEntryType;
  user: string;
  text: string;
  timestamp: string;
}

export interface ActivityTimelineProps {
  'data-testid': string;
  entries: ActivityEntry[];
  className?: string;
}

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return then.toLocaleDateString();
}

function getTypeIcon(type: ActivityEntryType) {
  switch (type) {
    case 'comment':
      return <MessageSquare className="w-4 h-4" />;
    case 'transition':
      return <ArrowRight className="w-4 h-4" />;
    case 'created':
      return <Plus className="w-4 h-4" />;
  }
}

function getTypeColor(type: ActivityEntryType): string {
  switch (type) {
    case 'comment':
      return 'bg-blue-500/20 text-blue-400';
    case 'transition':
      return 'bg-purple-500/20 text-purple-400';
    case 'created':
      return 'bg-emerald-500/20 text-emerald-400';
  }
}

export default function ActivityTimeline({
  'data-testid': testId,
  entries,
  className = '',
}: ActivityTimelineProps): JSX.Element {
  return (
    <div data-testid={testId} className={className}>
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          data-testid={`${testId}-entry-${entry.id}`}
          className="flex gap-4 pb-6 relative"
        >
          {/* Vertical line */}
          {i < entries.length - 1 && (
            <div className="absolute left-4 top-8 bottom-0 w-px bg-white/10" />
          )}

          {/* Icon circle */}
          <div
            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${getTypeColor(entry.type)}`}
          >
            {getTypeIcon(entry.type)}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">{entry.user}</span>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(entry.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{entry.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
