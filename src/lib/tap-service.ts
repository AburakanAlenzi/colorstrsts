// Tap Payment Service
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'الخطة المميزة',
    price: 29,
    currency: 'SAR',
    interval: 'month',
    features: [
      'وصول غير محدود لجميع الاختبارات',
      'تحديثات دورية للاختبارات',
      'دعم فني متقدم',
      'تقارير مفصلة',
      'حفظ تاريخ الاختبارات'
    ]
  }
];

interface TapChargeRequest {
  amount: number;
  currency: string;
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: {
      country_code: string;
      number: string;
    };
  };
  source: {
    id: string;
  };
  redirect: {
    url: string;
  };
  post?: {
    url: string;
  };
  description: string;
  metadata?: Record<string, any>;
  receipt?: {
    email: boolean;
    sms: boolean;
  };
}

interface TapChargeResponse {
  id: string;
  object: string;
  live_mode: boolean;
  amount: number;
  currency: string;
  description: string;
  status: string;
  response: {
    code: string;
    message: string;
  };
  reference: {
    transaction: string;
    order: string;
  };
  transaction: {
    timezone: string;
    created: string;
    url: string;
    expiry: {
      period: number;
      type: string;
    };
    asynchronous: boolean;
    amount: number;
    currency: string;
  };
  receipt: {
    email: boolean;
    sms: boolean;
  };
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: {
      country_code: string;
      number: string;
    };
  };
  source: {
    object: string;
    id: string;
  };
  redirect: {
    status: string;
    url: string;
  };
  post: {
    status: string;
    url: string;
  };
}

interface TapSubscriptionRequest {
  term: {
    interval: string;
    period: number;
    from: string;
    due: string;
    auto_renew: boolean;
  };
  trial?: {
    period: number;
    interval: string;
  };
  charge: {
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, any>;
  };
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: {
      country_code: string;
      number: string;
    };
  };
  source: {
    id: string;
  };
  post?: {
    url: string;
  };
}

const TAP_API_BASE = 'https://api.tap.company/v2';

class TapService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TAP_SECRET_KEY || '';
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${TAP_API_BASE}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Tap API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async createCharge(chargeData: TapChargeRequest): Promise<TapChargeResponse> {
    return this.makeRequest<TapChargeResponse>('/charges', 'POST', chargeData);
  }

  async getCharge(chargeId: string): Promise<TapChargeResponse> {
    return this.makeRequest<TapChargeResponse>(`/charges/${chargeId}`);
  }

  async createSubscription(subscriptionData: TapSubscriptionRequest): Promise<any> {
    return this.makeRequest('/subscriptions', 'POST', subscriptionData);
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`, 'DELETE');
  }

  async updateSubscription(subscriptionId: string, updateData: any): Promise<any> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`, 'PUT', updateData);
  }
}

export const tapService = new TapService();

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  planId: string,
  userName: string = 'مستخدم'
): Promise<{ url: string; chargeId: string }> {
  const plan = subscriptionPlans.find(p => p.id === planId);
  if (!plan) {
    throw new Error('Invalid plan ID');
  }

  const [firstName, lastName] = userName.split(' ');

  const chargeData: TapChargeRequest = {
    amount: plan.price,
    currency: plan.currency,
    customer: {
      first_name: firstName || 'مستخدم',
      last_name: lastName || '',
      email: userEmail,
    },
    source: {
      id: 'src_all' // يقبل جميع طرق الدفع المتاحة
    },
    redirect: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`
    },
    post: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tap/webhook`
    },
    description: `اشتراك ${plan.name} - نظام اختبار الألوان`,
    metadata: {
      userId,
      planId,
      type: 'subscription'
    },
    receipt: {
      email: true,
      sms: false
    }
  };

  const charge = await tapService.createCharge(chargeData);
  
  return {
    url: charge.transaction.url,
    chargeId: charge.id
  };
}

export async function createSubscription(
  userId: string,
  userEmail: string,
  planId: string,
  userName: string = 'مستخدم'
): Promise<any> {
  const plan = subscriptionPlans.find(p => p.id === planId);
  if (!plan) {
    throw new Error('Invalid plan ID');
  }

  const [firstName, lastName] = userName.split(' ');
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const subscriptionData: TapSubscriptionRequest = {
    term: {
      interval: 'MONTH',
      period: 1,
      from: now.toISOString().split('T')[0],
      due: nextMonth.toISOString().split('T')[0],
      auto_renew: true
    },
    charge: {
      amount: plan.price,
      currency: plan.currency,
      description: `اشتراك ${plan.name} - نظام اختبار الألوان`,
      metadata: {
        userId,
        planId,
        type: 'subscription'
      }
    },
    customer: {
      first_name: firstName || 'مستخدم',
      last_name: lastName || '',
      email: userEmail,
    },
    source: {
      id: 'src_all'
    },
    post: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tap/webhook`
    }
  };

  return await tapService.createSubscription(subscriptionData);
}

export async function getChargeStatus(chargeId: string) {
  return await tapService.getCharge(chargeId);
}

export async function getSubscription(subscriptionId: string) {
  return await tapService.getSubscription(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return await tapService.cancelSubscription(subscriptionId);
}

export async function updateSubscription(subscriptionId: string, updateData: any) {
  return await tapService.updateSubscription(subscriptionId, updateData);
}
