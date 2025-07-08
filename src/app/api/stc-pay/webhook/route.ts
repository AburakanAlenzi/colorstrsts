import { NextRequest, NextResponse } from 'next/server';
import { 
  createSTCSubscription, 
  updateSTCSubscriptionStatus,
  addSTCPaymentHistory 
} from '@/lib/subscription-service';
import { stcPayService } from '@/lib/stc-pay';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من صحة الـ webhook (في الإنتاج، يجب التحقق من التوقيع)
    const webhookSecret = process.env.STC_PAY_WEBHOOK_SECRET;
    const signature = request.headers.get('x-stc-signature');
    
    // في البيئة التجريبية، نتجاهل التحقق من التوقيع
    if (process.env.NODE_ENV === 'production' && webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }
      
      // هنا يجب إضافة منطق التحقق من التوقيع
      // const isValidSignature = verifyWebhookSignature(body, signature, webhookSecret);
      // if (!isValidSignature) {
      //   return NextResponse.json(
      //     { error: 'Invalid signature' },
      //     { status: 401 }
      //   );
      // }
    }

    const { event_type, data } = body;

    switch (event_type) {
      case 'payment.completed':
        await handlePaymentCompleted(data);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(data);
        break;
        
      case 'payment.cancelled':
        await handlePaymentCancelled(data);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${event_type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(data: any) {
  try {
    const { transaction_id, amount, currency, metadata } = data;
    const { planId, userId } = metadata;

    // الحصول على تفاصيل الخطة
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    // إنشاء الاشتراك
    const startDate = new Date();
    const endDate = stcPayService.calculateSubscriptionEndDate(plan, startDate);

    const subscriptionId = await createSTCSubscription({
      userId,
      planId: plan.id,
      status: 'active',
      startDate,
      endDate,
      paymentMethod: 'stc_pay',
      transactionId: transaction_id,
      amount: parseFloat(amount),
      currency,
      autoRenew: false
    });

    // إضافة سجل الدفع
    await addSTCPaymentHistory({
      userId,
      transactionId: transaction_id,
      amount: parseFloat(amount),
      currency,
      status: 'completed',
      planId: plan.id,
      paymentMethod: 'stc_pay',
      paidAt: new Date(),
      description: `Subscription to ${plan.name}`,
      descriptionAr: `اشتراك في ${plan.nameAr}`
    });

    console.log(`Payment completed for user ${userId}, subscription ${subscriptionId}`);

  } catch (error) {
    console.error('Error handling payment completed:', error);
    throw error;
  }
}

async function handlePaymentFailed(data: any) {
  try {
    const { transaction_id, metadata } = data;
    const { userId } = metadata;

    // يمكن إضافة منطق إضافي هنا مثل إرسال إشعار للمستخدم
    console.log(`Payment failed for user ${userId}, transaction ${transaction_id}`);

  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

async function handlePaymentCancelled(data: any) {
  try {
    const { transaction_id, metadata } = data;
    const { userId } = metadata;

    // يمكن إضافة منطق إضافي هنا
    console.log(`Payment cancelled for user ${userId}, transaction ${transaction_id}`);

  } catch (error) {
    console.error('Error handling payment cancelled:', error);
    throw error;
  }
}

// دالة للتحقق من توقيع الـ webhook (للاستخدام في الإنتاج)
function verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
  // هنا يجب إضافة منطق التحقق من التوقيع حسب مواصفات STC Pay
  // مثال:
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(JSON.stringify(payload))
  //   .digest('hex');
  // return signature === expectedSignature;
  
  return true; // مؤقتاً للتطوير
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-stc-signature',
    },
  });
}
