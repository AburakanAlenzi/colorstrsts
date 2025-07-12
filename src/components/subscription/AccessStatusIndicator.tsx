'use client';

import React from 'react';
import { useSubscriptionSettings } from '@/hooks/useSubscriptionSettings';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { LockOpenIcon, LockClosedIcon, StarIcon } from '@heroicons/react/24/outline';

interface AccessStatusIndicatorProps {
  testIndex: number;
  className?: string;
  showText?: boolean;
  isRTL?: boolean;
}

export default function AccessStatusIndicator({
  testIndex,
  className = '',
  showText = true,
  isRTL = false
}: AccessStatusIndicatorProps) {
  const subscriptionData = useSubscriptionSettings();
  const { user, userProfile } = useAuth();

  // Safe access to subscription data with fallbacks
  const settings = subscriptionData?.settings || {
    freeTestsEnabled: true,
    freeTestsCount: 5,
    premiumRequired: false,
    globalFreeAccess: true,
    specificPremiumTests: []
  };
  const loading = subscriptionData?.loading || false;

  if (loading) {
    return (
      <Badge variant="secondary" className={className}>
        <div className="animate-pulse">...</div>
      </Badge>
    );
  }

  // Check if global free access is enabled
  if (settings.globalFreeAccess) {
    return (
      <Badge variant="default" className={`bg-green-100 text-green-800 border-green-200 ${className}`}>
        <LockOpenIcon className="h-3 w-3 mr-1" />
        {showText && (isRTL ? 'مجاني للجميع' : 'Free for All')}
      </Badge>
    );
  }

  // Check if user has premium
  const userHasPremium = userProfile?.subscription?.status === 'active' && 
                        userProfile?.subscription?.plan === 'premium';

  // Check if this specific test requires premium
  if (settings.specificPremiumTests.includes(testIndex + 1)) {
    if (userHasPremium) {
      return (
        <Badge variant="default" className={`bg-purple-100 text-purple-800 border-purple-200 ${className}`}>
          <StarIcon className="h-3 w-3 mr-1" />
          {showText && (isRTL ? 'مميز - متاح' : 'Premium - Available')}
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className={className}>
          <LockClosedIcon className="h-3 w-3 mr-1" />
          {showText && (isRTL ? 'يتطلب اشتراك مميز' : 'Premium Required')}
        </Badge>
      );
    }
  }

  // Check free tests limit
  if (settings.freeTestsEnabled && testIndex < settings.freeTestsCount) {
    return (
      <Badge variant="default" className={`bg-blue-100 text-blue-800 border-blue-200 ${className}`}>
        <LockOpenIcon className="h-3 w-3 mr-1" />
        {showText && (isRTL ? 'مجاني' : 'Free')}
      </Badge>
    );
  }

  // Check if premium is required for advanced tests
  if (settings.premiumRequired && testIndex >= settings.freeTestsCount) {
    if (userHasPremium) {
      return (
        <Badge variant="default" className={`bg-purple-100 text-purple-800 border-purple-200 ${className}`}>
          <StarIcon className="h-3 w-3 mr-1" />
          {showText && (isRTL ? 'مميز - متاح' : 'Premium - Available')}
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className={className}>
          <LockClosedIcon className="h-3 w-3 mr-1" />
          {showText && (isRTL ? 'يتطلب اشتراك مميز' : 'Premium Required')}
        </Badge>
      );
    }
  }

  // Default - accessible
  return (
    <Badge variant="default" className={`bg-green-100 text-green-800 border-green-200 ${className}`}>
      <LockOpenIcon className="h-3 w-3 mr-1" />
      {showText && (isRTL ? 'متاح' : 'Available')}
    </Badge>
  );
}
