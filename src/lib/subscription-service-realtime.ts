/**
 * Subscription Service using Firebase Realtime Database
 * خدمة الاشتراكات باستخدام Firebase Realtime Database
 */

import { getSubscriptionSettings, SubscriptionSettings } from './firebase-realtime';

export interface TestAccessResult {
  hasAccess: boolean;
  reason: 'global_free' | 'free_quota' | 'premium' | 'blocked';
  remainingFreeTests?: number;
  message?: string;
}

/**
 * Check if a user has access to a specific test
 * فحص إذا كان المستخدم لديه وصول لاختبار محدد
 */
export async function checkTestAccess(
  testIndex: number,
  userHasPremium: boolean = false,
  userFreeTestsUsed: number = 0
): Promise<TestAccessResult> {
  try {
    // Get current subscription settings from Firebase
    const settings = await getSubscriptionSettings();
    
    console.log('🔍 Checking test access:', {
      testIndex,
      userHasPremium,
      userFreeTestsUsed,
      settings
    });

    // Check if global free access is enabled
    if (settings.globalFreeAccess) {
      console.log('✅ Global free access enabled - granting access');
      return {
        hasAccess: true,
        reason: 'global_free',
        message: 'Global free access enabled'
      };
    }

    // Check if user has premium subscription
    if (userHasPremium) {
      console.log('✅ User has premium - granting access');
      return {
        hasAccess: true,
        reason: 'premium',
        message: 'Premium subscription active'
      };
    }

    // Check if this test is in the specific premium tests list
    if (settings.specificPremiumTests && settings.specificPremiumTests.includes(testIndex)) {
      console.log('❌ Test requires premium subscription');
      return {
        hasAccess: false,
        reason: 'blocked',
        message: 'This test requires premium subscription'
      };
    }

    // Check free tests quota
    if (settings.freeTestsEnabled) {
      const remainingTests = Math.max(0, settings.freeTestsCount - userFreeTestsUsed);
      
      if (remainingTests > 0) {
        console.log('✅ Free test quota available - granting access');
        return {
          hasAccess: true,
          reason: 'free_quota',
          remainingFreeTests: remainingTests - 1,
          message: `${remainingTests} free tests remaining`
        };
      } else {
        console.log('❌ Free test quota exhausted');
        return {
          hasAccess: false,
          reason: 'blocked',
          message: 'Free test quota exhausted. Upgrade to premium for unlimited access.'
        };
      }
    }

    // If free tests are disabled and no premium
    console.log('❌ Free tests disabled and no premium');
    return {
      hasAccess: false,
      reason: 'blocked',
      message: 'Premium subscription required'
    };

  } catch (error) {
    console.error('Error checking test access:', error);
    
    // Fallback: allow limited free access if Firebase fails
    const remainingTests = Math.max(0, 5 - userFreeTestsUsed);
    if (remainingTests > 0) {
      return {
        hasAccess: true,
        reason: 'free_quota',
        remainingFreeTests: remainingTests - 1,
        message: 'Fallback: Limited free access'
      };
    }
    
    return {
      hasAccess: false,
      reason: 'blocked',
      message: 'Service temporarily unavailable'
    };
  }
}

/**
 * Get current subscription settings
 * الحصول على إعدادات الاشتراك الحالية
 */
export async function getCurrentSubscriptionSettings(): Promise<SubscriptionSettings> {
  try {
    return await getSubscriptionSettings();
  } catch (error) {
    console.error('Error getting subscription settings:', error);
    
    // Return default settings as fallback
    return {
      freeTestsEnabled: true,
      freeTestsCount: 5,
      premiumRequired: true,
      globalFreeAccess: false,
      specificPremiumTests: []
    };
  }
}

/**
 * Check if all tests are free (global free access)
 * فحص إذا كانت جميع الاختبارات مجانية
 */
export async function areAllTestsFree(): Promise<boolean> {
  try {
    const settings = await getSubscriptionSettings();
    return settings.globalFreeAccess === true;
  } catch (error) {
    console.error('Error checking if all tests are free:', error);
    return false;
  }
}

/**
 * Get user's test usage from localStorage
 * الحصول على استخدام المستخدم للاختبارات من localStorage
 */
export function getUserTestUsage(): { freeTestsUsed: number; totalTestsUsed: number } {
  if (typeof window === 'undefined') {
    return { freeTestsUsed: 0, totalTestsUsed: 0 };
  }

  try {
    const testResults = JSON.parse(localStorage.getItem('test_results') || '[]');
    const freeTestsUsed = testResults.filter((result: any) => !result.isPremium).length;
    const totalTestsUsed = testResults.length;

    return { freeTestsUsed, totalTestsUsed };
  } catch (error) {
    console.error('Error getting user test usage:', error);
    return { freeTestsUsed: 0, totalTestsUsed: 0 };
  }
}

/**
 * Record test usage
 * تسجيل استخدام الاختبار
 */
export function recordTestUsage(testId: string, isPremium: boolean = false): void {
  if (typeof window === 'undefined') return;

  try {
    const testResults = JSON.parse(localStorage.getItem('test_results') || '[]');
    
    const newResult = {
      id: `test-${Date.now()}`,
      testId,
      timestamp: new Date().toISOString(),
      isPremium
    };

    testResults.push(newResult);
    localStorage.setItem('test_results', JSON.stringify(testResults));

    console.log('📊 Test usage recorded:', newResult);
  } catch (error) {
    console.error('Error recording test usage:', error);
  }
}

/**
 * Listen for subscription settings changes
 * الاستماع لتغييرات إعدادات الاشتراك
 */
export function listenForSubscriptionChanges(callback: (settings: SubscriptionSettings) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleSettingsUpdate = (event: CustomEvent) => {
    callback(event.detail);
  };

  window.addEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);

  return () => {
    window.removeEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);
  };
}
