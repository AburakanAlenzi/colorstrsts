'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { SubscriptionPlan, SUBSCRIPTION_PLANS, UserSubscription } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers';
import { getUserSTCSubscription } from '@/lib/subscription-service';
import { stcPayService } from '@/lib/stc-pay';
import {
  CheckIcon,
  StarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  InfinityIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface SubscriptionPlansProps {
  lang: Language;
}

export function SubscriptionPlans({ lang }: SubscriptionPlansProps) {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const isRTL = lang === 'ar';

  useEffect(() => {
    loadCurrentSubscription();
  }, [user]);

  const loadCurrentSubscription = async () => {
    if (!user) return;
    
    try {
      const subscription = await getUserSTCSubscription(user.uid);
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      router.push(`/${lang}/auth/login`);
      return;
    }

    if (plan.id === 'free') {
      // الخطة المجانية لا تحتاج دفع
      return;
    }

    setProcessingPlan(plan.id);

    try {
      const paymentRequest = {
        amount: plan.price,
        currency: plan.currency,
        description: `Subscription to ${plan.name}`,
        descriptionAr: `اشتراك في ${plan.nameAr}`,
        customerEmail: user.email || '',
        customerName: user.displayName || user.email || '',
        planId: plan.id,
        userId: user.uid,
        returnUrl: `${window.location.origin}/${lang}/subscription/success`,
        cancelUrl: `${window.location.origin}/${lang}/subscription/cancel`
      };

      const response = await stcPayService.createPayment(paymentRequest);

      if (response.success && response.paymentUrl) {
        // حفظ معلومات الدفع في localStorage للمتابعة لاحقاً
        localStorage.setItem('pending_subscription', JSON.stringify({
          planId: plan.id,
          transactionId: response.transactionId,
          amount: plan.price,
          currency: plan.currency
        }));

        // إعادة توجيه لصفحة الدفع
        window.location.href = response.paymentUrl;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(isRTL ? 'حدث خطأ في عملية الدفع' : 'Payment error occurred');
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return stcPayService.formatPrice(price, currency, isRTL ? 'ar-SA' : 'en-US');
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId && currentSubscription?.status === 'active';
  };

  const getPlanButtonText = (plan: SubscriptionPlan) => {
    if (loading) return isRTL ? 'جاري التحميل...' : 'Loading...';
    
    if (plan.id === 'free') {
      return isRTL ? 'الخطة الحالية' : 'Current Plan';
    }
    
    if (isCurrentPlan(plan.id)) {
      return isRTL ? 'الخطة الحالية' : 'Current Plan';
    }
    
    if (processingPlan === plan.id) {
      return isRTL ? 'جاري المعالجة...' : 'Processing...';
    }
    
    return isRTL ? 'اشترك الآن' : 'Subscribe Now';
  };

  const getPlanButtonVariant = (plan: SubscriptionPlan) => {
    if (plan.id === 'free' || isCurrentPlan(plan.id)) {
      return 'outline';
    }
    return plan.isPopular ? 'default' : 'outline';
  };

  const yearlyDiscount = stcPayService.calculateYearlyDiscount();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-background dark:to-blue-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <CreditCardIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {isRTL ? 'خطط الاشتراك' : 'Subscription Plans'}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {isRTL
                ? 'اختر الخطة المناسبة لاحتياجاتك واستمتع بجميع ميزات اختبارات الألوان'
                : 'Choose the perfect plan for your needs and enjoy all color testing features'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Current Subscription Status */}
          {currentSubscription && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    {isRTL ? 'لديك اشتراك نشط' : 'You have an active subscription'}
                  </p>
                  <p className="text-sm text-green-600">
                    {isRTL 
                      ? `ينتهي في: ${currentSubscription.endDate.toLocaleDateString('ar-SA')}`
                      : `Expires on: ${currentSubscription.endDate.toLocaleDateString('en-US')}`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Yearly Discount Banner */}
          {yearlyDiscount > 0 && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800 font-medium">
                {isRTL 
                  ? `🎉 وفر ${yearlyDiscount}% مع الاشتراك السنوي!`
                  : `🎉 Save ${yearlyDiscount}% with yearly subscription!`
                }
              </p>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.isPopular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''} transition-all duration-200 hover:shadow-lg`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1 rtl:space-x-reverse">
                      <StarSolidIcon className="h-4 w-4" />
                      <span>{isRTL ? 'الأكثر شعبية' : 'Most Popular'}</span>
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">
                    {isRTL ? plan.nameAr : plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {isRTL ? plan.descriptionAr : plan.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <div className="text-4xl font-bold text-green-600">
                        {isRTL ? 'مجاني' : 'Free'}
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(plan.price, plan.currency)}
                        <span className="text-lg font-normal text-gray-500">
                          /{isRTL ? (plan.duration === 'monthly' ? 'شهر' : 'سنة') : (plan.duration === 'monthly' ? 'month' : 'year')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {(isRTL ? plan.featuresAr : plan.features).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Test Limit */}
                  <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {plan.testLimit === -1 ? (
                        <InfinityIcon className="h-5 w-5 text-blue-500" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-blue-500" />
                      )}
                      <span className="font-medium">
                        {plan.testLimit === -1 
                          ? (isRTL ? 'اختبارات غير محدودة' : 'Unlimited tests')
                          : (isRTL ? `${plan.testLimit} اختبارات شهرياً` : `${plan.testLimit} tests per month`)
                        }
                      </span>
                    </div>
                  </div>

                  {/* Subscribe Button */}
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={plan.id === 'free' || isCurrentPlan(plan.id) || processingPlan === plan.id}
                    variant={getPlanButtonVariant(plan)}
                    className="w-full"
                  >
                    {getPlanButtonText(plan)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security Notice */}
          <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold">
                {isRTL ? 'دفع آمن ومضمون' : 'Secure & Safe Payment'}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL
                ? 'جميع المدفوعات محمية بتشفير SSL ومعالجة بواسطة STC Pay، أحد أكثر منصات الدفع أماناً في المملكة العربية السعودية.'
                : 'All payments are SSL encrypted and processed by STC Pay, one of the most secure payment platforms in Saudi Arabia.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
