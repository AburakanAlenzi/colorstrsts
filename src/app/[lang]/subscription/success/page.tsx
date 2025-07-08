import { Metadata } from 'next';
import { Language } from '@/types';
import { PaymentSuccess } from '@/components/subscription/PaymentSuccess';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface PaymentSuccessPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: PaymentSuccessPageProps): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'نجح الدفع - اختبارات الألوان' : 'Payment Success - Color Testing',
    description: lang === 'ar' ? 'تم الدفع بنجاح' : 'Payment completed successfully',
  };
}

export default async function PaymentSuccessPage({ params }: PaymentSuccessPageProps) {
  const { lang } = await params;

  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <PaymentSuccess lang={lang} />
    </AuthGuard>
  );
}
