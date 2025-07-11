'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createCheckoutSession, subscriptionPlans } from '@/lib/tap-service';
import { X, Crown, Check, Star, Zap } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tap/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          planId: 'premium_monthly',
          userName: user.displayName || 'مستخدم'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // توجيه المستخدم لصفحة الدفع
      window.location.href = url;
    } catch (error: any) {
      console.error('Subscription error:', error);
      setError('حدث خطأ أثناء معالجة الاشتراك. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Crown className="w-8 h-8 text-yellow-500 mr-2" />
            اختر خطة الاشتراك
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* الخطة المجانية */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <div className="text-center mb-4">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-gray-900">
                الخطة المجانية
              </h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">مجاني</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {['أول 5 اختبارات مجانية', 'الوصول للاختبارات الأساسية', 'دعم محدود'].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="text-center">
              <div className="bg-gray-100 text-gray-600 py-2 px-4 rounded-md">
                خطتك الحالية
              </div>
            </div>
          </div>

          {/* الخطة المميزة */}
          <div className="border-2 border-yellow-400 rounded-lg p-6 relative bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                الأكثر شعبية
              </span>
            </div>

            <div className="text-center mb-4">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-gray-900">
                {subscriptionPlans[0].name}
              </h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {subscriptionPlans[0].price}
                </span>
                <span className="text-gray-600 mr-1">ريال/شهر</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                يتم الدفع شهرياً • يمكن الإلغاء في أي وقت
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {subscriptionPlans[0].features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-md hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 font-semibold flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  اشترك الآن
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              💳 وسائل الدفع المتاحة
            </h4>
            <p className="text-blue-800 text-sm">
              فيزا • ماستركارد • مدى • Apple Pay • Google Pay
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            بالاشتراك، أنت توافق على{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800">
              الشروط والأحكام
            </a>{' '}
            و{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800">
              سياسة الخصوصية
            </a>
            . يمكنك إلغاء الاشتراك في أي وقت.
          </p>
        </div>
      </div>
    </div>
  );
}
