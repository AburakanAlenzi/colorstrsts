import { Metadata } from 'next';
import { Language } from '@/types';
import { PaymentCancel } from '@/components/subscription/PaymentCancel';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface PaymentCancelPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: PaymentCancelPageProps): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'تم إلغاء الدفع - اختبارات الألوان' : 'Payment Cancelled - Color Testing',
    description: lang === 'ar' ? 'تم إلغاء عملية الدفع' : 'Payment process was cancelled',
  };
}

export default async function PaymentCancelPage({ params }: PaymentCancelPageProps) {
  const { lang } = await params;

  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <PaymentCancel lang={lang} />
    </AuthGuard>
  );
}
