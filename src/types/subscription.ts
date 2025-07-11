export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  features: string[];
  featuresAr: string[];
  isPopular?: boolean;
  testLimit: number; // -1 for unlimited
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  paymentMethod: 'stc_pay';
  transactionId: string;
  amount: number;
  currency: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface STCPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  descriptionAr: string;
  customerEmail: string;
  customerName: string;
  planId: string;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface STCPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  message: string;
  messageAr: string;
  errorCode?: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  paidAt?: Date;
  failureReason?: string;
  failureReasonAr?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    nameAr: 'الخطة المجانية',
    description: 'Perfect for trying out our service',
    descriptionAr: 'مثالية لتجربة خدمتنا',
    price: 0,
    currency: 'SAR',
    duration: 'monthly',
    features: [
      '5 tests per month',
      'Basic color analysis',
      'Standard support',
      'Mobile access'
    ],
    featuresAr: [
      '5 اختبارات شهرياً',
      'تحليل ألوان أساسي',
      'دعم عادي',
      'وصول من الجوال'
    ],
    testLimit: 5
  },
  {
    id: 'monthly',
    name: 'Monthly Premium',
    nameAr: 'الاشتراك الشهري المميز',
    description: 'Full access to all features',
    descriptionAr: 'وصول كامل لجميع الميزات',
    price: 29.99,
    currency: 'SAR',
    duration: 'monthly',
    features: [
      'Unlimited tests',
      'Advanced color analysis',
      'Priority support',
      'Export reports',
      'API access',
      'Custom test types'
    ],
    featuresAr: [
      'اختبارات غير محدودة',
      'تحليل ألوان متقدم',
      'دعم أولوية',
      'تصدير التقارير',
      'وصول API',
      'أنواع اختبارات مخصصة'
    ],
    isPopular: true,
    testLimit: -1
  },
  {
    id: 'yearly',
    name: 'Yearly Premium',
    nameAr: 'الاشتراك السنوي المميز',
    description: 'Best value - 2 months free!',
    descriptionAr: 'أفضل قيمة - شهرين مجاناً!',
    price: 299.99,
    currency: 'SAR',
    duration: 'yearly',
    features: [
      'Unlimited tests',
      'Advanced color analysis',
      'Priority support',
      'Export reports',
      'API access',
      'Custom test types',
      'Advanced analytics',
      'Team collaboration'
    ],
    featuresAr: [
      'اختبارات غير محدودة',
      'تحليل ألوان متقدم',
      'دعم أولوية',
      'تصدير التقارير',
      'وصول API',
      'أنواع اختبارات مخصصة',
      'تحليلات متقدمة',
      'تعاون الفريق'
    ],
    testLimit: -1
  }
];

export interface SubscriptionUsage {
  userId: string;
  planId: string;
  testsUsed: number;
  testsLimit: number;
  resetDate: Date;
  lastTestDate?: Date;
}

export interface PaymentHistory {
  id: string;
  userId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'refunded';
  planId: string;
  paymentMethod: 'stc_pay';
  paidAt: Date;
  description: string;
  descriptionAr: string;
}
