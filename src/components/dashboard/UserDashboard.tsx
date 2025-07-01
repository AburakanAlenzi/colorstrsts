'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserUsageStats, TestUsage } from '@/lib/subscription-service';
// import { createCustomerPortalSession } from '@/lib/tap-service'; // سيتم تنفيذه لاحقاً
import { 
  User, 
  Crown, 
  Star, 
  Calendar, 
  BarChart3, 
  Settings,
  LogOut,
  TestTube,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface UsageStats {
  freeTestsUsed: number;
  totalTestsUsed: number;
  freeTestsRemaining: number;
  recentTests: TestUsage[];
}

export function UserDashboard() {
  const { user, userProfile, logout } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsageStats = async () => {
      if (!user) return;

      try {
        const stats = await getUserUsageStats(user.uid);
        setUsageStats(stats);
      } catch (error) {
        console.error('Error loading usage stats:', error);
        setError('حدث خطأ في تحميل الإحصائيات');
      } finally {
        setLoading(false);
      }
    };

    loadUsageStats();
  }, [user]);

  const handleManageSubscription = async () => {
    if (!userProfile?.subscription?.tapCustomerId) {
      setError('لا يوجد اشتراك نشط لإدارته');
      return;
    }

    try {
      // Tap لا يوفر Customer Portal مثل Stripe
      // يمكن إضافة صفحة مخصصة لإدارة الاشتراك
      setError('إدارة الاشتراك ستكون متاحة قريباً');
    } catch (error) {
      console.error('Error managing subscription:', error);
      setError('حدث خطأ في إدارة الاشتراك');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd MMMM yyyy - HH:mm', { locale: ar });
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">يجب تسجيل الدخول لعرض لوحة التحكم</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-2 text-gray-600">جاري تحميل البيانات...</span>
      </div>
    );
  }

  const isSubscribed = userProfile?.subscription?.status === 'active' && 
                      userProfile?.subscription?.plan === 'premium';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* رأس الصفحة */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                مرحباً، {userProfile?.displayName || user.email}
              </h1>
              <div className="flex items-center mt-1">
                {isSubscribed ? (
                  <>
                    <Crown className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="text-yellow-600 font-medium">مشترك مميز</span>
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 text-gray-400 mr-1" />
                    <span className="text-gray-600">مستخدم مجاني</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center text-gray-600 hover:text-red-600"
          >
            <LogOut className="w-5 h-5 mr-1" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* إحصائيات الاستخدام */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الاختبارات المجانية</p>
              <p className="text-2xl font-bold text-blue-600">
                {usageStats?.freeTestsRemaining || 0}
              </p>
              <p className="text-xs text-gray-500">متبقية من 5</p>
            </div>
            <Star className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الاختبارات</p>
              <p className="text-2xl font-bold text-green-600">
                {usageStats?.totalTestsUsed || 0}
              </p>
              <p className="text-xs text-gray-500">اختبار مكتمل</p>
            </div>
            <TestTube className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">حالة الاشتراك</p>
              <p className={`text-2xl font-bold ${isSubscribed ? 'text-yellow-600' : 'text-gray-600'}`}>
                {isSubscribed ? 'نشط' : 'غير نشط'}
              </p>
              {isSubscribed && userProfile?.subscription?.currentPeriodEnd && (
                <p className="text-xs text-gray-500">
                  ينتهي: {formatDate(userProfile.subscription.currentPeriodEnd)}
                </p>
              )}
            </div>
            <Crown className={`w-8 h-8 ${isSubscribed ? 'text-yellow-600' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>

      {/* إدارة الاشتراك */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          إدارة الاشتراك
        </h2>
        
        {isSubscribed ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">اشتراك نشط</h3>
              <p className="text-green-700 text-sm">
                لديك وصول كامل لجميع الاختبارات المتقدمة
              </p>
            </div>
            <button
              onClick={handleManageSubscription}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              إدارة الاشتراك والفواتير
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">ترقية للاشتراك المميز</h3>
              <p className="text-yellow-700 text-sm mb-3">
                احصل على وصول غير محدود لجميع الاختبارات مقابل 29 ريال شهرياً
              </p>
              <button className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700">
                اشترك الآن
              </button>
            </div>
          </div>
        )}
      </div>

      {/* آخر الاختبارات */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2" />
          آخر الاختبارات
        </h2>
        
        {usageStats?.recentTests && usageStats.recentTests.length > 0 ? (
          <div className="space-y-3">
            {usageStats.recentTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <TestTube className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{test.testName}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(test.timestamp)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.isFree 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {test.isFree ? 'مجاني' : 'مميز'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            لم تقم بأي اختبارات بعد
          </p>
        )}
      </div>
    </div>
  );
}
