'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-cyan-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export function Avatar({
  src,
  alt,
  name = 'User',
  size = 'md',
  className,
  showOnlineStatus = false,
  isOnline = false,
}: AvatarProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <div
          className={cn(
            'relative rounded-full overflow-hidden bg-gray-100',
            size === 'xs' && 'h-6 w-6',
            size === 'sm' && 'h-8 w-8',
            size === 'md' && 'h-10 w-10',
            size === 'lg' && 'h-12 w-12',
            size === 'xl' && 'h-16 w-16'
          )}
        >
          <Image
            src={src}
            alt={alt || name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full text-white font-medium',
            size === 'xs' && 'h-6 w-6 text-xs',
            size === 'sm' && 'h-8 w-8 text-sm',
            size === 'md' && 'h-10 w-10 text-base',
            size === 'lg' && 'h-12 w-12 text-lg',
            size === 'xl' && 'h-16 w-16 text-xl',
            getColorFromName(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {showOnlineStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            size === 'xs' && 'h-1.5 w-1.5',
            size === 'sm' && 'h-2 w-2',
            size === 'md' && 'h-2.5 w-2.5',
            size === 'lg' && 'h-3 w-3',
            size === 'xl' && 'h-4 w-4',
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}
