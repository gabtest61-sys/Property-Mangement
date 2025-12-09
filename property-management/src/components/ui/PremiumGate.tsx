'use client';

import { ReactNode } from 'react';
import { Crown, Lock } from 'lucide-react';
import { usePremium, PremiumFeature } from '@/hooks/usePremium';
import { Button } from './Button';
import { Card } from './Card';
import Link from 'next/link';

interface PremiumGateProps {
  feature: PremiumFeature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  inline?: boolean;
}

export function PremiumGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  inline = false,
}: PremiumGateProps) {
  const { hasFeature, isPremium } = usePremium();

  if (hasFeature(feature) || isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <Crown className="h-4 w-4" />
        <span className="text-sm font-medium">Premium</span>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
      <div className="text-center py-6">
        <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Premium Feature
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm mx-auto">
          This feature is available for Premium members. Upgrade to unlock unlimited access.
        </p>
        <Link href="/settings?section=billing">
          <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        </Link>
      </div>
    </Card>
  );
}

// Premium Badge component
interface PremiumBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumBadge({ className = '', size = 'sm' }: PremiumBadgeProps) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-medium ${sizes[size]} ${className}`}
    >
      <Crown className={iconSizes[size]} />
      Premium
    </span>
  );
}

// Premium Feature Teaser (shows what premium unlocks)
interface PremiumTeaserProps {
  title: string;
  description: string;
  features?: string[];
}

export function PremiumTeaser({ title, description, features = [] }: PremiumTeaserProps) {
  return (
    <Card className="bg-gradient-to-r from-amber-400 to-amber-600 border-none text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-white/20 shrink-0">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-white/90 text-sm mt-1">{description}</p>
            {features.length > 0 && (
              <ul className="mt-2 space-y-1">
                {features.map((feature, index) => (
                  <li key={index} className="text-sm text-white/80 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <Link href="/settings?section=billing">
          <Button className="bg-white text-amber-600 hover:bg-amber-50 shrink-0">
            Upgrade Now
          </Button>
        </Link>
      </div>
    </Card>
  );
}

// Limit Warning component
interface LimitWarningProps {
  current: number;
  max: number;
  type: 'properties' | 'units' | 'contracts';
}

export function LimitWarning({ current, max, type }: LimitWarningProps) {
  const { isPremium } = usePremium();

  if (isPremium || current < max * 0.8) {
    return null;
  }

  const percentage = (current / max) * 100;
  const isAtLimit = current >= max;

  return (
    <div
      className={`p-3 rounded-lg border ${
        isAtLimit
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {type.charAt(0).toUpperCase() + type.slice(1)} Usage
        </span>
        <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : 'text-amber-600'}`}>
          {current} / {max}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit ? 'bg-red-500' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
          You&apos;ve reached your limit.{' '}
          <Link href="/settings?section=billing" className="underline font-medium">
            Upgrade to Premium
          </Link>{' '}
          for unlimited.
        </p>
      )}
    </div>
  );
}
