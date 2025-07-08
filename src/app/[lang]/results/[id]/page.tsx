import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { ResultDetailPage } from '@/components/pages/result-detail-page';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface ResultDetailPageProps {
  params: Promise<{
    lang: Language;
    id: string;
  }>;
}

export async function generateMetadata({ params }: ResultDetailPageProps): Promise<Metadata> {
  const { lang, id } = await params;

  return {
    title: lang === 'ar' ? `نتيجة الاختبار ${id} - اختبارات الألوان` : `Test Result ${id} - Color Testing`,
    description: lang === 'ar' ? 'عرض تفاصيل نتيجة الاختبار' : 'View detailed test result',
  };
}

export default async function ResultDetail({ params }: ResultDetailPageProps) {
  const { lang, id } = await params;
  
  // Validate language
  if (!['ar', 'en'].includes(lang)) {
    notFound();
  }
  
  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <ResultDetailPage lang={lang} resultId={id} />
    </AuthGuard>
  );
}
