'use client';

import { useState, useEffect } from 'react';
import {
  checkTestAccess,
  getCurrentSubscriptionSettings,
  areAllTestsFree,
  getUserTestUsage,
  recordTestUsage,
  listenForSubscriptionChanges,
  TestAccessResult
} from '@/lib/subscription-service-realtime';
import { SubscriptionSettings } from '@/lib/firebase-realtime';

export interface UseTestAccessReturn {
  // Test access checking
  checkAccess: (testIndex: number) => Promise<TestAccessResult>;
  
  // Current settings
  settings: SubscriptionSettings | null;
  allTestsFree: boolean;
  
  // User usage
  freeTestsUsed: number;
  totalTestsUsed: number;
  remainingFreeTests: number;
  
  // Actions
  recordUsage: (testId: string, isPremium?: boolean) => void;
  refreshUsage: () => void;
  
  // State
  loading: boolean;
  error: string | null;
}

export function useTestAccess(): UseTestAccessReturn {
  const [settings, setSettings] = useState<SubscriptionSettings | null>(null);
  const [allTestsFree, setAllTestsFree] = useState(false);
  const [freeTestsUsed, setFreeTestsUsed] = useState(0);
  const [totalTestsUsed, setTotalTestsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate remaining free tests
  const remainingFreeTests = Math.max(0, (settings?.freeTestsCount || 5) - freeTestsUsed);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load subscription settings
        const currentSettings = await getCurrentSubscriptionSettings();
        setSettings(currentSettings);

        // Check if all tests are free
        const globalFree = await areAllTestsFree();
        setAllTestsFree(globalFree);

        // Load user usage
        const usage = getUserTestUsage();
        setFreeTestsUsed(usage.freeTestsUsed);
        setTotalTestsUsed(usage.totalTestsUsed);

        console.log('🔄 Test access data loaded:', {
          settings: currentSettings,
          allTestsFree: globalFree,
          usage
        });

      } catch (err) {
        console.error('Error loading test access data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Listen for subscription settings changes
  useEffect(() => {
    const unsubscribe = listenForSubscriptionChanges((newSettings) => {
      console.log('🔄 Subscription settings updated:', newSettings);
      setSettings(newSettings);
      setAllTestsFree(newSettings.globalFreeAccess);
    });

    return unsubscribe;
  }, []);

  // Check test access
  const checkAccess = async (testIndex: number): Promise<TestAccessResult> => {
    try {
      // For now, assume user doesn't have premium (can be extended later)
      const userHasPremium = false;
      
      const result = await checkTestAccess(testIndex, userHasPremium, freeTestsUsed);
      
      console.log('🔍 Test access check result:', {
        testIndex,
        result
      });

      return result;
    } catch (err) {
      console.error('Error checking test access:', err);
      return {
        hasAccess: false,
        reason: 'blocked',
        message: 'Error checking access'
      };
    }
  };

  // Record test usage
  const recordUsage = (testId: string, isPremium: boolean = false) => {
    try {
      recordTestUsage(testId, isPremium);
      
      // Update local state
      const newUsage = getUserTestUsage();
      setFreeTestsUsed(newUsage.freeTestsUsed);
      setTotalTestsUsed(newUsage.totalTestsUsed);

      console.log('📊 Test usage updated:', newUsage);
    } catch (err) {
      console.error('Error recording test usage:', err);
    }
  };

  // Refresh usage data
  const refreshUsage = () => {
    try {
      const usage = getUserTestUsage();
      setFreeTestsUsed(usage.freeTestsUsed);
      setTotalTestsUsed(usage.totalTestsUsed);

      console.log('🔄 Usage data refreshed:', usage);
    } catch (err) {
      console.error('Error refreshing usage:', err);
    }
  };

  return {
    // Test access checking
    checkAccess,
    
    // Current settings
    settings,
    allTestsFree,
    
    // User usage
    freeTestsUsed,
    totalTestsUsed,
    remainingFreeTests,
    
    // Actions
    recordUsage,
    refreshUsage,
    
    // State
    loading,
    error
  };
}
