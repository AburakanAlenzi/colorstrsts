import { Metadata } from 'next';
import { Language } from '@/types';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface SubscriptionPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: SubscriptionPageProps): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'خطط الاشتراك - اختبارات الألوان' : 'Subscription Plans - Color Testing',
    description: lang === 'ar' ? 'اختر خطة الاشتراك المناسبة لك' : 'Choose the right subscription plan for you',
  };
}

export default async function SubscriptionPage({ params }: SubscriptionPageProps) {
  const { lang } = await params;

  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <SubscriptionPlans lang={lang} />
    </AuthGuard>
  );
}
