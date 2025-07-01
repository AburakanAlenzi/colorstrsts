import { Metadata } from 'next';
import { Language } from '@/types';
import { TestsPage } from '@/components/pages/tests-page';
import { getTranslations } from '@/lib/translations';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface TestsPageProps {
  params: Promise<{ lang: Language }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return {
    title: t('tests.title'),
    description: t('tests.subtitle'),
  };
}

export default async function Tests({ params }: TestsPageProps) {
  const { lang } = await params;
  return <TestsPage lang={lang} />;
}
