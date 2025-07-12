'use client';

import { useState, useEffect } from 'react';
import {
  getSubscriptionSettings,
  saveSubscriptionSettings,
  listenToSubscriptionSettings,
  SubscriptionSettings
} from '@/lib/firebase-realtime';

const defaultSettings: SubscriptionSettings = {
  freeTestsEnabled: true,
  freeTestsCount: 5,
  premiumRequired: true,
  globalFreeAccess: false,
  specificPremiumTests: []
};

/**
 * Hook to manage subscription settings
 * Hook لإدارة إعدادات الاشتراكات
 */
export function useSubscriptionSettings() {
  const [settings, setSettings] = useState<SubscriptionSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from Firebase Realtime Database
  const loadSettings = async () => {
    try {
      setLoading(true);
      const firebaseSettings = await getSubscriptionSettings();
      setSettings(firebaseSettings);

      // Also set global settings for immediate access
      if (typeof window !== 'undefined') {
        (window as any).subscriptionSettings = firebaseSettings;
      }
    } catch (error) {
      console.error('Error loading subscription settings from Firebase:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // Listen for settings changes from Firebase
  useEffect(() => {
    loadSettings();

    // Set up real-time listener for Firebase changes
    const unsubscribe = listenToSubscriptionSettings((newSettings) => {
      setSettings(newSettings);

      // Update global settings for immediate access
      if (typeof window !== 'undefined') {
        (window as any).subscriptionSettings = newSettings;

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', {
          detail: newSettings
        }));
      }
    });

    // Listen for custom events (for immediate updates in same tab)
    const handleSettingsUpdate = (e: CustomEvent) => {
      if (e.detail) {
        setSettings(e.detail);
        (window as any).subscriptionSettings = e.detail;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);
      }
    };
  }, []);

  // Function to update settings (for admin use)
  const updateSettings = async (newSettings: SubscriptionSettings) => {
    try {
      setSettings(newSettings);

      // Save to Firebase Realtime Database
      await saveSubscriptionSettings(newSettings);

      if (typeof window !== 'undefined') {
        // Set global settings for immediate access
        (window as any).subscriptionSettings = newSettings;

        // Dispatch custom event to notify other components immediately
        window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', {
          detail: newSettings
        }));
      }
    } catch (error) {
      console.error('Error updating subscription settings:', error);
      throw error;
    }
  };

  // Function to check if a test is accessible based on current settings
  const isTestAccessible = (testIndex: number, userHasPremium: boolean = false): boolean => {
    // If global free access is enabled, all tests are accessible
    if (settings.globalFreeAccess) {
      return true;
    }

    // Check if this specific test requires premium
    if (settings.specificPremiumTests.includes(testIndex + 1)) {
      return userHasPremium;
    }

    // Check free tests limit
    if (settings.freeTestsEnabled && testIndex < settings.freeTestsCount) {
      return true;
    }

    // Check if premium is required for advanced tests
    if (settings.premiumRequired && testIndex >= settings.freeTestsCount) {
      return userHasPremium;
    }

    // Default allow access
    return true;
  };

  // Function to get access status for a test
  const getTestAccessStatus = (testIndex: number, userHasPremium: boolean = false) => {
    const isAccessible = isTestAccessible(testIndex, userHasPremium);
    
    if (isAccessible) {
      return {
        canAccess: true,
        reason: settings.globalFreeAccess ? 'Global free access enabled' : 'Test is accessible'
      };
    }

    if (settings.specificPremiumTests.includes(testIndex + 1)) {
      return {
        canAccess: false,
        reason: 'Premium subscription required for this specific test',
        requiresSubscription: true
      };
    }

    if (testIndex >= settings.freeTestsCount) {
      return {
        canAccess: false,
        reason: 'Premium subscription required for advanced tests',
        requiresSubscription: true
      };
    }

    return {
      canAccess: false,
      reason: 'Access denied'
    };
  };

  return {
    settings,
    loading,
    updateSettings,
    loadSettings,
    isTestAccessible,
    getTestAccessStatus
  };
}

export default useSubscriptionSettings;
