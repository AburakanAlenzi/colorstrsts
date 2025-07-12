'use client';

import { useState, useEffect } from 'react';

interface SubscriptionSettings {
  freeTestsEnabled: boolean;
  freeTestsCount: number;
  premiumRequired: boolean;
  globalFreeAccess: boolean;
  specificPremiumTests: number[];
}

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

  // Load settings from localStorage and global window object
  const loadSettings = () => {
    try {
      // Check global settings first (set by admin)
      if (typeof window !== 'undefined' && (window as any).subscriptionSettings) {
        const globalSettings = (window as any).subscriptionSettings;
        setSettings(globalSettings);
        setLoading(false);
        return;
      }

      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('subscription_settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          // Also set global settings for immediate access
          (window as any).subscriptionSettings = parsedSettings;
        }
      }
    } catch (error) {
      console.error('Error loading subscription settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // Listen for settings changes
  useEffect(() => {
    loadSettings();

    // Listen for storage changes (when admin updates settings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'subscription_settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettings(newSettings);
          (window as any).subscriptionSettings = newSettings;
        } catch (error) {
          console.error('Error parsing updated settings:', error);
        }
      }
    };

    // Listen for custom events (when settings are updated in the same tab)
    const handleSettingsUpdate = (e: CustomEvent) => {
      if (e.detail) {
        setSettings(e.detail);
        (window as any).subscriptionSettings = e.detail;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);
      }
    };
  }, []);

  // Function to update settings (for admin use)
  const updateSettings = (newSettings: SubscriptionSettings) => {
    try {
      setSettings(newSettings);
      
      if (typeof window !== 'undefined') {
        // Save to localStorage
        localStorage.setItem('subscription_settings', JSON.stringify(newSettings));
        
        // Set global settings
        (window as any).subscriptionSettings = newSettings;
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', {
          detail: newSettings
        }));
      }
    } catch (error) {
      console.error('Error updating subscription settings:', error);
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
