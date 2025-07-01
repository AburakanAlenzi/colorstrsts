import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { updateUserSubscription } from '@/lib/subscription-service';

// Tap webhook events
interface TapWebhookEvent {
  id: string;
  object: string;
  live_mode: boolean;
  created: number;
  data: {
    object: {
      id: string;
      object: string;
      amount: number;
      currency: string;
      status: string;
      metadata?: {
        userId?: string;
        planId?: string;
        type?: string;
      };
      customer?: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
      };
      response?: {
        code: string;
        message: string;
      };
    };
  };
  type: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('tap-signature');

    // التحقق من صحة التوقيع (إذا كان Tap يدعم ذلك)
    if (!verifyTapSignature(body, signature)) {
      console.error('Invalid Tap signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event: TapWebhookEvent = JSON.parse(body);
    
    console.log('Received Tap webhook:', event.type, event.id);

    // معالجة الأحداث المختلفة
    switch (event.type) {
      case 'charge.succeeded':
        await handleChargeSucceeded(event);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(event);
        break;
      
      case 'subscription.created':
        await handleSubscriptionCreated(event);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
      
      default:
        console.log(`Unhandled Tap event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Tap webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleChargeSucceeded(event: TapWebhookEvent) {
  const charge = event.data.object;
  const { userId, planId, type } = charge.metadata || {};

  if (!userId || !planId) {
    console.error('Missing metadata in charge.succeeded event');
    return;
  }

  try {
    if (type === 'subscription') {
      // تفعيل الاشتراك للمستخدم
      await updateUserSubscription(userId, {
        status: 'active',
        planId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        tapChargeId: charge.id,
        tapCustomerId: charge.customer?.id
      });

      console.log(`Subscription activated for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling charge.succeeded:', error);
  }
}

async function handleChargeFailed(event: TapWebhookEvent) {
  const charge = event.data.object;
  const { userId } = charge.metadata || {};

  if (!userId) {
    console.error('Missing userId in charge.failed event');
    return;
  }

  try {
    // تسجيل فشل الدفع
    console.log(`Payment failed for user ${userId}:`, charge.response?.message);
    
    // يمكن إضافة منطق إضافي هنا مثل إرسال إشعار للمستخدم
  } catch (error) {
    console.error('Error handling charge.failed:', error);
  }
}

async function handleSubscriptionCreated(event: TapWebhookEvent) {
  const subscription = event.data.object;
  const { userId, planId } = subscription.metadata || {};

  if (!userId || !planId) {
    console.error('Missing metadata in subscription.created event');
    return;
  }

  try {
    await updateUserSubscription(userId, {
      status: 'active',
      planId,
      tapSubscriptionId: subscription.id,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    console.log(`Subscription created for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription.created:', error);
  }
}

async function handleSubscriptionUpdated(event: TapWebhookEvent) {
  const subscription = event.data.object;
  const { userId } = subscription.metadata || {};

  if (!userId) {
    console.error('Missing userId in subscription.updated event');
    return;
  }

  try {
    // تحديث معلومات الاشتراك
    console.log(`Subscription updated for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription.updated:', error);
  }
}

async function handleSubscriptionCancelled(event: TapWebhookEvent) {
  const subscription = event.data.object;
  const { userId } = subscription.metadata || {};

  if (!userId) {
    console.error('Missing userId in subscription.cancelled event');
    return;
  }

  try {
    await updateUserSubscription(userId, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    console.log(`Subscription cancelled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription.cancelled:', error);
  }
}

function verifyTapSignature(body: string, signature: string | null): boolean {
  // Tap signature verification logic
  // هذا يعتمد على كيفية تنفيذ Tap للتوقيعات
  // في الوقت الحالي، سنعتبر جميع الطلبات صحيحة
  // يجب تحديث هذا عند توفر معلومات أكثر عن Tap signatures
  
  if (!signature) {
    console.warn('No Tap signature provided');
    return true; // مؤقتاً نقبل الطلبات بدون توقيع
  }

  // TODO: تنفيذ التحقق من التوقيع الفعلي
  return true;
}
