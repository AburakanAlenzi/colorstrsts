'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { canAccessTest, recordTestUsage } from '@/lib/subscription-service';
import { useSubscriptionSettings } from '@/hooks/useSubscriptionSettings';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { SubscriptionModal } from './SubscriptionModal';
import { Lock, Star, Crown } from 'lucide-react';

interface TestAccessGuardProps {
  testIndex: number;
  testId: string;
  testName: string;
  children: React.ReactNode;
  onAccessGranted?: () => void;
}

export function TestAccessGuard({
  testIndex,
  testId,
  testName,
  children,
  onAccessGranted
}: TestAccessGuardProps) {
  const { user, userProfile } = useAuth();
  const { settings, loading: settingsLoading } = useSubscriptionSettings();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [accessStatus, setAccessStatus] = useState<{
    canAccess: boolean;
    reason?: string;
    requiresSubscription?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // التحقق من إمكانية الوصول
  useEffect(() => {
    const checkAccess = async () => {
      // Wait for settings to load
      if (settingsLoading) {
        return;
      }

      // If global free access is enabled, allow all tests immediately
      if (settings.globalFreeAccess) {
        setAccessStatus({ canAccess: true, reason: 'Global free access enabled' });
        setLoading(false);
        return;
      }

      if (!user) {
        setAccessStatus({ canAccess: false, reason: 'Login required' });
        setLoading(false);
        return;
      }

      try {
        const access = await canAccessTest(user.uid, testIndex);
        setAccessStatus(access);
      } catch (error) {
        console.error('Error checking test access:', error);
        setAccessStatus({ canAccess: false, reason: 'Error checking access' });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, testIndex, userProfile, settings, settingsLoading]);

  // تسجيل استخدام الاختبار عند الوصول
  const handleAccessTest = async () => {
    if (!user || !accessStatus?.canAccess) return;

    try {
      const isFreeTest = testIndex < 5;
      await recordTestUsage(user.uid, testId, testName, isFreeTest);
      onAccessGranted?.();
    } catch (error) {
      console.error('Error recording test usage:', error);
    }
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-2 text-gray-600">جاري التحقق من الصلاحيات...</span>
      </div>
    );
  }

  // إذا كان المستخدم يمكنه الوصول للاختبار
  if (accessStatus?.canAccess) {
    return (
      <div onClick={handleAccessTest}>
        {children}
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل دخول
  if (!user) {
    return (
      <>
        <div className="relative">
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                تسجيل الدخول مطلوب
              </h3>
              <p className="text-gray-600 mb-4">
                يجب تسجيل الدخول للوصول إلى الاختبارات
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  إنشاء حساب جديد
                </button>
              </div>
            </div>
          </div>
          <div className="filter blur-sm pointer-events-none">
            {children}
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />

        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      </>
    );
  }

  // إذا كان الاختبار يتطلب اشتراك مميز
  if (accessStatus?.requiresSubscription) {
    // Get current settings to show accurate information
    const settings = typeof window !== 'undefined' ?
      (() => {
        try {
          const saved = localStorage.getItem('subscription_settings');
          return saved ? JSON.parse(saved) : { freeTestsCount: 5 };
        } catch {
          return { freeTestsCount: 5 };
        }
      })() : { freeTestsCount: 5 };

    const isFreeTest = testIndex < settings.freeTestsCount;
    
    return (
      <>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 bg-opacity-95 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm border-2 border-yellow-200">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                اشتراك مميز مطلوب
              </h3>
              <p className="text-gray-600 mb-2">
                هذا الاختبار متاح للمشتركين المميزين فقط
              </p>
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <p className="text-sm text-blue-800">
                  <Star className="w-4 h-4 inline mr-1" />
                  أول {settings.freeTestsCount} اختبارات مجانية للجميع
                </p>
                <p className="text-sm text-blue-800">
                  <Crown className="w-4 h-4 inline mr-1" />
                  الاختبارات المتقدمة تتطلب اشتراك (29 ريال/شهر)
                </p>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-orange-600 font-semibold"
              >
                اشترك الآن - 29 ريال/شهر
              </button>
            </div>
          </div>
          <div className="filter blur-sm pointer-events-none">
            {children}
          </div>
        </div>

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </>
    );
  }

  // حالة خطأ عامة
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-red-50 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm border-2 border-red-200">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            غير متاح
          </h3>
          <p className="text-gray-600 mb-4">
            {accessStatus?.reason || 'لا يمكن الوصول إلى هذا الاختبار حالياً'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>
    </div>
  );
}
