import type { JSX } from 'react';
import type { Role } from '../../data/entities';

export type UserAvatarSize = 'sm' | 'md' | 'lg';

export interface UserAvatarProps {
  'data-testid': string;
  fullName: string;
  avatarColor: string;
  role?: Role | null;
  size?: UserAvatarSize;
  className?: string;
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleLabel(role: Role): string {
  switch (role) {
    case 'qa_lead':
      return 'Lead';
    case 'admin':
      return 'Admin';
    case 'tester':
      return 'Test';
  }
}

export default function UserAvatar({
  'data-testid': testId,
  fullName,
  avatarColor,
  role,
  size = 'md',
  className = '',
}: UserAvatarProps): JSX.Element {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div data-testid={testId} className={`relative inline-flex ${className}`}>
      <div
        className={`rounded-full flex items-center justify-center font-bold text-white ${sizeClasses[size]}`}
        style={{ backgroundColor: avatarColor }}
      >
        {getInitials(fullName)}
      </div>
      {role && (
        <span
          data-testid={`${testId}-role`}
          className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 border border-white/10 text-gray-300 font-medium"
        >
          {getRoleLabel(role)}
        </span>
      )}
    </div>
  );
}
