import { Metadata } from 'next';
import { Language } from '@/types';
import { HomePage } from '@/components/pages/home-page';
import { getTranslations } from '@/lib/translations';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface HomePageProps {
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
    title: t('home.title'),
    description: t('home.description'),
  };
}

export default async function Home({ params }: HomePageProps) {
  const { lang } = await params;
  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <HomePage lang={lang} />
    </AuthGuard>
  );
}
