'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers';
import { 
  createSTCSubscription, 
  addSTCPaymentHistory,
  getUserSTCSubscription 
} from '@/lib/subscription-service';
import { stcPayService } from '@/lib/stc-pay';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import {
  CheckCircleIcon,
  CreditCardIcon,
  CalendarIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface PaymentSuccessProps {
  lang: Language;
}

export function PaymentSuccess({ lang }: PaymentSuccessProps) {
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRTL = lang === 'ar';

  useEffect(() => {
    processPaymentSuccess();
  }, [user]);

  const processPaymentSuccess = async () => {
    if (!user) {
      router.push(`/${lang}/auth/login`);
      return;
    }

    try {
      // الحصول على معلومات الدفع من URL parameters أو localStorage
      const transactionId = searchParams.get('transaction_id') || searchParams.get('payment_id');
      const pendingSubscription = localStorage.getItem('pending_subscription');
      
      if (!transactionId || !pendingSubscription) {
        throw new Error('Missing payment information');
      }

      const subscriptionData = JSON.parse(pendingSubscription);
      
      // التحقق من حالة الدفع مع STC Pay
      const paymentStatus = await stcPayService.checkPaymentStatus(transactionId);
      
      if (paymentStatus.status !== 'completed') {
        throw new Error('Payment not completed');
      }

      // الحصول على تفاصيل الخطة
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscriptionData.planId);
      if (!plan) {
        throw new Error('Invalid plan');
      }

      // إنشاء الاشتراك في قاعدة البيانات
      const startDate = new Date();
      const endDate = stcPayService.calculateSubscriptionEndDate(plan, startDate);

      const subscriptionId = await createSTCSubscription({
        userId: user.uid,
        planId: plan.id,
        status: 'active',
        startDate,
        endDate,
        paymentMethod: 'stc_pay',
        transactionId,
        amount: plan.price,
        currency: plan.currency,
        autoRenew: false
      });

      // إضافة سجل الدفع
      await addSTCPaymentHistory({
        userId: user.uid,
        transactionId,
        amount: plan.price,
        currency: plan.currency,
        status: 'completed',
        planId: plan.id,
        paymentMethod: 'stc_pay',
        paidAt: new Date(),
        description: `Subscription to ${plan.name}`,
        descriptionAr: `اشتراك في ${plan.nameAr}`
      });

      // حفظ تفاصيل الاشتراك للعرض
      setSubscriptionDetails({
        plan,
        subscriptionId,
        transactionId,
        startDate,
        endDate,
        amount: plan.price,
        currency: plan.currency
      });

      setSuccess(true);
      
      // مسح البيانات المؤقتة
      localStorage.removeItem('pending_subscription');

    } catch (error) {
      console.error('Payment processing error:', error);
      setError(isRTL ? 'حدث خطأ في معالجة الدفع' : 'Payment processing error');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return stcPayService.formatPrice(amount, currency, isRTL ? 'ar-SA' : 'en-US');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (processing) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {isRTL ? 'جاري معالجة الدفع...' : 'Processing payment...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">
              {isRTL ? 'خطأ في الدفع' : 'Payment Error'}
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={() => router.push(`/${lang}/subscription`)}
                className="w-full"
              >
                {isRTL ? 'العودة للخطط' : 'Back to Plans'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push(`/${lang}/dashboard`)}
                className="w-full"
              >
                {isRTL ? 'لوحة التحكم' : 'Dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-background dark:to-green-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {isRTL ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isRTL 
                ? 'تهانينا! تم تفعيل اشتراكك بنجاح'
                : 'Congratulations! Your subscription has been activated successfully'
              }
            </p>
          </div>

          {/* Subscription Details */}
          {subscriptionDetails && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <span>{isRTL ? 'تفاصيل الاشتراك' : 'Subscription Details'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'الخطة' : 'Plan'}
                    </label>
                    <p className="text-lg font-semibold">
                      {isRTL ? subscriptionDetails.plan.nameAr : subscriptionDetails.plan.name}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'المبلغ المدفوع' : 'Amount Paid'}
                    </label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatPrice(subscriptionDetails.amount, subscriptionDetails.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'تاريخ البداية' : 'Start Date'}
                    </label>
                    <p className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(subscriptionDetails.startDate)}</span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'تاريخ الانتهاء' : 'End Date'}
                    </label>
                    <p className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(subscriptionDetails.endDate)}</span>
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? 'رقم المعاملة' : 'Transaction ID'}
                  </label>
                  <p className="text-sm text-gray-600 font-mono">
                    {subscriptionDetails.transactionId}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={() => router.push(`/${lang}/dashboard`)}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <span>{isRTL ? 'انتقل إلى لوحة التحكم' : 'Go to Dashboard'}</span>
              <ArrowRightIcon className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push(`/${lang}/tests`)}
              className="w-full"
            >
              {isRTL ? 'ابدأ اختبار جديد' : 'Start New Test'}
            </Button>
          </div>

          {/* Thank You Message */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-blue-800 dark:text-blue-200">
              {isRTL 
                ? 'شكراً لك على ثقتك بنا! نتطلع لخدمتك بأفضل ما لدينا'
                : 'Thank you for your trust! We look forward to serving you with our best'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
