'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { useAuth } from '@/components/providers';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { getUserSTCSubscription, isSTCSubscriptionValid } from '@/lib/subscription-service';
import { UserSubscription } from '@/types/subscription';
import {
  BeakerIcon,
  StarIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface UserStatsProps {
  lang: Language;
}

interface UserTestStats {
  totalTests: number;
  freeTestsUsed: number;
  freeTestsRemaining: number;
  isSubscribed: boolean;
  subscriptionType?: string;
  lastTestDate?: string;
}

interface ExtendedUserStats extends UserTestStats {
  subscription?: UserSubscription | null;
  subscriptionValid?: boolean;
}

export function UserStats({ lang }: UserStatsProps) {
  const { user } = useAuth();
  const t = getTranslationsSync(lang);
  const [stats, setStats] = useState<ExtendedUserStats>({
    totalTests: 0,
    freeTestsUsed: 0,
    freeTestsRemaining: 5,
    isSubscribed: false,
    subscription: null,
    subscriptionValid: false
  });

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // جلب اشتراك المستخدم
      const subscription = await getUserSTCSubscription(user.uid);
      const subscriptionValid = await isSTCSubscriptionValid(user.uid);

      // بيانات تجريبية - يمكن استبدالها بجلب البيانات الفعلية
      const mockStats: ExtendedUserStats = {
        totalTests: 12,
        freeTestsUsed: 3,
        freeTestsRemaining: subscription && subscriptionValid ? -1 : 2, // -1 للاشتراك المميز
        isSubscribed: subscriptionValid,
        subscriptionType: subscription?.planId,
        lastTestDate: '2024-01-15',
        subscription,
        subscriptionValid
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      // استخدام البيانات الافتراضية في حالة الخطأ
      setStats({
        totalTests: 0,
        freeTestsUsed: 0,
        freeTestsRemaining: 5,
        isSubscribed: false,
        subscription: null,
        subscriptionValid: false
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubscriptionBadge = () => {
    if (stats.isSubscribed) {
      return (
        <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          <StarIcon className="h-4 w-4" />
          <span>{lang === 'ar' ? 'مشترك مميز' : 'Premium Member'}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
          <StarIcon className="h-4 w-4" />
          <span>{lang === 'ar' ? 'مستخدم مجاني' : 'Free User'}</span>
        </div>
      );
    }
  };

  const getFreeTestsProgress = () => {
    const used = stats.freeTestsUsed;
    const total = 5; // العدد الإجمالي للاختبارات المجانية
    const percentage = (used / total) * 100;
    
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {lang === 'ar' ? 'الاختبارات المجانية المستخدمة' : 'Free Tests Used'}
          </span>
          <span className="font-medium">
            {used} / {total}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.freeTestsRemaining > 0 
            ? (lang === 'ar' 
                ? `${stats.freeTestsRemaining} اختبارات متبقية` 
                : `${stats.freeTestsRemaining} tests remaining`)
            : (lang === 'ar' 
                ? 'لا توجد اختبارات مجانية متبقية' 
                : 'No free tests remaining')
          }
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
            <ChartBarIcon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {lang === 'ar' ? 'إحصائياتك' : 'Your Stats'}
          </h2>
        </div>
        {getSubscriptionBadge()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* إجمالي الاختبارات */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-lg flex items-center justify-center">
              <BeakerIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                {stats.totalTests}
              </p>
              <p className="text-sm text-primary-600 dark:text-primary-400">
                {lang === 'ar' ? 'إجمالي الاختبارات' : 'Total Tests'}
              </p>
            </div>
          </div>
        </div>

        {/* الاختبارات المجانية */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
              <StarSolidIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.freeTestsRemaining}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {lang === 'ar' ? 'اختبارات مجانية متبقية' : 'Free Tests Left'}
              </p>
            </div>
          </div>
          {getFreeTestsProgress()}
        </div>

        {/* آخر اختبار */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {stats.lastTestDate ? formatDate(stats.lastTestDate) : '--'}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {lang === 'ar' ? 'آخر اختبار' : 'Last Test'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* إجراءات سريعة */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={`/${lang}/tests`}>
              <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'اختبار جديد' : 'New Test'}
            </a>
          </Button>
          
          <Button variant="outline" asChild>
            <a href={`/${lang}/results`}>
              <ChartBarIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'عرض النتائج' : 'View Results'}
            </a>
          </Button>
          
          {/* أزرار الاشتراك للمستخدمين العاديين فقط */}
          {user && !user.email?.includes('admin') && (
            <>
              {!stats.isSubscribed && stats.freeTestsRemaining <= 1 && (
                <Button
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                  onClick={() => window.location.href = `/${lang}/subscription`}
                >
                  <StarIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {lang === 'ar' ? 'ترقية للمميز' : 'Upgrade to Premium'}
                </Button>
              )}

              {stats.isSubscribed && stats.subscription && (
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                  onClick={() => window.location.href = `/${lang}/subscription`}
                >
                  <CreditCardIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {lang === 'ar' ? 'إدارة الاشتراك' : 'Manage Subscription'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* معلومات الاشتراك الحالي */}
      {stats.isSubscribed && stats.subscription && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <ShieldCheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {lang === 'ar' ? 'اشتراك نشط' : 'Active Subscription'}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {lang === 'ar'
                    ? `ينتهي في: ${stats.subscription.endDate.toLocaleDateString('ar-SA')}`
                    : `Expires: ${stats.subscription.endDate.toLocaleDateString('en-US')}`
                  }
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-400"
              onClick={() => window.location.href = `/${lang}/subscription`}
            >
              {lang === 'ar' ? 'إدارة' : 'Manage'}
            </Button>
          </div>
        </div>
      )}

      {/* تحذير نفاد الاختبارات المجانية */}
      {!stats.isSubscribed && stats.freeTestsRemaining === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <StarIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                {lang === 'ar' ? 'نفدت الاختبارات المجانية!' : 'Free tests exhausted!'}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {lang === 'ar'
                  ? 'اشترك في الخطة المميزة للحصول على اختبارات غير محدودة'
                  : 'Subscribe to premium plan for unlimited tests'
                }
              </p>
              <Button
                size="sm"
                className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => window.location.href = `/${lang}/subscription`}
              >
                {lang === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
