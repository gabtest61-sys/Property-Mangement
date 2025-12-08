'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'gradient';
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
  variant = 'default',
}: StatCardProps) {
  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;
  const isNeutral = trend && trend.value === 0;

  return (
    <div
      className={cn(
        'rounded-xl p-4 md:p-5 transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900/30',
        variant === 'default' && 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        variant === 'primary' && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30',
        variant === 'gradient' && 'bg-gradient-to-br from-blue-500 to-blue-700 text-white',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium mb-1',
              variant === 'gradient' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'text-2xl md:text-3xl font-bold tracking-tight',
              variant === 'gradient' ? 'text-white' : 'text-gray-900 dark:text-gray-100'
            )}
          >
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive && (
                <TrendingUp
                  className={cn(
                    'h-4 w-4',
                    variant === 'gradient' ? 'text-green-300' : 'text-green-500'
                  )}
                />
              )}
              {isNegative && (
                <TrendingDown
                  className={cn(
                    'h-4 w-4',
                    variant === 'gradient' ? 'text-red-300' : 'text-red-500'
                  )}
                />
              )}
              {isNeutral && (
                <Minus
                  className={cn(
                    'h-4 w-4',
                    variant === 'gradient' ? 'text-blue-200' : 'text-gray-400'
                  )}
                />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  variant === 'gradient'
                    ? isPositive
                      ? 'text-green-300'
                      : isNegative
                      ? 'text-red-300'
                      : 'text-blue-200'
                    : isPositive
                    ? 'text-green-500'
                    : isNegative
                    ? 'text-red-500'
                    : 'text-gray-500'
                )}
              >
                {isPositive && '+'}
                {trend.value}%
              </span>
              {trend.label && (
                <span
                  className={cn(
                    'text-sm',
                    variant === 'gradient' ? 'text-blue-200' : 'text-gray-400'
                  )}
                >
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-2.5 rounded-lg',
              variant === 'gradient'
                ? 'bg-white/20'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
