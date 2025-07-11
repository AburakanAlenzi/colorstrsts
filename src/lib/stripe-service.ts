import { loadStripe, Stripe } from '@stripe/stripe-js';

// تأكد من إضافة هذه المتغيرات في ملف .env.local
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey!);
  }
  return stripePromise;
};

// أسعار الاشتراك (يجب إنشاؤها في Stripe Dashboard)
export const SUBSCRIPTION_PRICES = {
  MONTHLY_SAR: 'price_monthly_sar', // سيتم استبدالها بـ Price ID الفعلي من Stripe
  MONTHLY_USD: 'price_monthly_usd'  // للمستخدمين خارج السعودية
};

// إنشاء جلسة دفع للاشتراك
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        priceId,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// إنشاء Customer Portal للمستخدم لإدارة اشتراكه
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

// التحقق من حالة الاشتراك
export async function getSubscriptionStatus(customerId: string) {
  try {
    const response = await fetch(`/api/stripe/subscription-status?customerId=${customerId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get subscription status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
}

// إلغاء الاشتراك
export async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

// معلومات خطط الاشتراك
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'خطة مجانية',
    nameEn: 'Free Plan',
    price: 0,
    currency: 'SAR',
    features: [
      'أول 5 اختبارات مجانية',
      'الوصول للاختبارات الأساسية',
      'دعم محدود'
    ],
    featuresEn: [
      'First 5 tests free',
      'Access to basic tests',
      'Limited support'
    ]
  },
  premium: {
    name: 'خطة مميزة',
    nameEn: 'Premium Plan',
    price: 29, // 29 ريال سعودي شهرياً
    currency: 'SAR',
    features: [
      'وصول غير محدود لجميع الاختبارات',
      'تحديثات دورية للاختبارات',
      'دعم فني متقدم',
      'تقارير مفصلة',
      'حفظ تاريخ الاختبارات'
    ],
    featuresEn: [
      'Unlimited access to all tests',
      'Regular test updates',
      'Advanced technical support',
      'Detailed reports',
      'Test history storage'
    ]
  }
};
