'use client';

import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

function Badge({ className, variant = 'default', size = 'md', dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
        // Variants
        variant === 'default' && 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        variant === 'primary' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        variant === 'success' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        variant === 'warning' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        variant === 'error' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        variant === 'info' && 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
        variant === 'premium' && 'bg-gradient-to-r from-amber-400 to-amber-600 text-white',
        // Sizes
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-sm px-2.5 py-0.5',
        size === 'lg' && 'text-sm px-3 py-1',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'error' && 'bg-red-500',
            variant === 'info' && 'bg-cyan-500',
            variant === 'primary' && 'bg-blue-500',
            variant === 'default' && 'bg-gray-500',
            variant === 'premium' && 'bg-white'
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
