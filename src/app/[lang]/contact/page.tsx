import { Metadata } from 'next';
import { Language } from '@/types';
import { ContactPage } from '@/components/pages/contact-page';
import { getTranslations } from '@/lib/translations';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface ContactPageProps {
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
    title: lang === 'ar' ? 'اتصل بنا' : 'Contact Us',
    description: lang === 'ar' 
      ? 'تواصل مع فريق تطوير نظام اختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية'
      : 'Contact the development team of the color testing system for drug and psychoactive substance detection',
  };
}

export default async function Contact({ params }: ContactPageProps) {
  const { lang } = await params;

  return <ContactPage lang={lang} />;
}
