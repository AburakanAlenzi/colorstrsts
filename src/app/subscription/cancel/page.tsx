'use client';

import React from 'react';
import Link from 'next/link';
import { XCircleIcon, ArrowRightIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            تم إلغاء العملية
          </h1>
          <p className="text-gray-600">
            لم يتم إتمام عملية الاشتراك. لا تقلق، لم يتم خصم أي مبلغ من حسابك.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">لا تزال تحصل على:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ أول 5 اختبارات مجانية</li>
            <li>✅ الوصول للاختبارات الأساسية</li>
            <li>✅ دعم محدود</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 هل تعلم؟</h3>
          <p className="text-sm text-yellow-700">
            مع الاشتراك المميز ستحصل على وصول غير محدود لأكثر من 18 اختبار متقدم 
            مقابل 29 ريال فقط شهرياً.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/subscription"
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 flex items-center justify-center"
          >
            <CreditCardIcon className="w-5 h-5 ml-2" />
            جرب الاشتراك مرة أخرى
          </Link>
          
          <Link
            href="/tests"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            استخدم الاختبارات المجانية
            <ArrowRightIcon className="w-5 h-5 mr-2" />
          </Link>
          
          <Link
            href="/"
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 flex items-center justify-center"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            إذا واجهت أي مشاكل في عملية الدفع، يرجى{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800">
              التواصل معنا
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
