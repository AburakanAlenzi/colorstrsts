import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateSubscriptionStatus } from '@/lib/subscription-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // معالجة الأحداث المختلفة
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const firebaseUid = session.metadata?.firebase_uid;
  
  if (!firebaseUid) {
    console.error('No Firebase UID found in session metadata');
    return;
  }

  console.log(`Checkout completed for user: ${firebaseUid}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const firebaseUid = subscription.metadata?.firebase_uid;
  
  if (!firebaseUid) {
    console.error('No Firebase UID found in subscription metadata');
    return;
  }

  await updateSubscriptionStatus(firebaseUid, {
    status: 'active',
    plan: 'premium',
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });

  console.log(`Subscription created for user: ${firebaseUid}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const firebaseUid = subscription.metadata?.firebase_uid;
  
  if (!firebaseUid) {
    console.error('No Firebase UID found in subscription metadata');
    return;
  }

  const status = subscription.status === 'active' ? 'active' : 
                 subscription.status === 'past_due' ? 'past_due' : 
                 subscription.status === 'canceled' ? 'canceled' : 'inactive';

  await updateSubscriptionStatus(firebaseUid, {
    status,
    plan: status === 'active' ? 'premium' : 'free',
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });

  console.log(`Subscription updated for user: ${firebaseUid}, status: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const firebaseUid = subscription.metadata?.firebase_uid;
  
  if (!firebaseUid) {
    console.error('No Firebase UID found in subscription metadata');
    return;
  }

  await updateSubscriptionStatus(firebaseUid, {
    status: 'canceled',
    plan: 'free',
  });

  console.log(`Subscription deleted for user: ${firebaseUid}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const firebaseUid = subscription.metadata?.firebase_uid;
    
    if (firebaseUid) {
      await updateSubscriptionStatus(firebaseUid, {
        status: 'active',
        plan: 'premium',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
      
      console.log(`Payment succeeded for user: ${firebaseUid}`);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const firebaseUid = subscription.metadata?.firebase_uid;
    
    if (firebaseUid) {
      await updateSubscriptionStatus(firebaseUid, {
        status: 'past_due',
        plan: 'free', // تقييد الوصول عند فشل الدفع
      });
      
      console.log(`Payment failed for user: ${firebaseUid}`);
    }
  }
}
