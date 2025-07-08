'use client';

import { 
  STCPaymentRequest, 
  STCPaymentResponse, 
  PaymentStatus,
  UserSubscription,
  SubscriptionPlan,
  SUBSCRIPTION_PLANS
} from '@/types/subscription';

// STC Pay Configuration
const STC_PAY_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_STC_PAY_BASE_URL || 'https://api.stcpay.com.sa',
  merchantId: process.env.NEXT_PUBLIC_STC_PAY_MERCHANT_ID || 'demo_merchant',
  apiKey: process.env.STC_PAY_API_KEY || 'demo_api_key',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
};

class STCPayService {
  private baseUrl: string;
  private merchantId: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = STC_PAY_CONFIG.baseUrl;
    this.merchantId = STC_PAY_CONFIG.merchantId;
    this.apiKey = STC_PAY_CONFIG.apiKey;
  }

  /**
   * إنشاء طلب دفع جديد
   */
  async createPayment(request: STCPaymentRequest): Promise<STCPaymentResponse> {
    try {
      // في البيئة التجريبية، نقوم بمحاكاة الاستجابة
      if (STC_PAY_CONFIG.environment === 'sandbox') {
        return this.mockCreatePayment(request);
      }

      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Merchant-ID': this.merchantId
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          description: request.description,
          customer: {
            email: request.customerEmail,
            name: request.customerName
          },
          metadata: {
            planId: request.planId,
            userId: request.userId
          },
          return_url: request.returnUrl,
          cancel_url: request.cancelUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment creation failed');
      }

      return {
        success: true,
        transactionId: data.transaction_id,
        paymentUrl: data.payment_url,
        status: 'pending',
        message: 'Payment created successfully',
        messageAr: 'تم إنشاء الدفع بنجاح'
      };

    } catch (error) {
      console.error('STC Pay Error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Failed to create payment',
        messageAr: 'فشل في إنشاء الدفع',
        errorCode: 'PAYMENT_CREATION_FAILED'
      };
    }
  }

  /**
   * التحقق من حالة الدفع
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      // في البيئة التجريبية، نقوم بمحاكاة الاستجابة
      if (STC_PAY_CONFIG.environment === 'sandbox') {
        return this.mockCheckPaymentStatus(transactionId);
      }

      const response = await fetch(`${this.baseUrl}/v1/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Merchant-ID': this.merchantId
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment status check failed');
      }

      return {
        transactionId: data.transaction_id,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        failureReason: data.failure_reason,
        failureReasonAr: data.failure_reason_ar
      };

    } catch (error) {
      console.error('STC Pay Status Check Error:', error);
      return {
        transactionId,
        status: 'failed',
        amount: 0,
        currency: 'SAR',
        failureReason: 'Status check failed',
        failureReasonAr: 'فشل في التحقق من الحالة'
      };
    }
  }

  /**
   * إلغاء الدفع
   */
  async cancelPayment(transactionId: string): Promise<boolean> {
    try {
      if (STC_PAY_CONFIG.environment === 'sandbox') {
        return true; // محاكاة نجاح الإلغاء
      }

      const response = await fetch(`${this.baseUrl}/v1/payments/${transactionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Merchant-ID': this.merchantId
        }
      });

      return response.ok;

    } catch (error) {
      console.error('STC Pay Cancel Error:', error);
      return false;
    }
  }

  /**
   * الحصول على خطة الاشتراك
   */
  getSubscriptionPlan(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
  }

  /**
   * حساب تاريخ انتهاء الاشتراك
   */
  calculateSubscriptionEndDate(plan: SubscriptionPlan, startDate: Date = new Date()): Date {
    const endDate = new Date(startDate);
    
    if (plan.duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.duration === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    return endDate;
  }

  /**
   * التحقق من صحة الاشتراك
   */
  isSubscriptionValid(subscription: UserSubscription): boolean {
    if (subscription.status !== 'active') {
      return false;
    }
    
    return new Date() < subscription.endDate;
  }

  // Mock functions for development/testing
  private async mockCreatePayment(request: STCPaymentRequest): Promise<STCPaymentResponse> {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transactionId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paymentUrl = `${window.location.origin}/payment/mock?transaction_id=${transactionId}&amount=${request.amount}`;
    
    return {
      success: true,
      transactionId,
      paymentUrl,
      status: 'pending',
      message: 'Mock payment created successfully',
      messageAr: 'تم إنشاء دفع تجريبي بنجاح'
    };
  }

  private async mockCheckPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // محاكاة حالات مختلفة بناءً على معرف المعاملة
    const random = Math.random();
    let status: 'pending' | 'completed' | 'failed' | 'cancelled';
    
    if (transactionId.includes('fail')) {
      status = 'failed';
    } else if (transactionId.includes('cancel')) {
      status = 'cancelled';
    } else if (random > 0.8) {
      status = 'completed';
    } else {
      status = 'pending';
    }
    
    return {
      transactionId,
      status,
      amount: 29.99,
      currency: 'SAR',
      paidAt: status === 'completed' ? new Date() : undefined,
      failureReason: status === 'failed' ? 'Insufficient funds' : undefined,
      failureReasonAr: status === 'failed' ? 'رصيد غير كافي' : undefined
    };
  }

  /**
   * تنسيق السعر للعرض
   */
  formatPrice(amount: number, currency: string = 'SAR', locale: string = 'ar-SA'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * حساب الخصم للاشتراك السنوي
   */
  calculateYearlyDiscount(): number {
    const monthlyPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'monthly');
    const yearlyPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'yearly');
    
    if (!monthlyPlan || !yearlyPlan) return 0;
    
    const monthlyYearlyPrice = monthlyPlan.price * 12;
    const discount = monthlyYearlyPrice - yearlyPlan.price;
    
    return Math.round((discount / monthlyYearlyPrice) * 100);
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
export const stcPayService = new STCPayService();

// تصدير الكلاس للاستخدام المباشر إذا لزم الأمر
export default STCPayService;
