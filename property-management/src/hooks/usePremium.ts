'use client';

import { useAuth } from '@/context/AuthContext';
import { useProperties } from './useProperties';

// Free tier limits
export const FREE_TIER_LIMITS = {
  maxProperties: 3,
  maxUnitsPerProperty: 10,
  maxTotalUnits: 30,
  maxContracts: 10,
  maxFileUploadSizeMB: 5,
  features: {
    bulkUpload: false,
    contractPDF: false,
    financialReports: false,
    advancedAnalytics: false,
    backgroundCheck: false,
    chatExport: false,
    prioritySupport: false,
    vacancyPrediction: false,
    customBranding: false,
  }
};

export const PREMIUM_LIMITS = {
  maxProperties: Infinity,
  maxUnitsPerProperty: Infinity,
  maxTotalUnits: Infinity,
  maxContracts: Infinity,
  maxFileUploadSizeMB: 50,
  features: {
    bulkUpload: true,
    contractPDF: true,
    financialReports: true,
    advancedAnalytics: true,
    backgroundCheck: true,
    chatExport: true,
    prioritySupport: true,
    vacancyPrediction: true,
    customBranding: true,
  }
};

export type PremiumFeature = keyof typeof FREE_TIER_LIMITS.features;

export function usePremium() {
  const { isPremium, profile } = useAuth();
  const { stats } = useProperties();

  const limits = isPremium ? PREMIUM_LIMITS : FREE_TIER_LIMITS;

  // Check if user can add more properties
  const canAddProperty = () => {
    if (isPremium) return { allowed: true, reason: null };
    const current = stats?.totalProperties || 0;
    if (current >= FREE_TIER_LIMITS.maxProperties) {
      return {
        allowed: false,
        reason: `Free plan limited to ${FREE_TIER_LIMITS.maxProperties} properties. Upgrade to Premium for unlimited.`
      };
    }
    return { allowed: true, reason: null };
  };

  // Check if user can add more units
  const canAddUnit = (currentPropertyUnits: number = 0) => {
    if (isPremium) return { allowed: true, reason: null };

    const totalUnits = stats?.totalUnits || 0;

    if (totalUnits >= FREE_TIER_LIMITS.maxTotalUnits) {
      return {
        allowed: false,
        reason: `Free plan limited to ${FREE_TIER_LIMITS.maxTotalUnits} total units. Upgrade to Premium for unlimited.`
      };
    }

    if (currentPropertyUnits >= FREE_TIER_LIMITS.maxUnitsPerProperty) {
      return {
        allowed: false,
        reason: `Free plan limited to ${FREE_TIER_LIMITS.maxUnitsPerProperty} units per property. Upgrade to Premium for unlimited.`
      };
    }

    return { allowed: true, reason: null };
  };

  // Check if a specific feature is available
  const hasFeature = (feature: PremiumFeature): boolean => {
    return limits.features[feature];
  };

  // Get remaining quota
  const getRemainingQuota = () => {
    if (isPremium) {
      return {
        properties: Infinity,
        units: Infinity,
        contracts: Infinity
      };
    }

    return {
      properties: Math.max(0, FREE_TIER_LIMITS.maxProperties - (stats?.totalProperties || 0)),
      units: Math.max(0, FREE_TIER_LIMITS.maxTotalUnits - (stats?.totalUnits || 0)),
      contracts: FREE_TIER_LIMITS.maxContracts // Would need to track this
    };
  };

  // Check file size limit
  const checkFileSize = (fileSizeMB: number) => {
    const maxSize = isPremium ? PREMIUM_LIMITS.maxFileUploadSizeMB : FREE_TIER_LIMITS.maxFileUploadSizeMB;
    if (fileSizeMB > maxSize) {
      return {
        allowed: false,
        reason: `File size exceeds ${maxSize}MB limit. ${!isPremium ? 'Upgrade to Premium for 50MB uploads.' : ''}`
      };
    }
    return { allowed: true, reason: null };
  };

  return {
    isPremium,
    limits,
    canAddProperty,
    canAddUnit,
    hasFeature,
    getRemainingQuota,
    checkFileSize,
    premiumExpiresAt: profile?.premium_expires_at,
  };
}
