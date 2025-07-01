import { Metadata } from 'next';
import { Language } from '@/types';
import { ResultsPage } from '@/components/pages/results-page';
import { getTranslations } from '@/lib/translations';

interface ResultsPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return {
    title: t('navigation.results'),
    description: lang === 'ar' 
      ? 'عرض وإدارة نتائج الاختبارات المحفوظة'
      : 'View and manage saved test results',
  };
}

export default async function Results({ params }: ResultsPageProps) {
  const { lang } = await params;

  return <ResultsPage lang={lang} />;
}
