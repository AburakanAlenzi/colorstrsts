'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SubscriptionSuccessPage() {
  const { refreshUserProfile } = useAuth();

  useEffect(() => {
    // تحديث ملف المستخدم بعد نجاح الاشتراك
    const timer = setTimeout(() => {
      refreshUserProfile();
    }, 2000);

    return () => clearTimeout(timer);
  }, [refreshUserProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            تم الاشتراك بنجاح!
          </h1>
          <p className="text-gray-600">
            مرحباً بك في الخطة المميزة. يمكنك الآن الوصول لجميع الاختبارات المتقدمة.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">ما الذي حصلت عليه:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✅ وصول غير محدود لجميع الاختبارات</li>
            <li>✅ تحديثات دورية للاختبارات</li>
            <li>✅ دعم فني متقدم</li>
            <li>✅ تقارير مفصلة</li>
            <li>✅ حفظ تاريخ الاختبارات</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/tests"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            ابدأ استخدام الاختبارات
            <ArrowRightIcon className="w-5 h-5 mr-2" />
          </Link>
          
          <Link
            href="/dashboard"
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 flex items-center justify-center"
          >
            لوحة التحكم
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            تم إرسال إيصال الدفع إلى بريدك الإلكتروني.
            <br />
            يمكنك إدارة اشتراكك من لوحة التحكم.
          </p>
        </div>
      </div>
    </div>
  );
}
