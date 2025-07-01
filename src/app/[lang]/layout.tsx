import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Language } from '@/types';
import { i18nConfig, getTextDirection, getFontFamily } from '@/lib/i18n';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

interface LanguageLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: Language }>;
}

export async function generateStaticParams() {
  return i18nConfig.supportedLanguages.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isArabic = lang === 'ar';

  return {
    title: isArabic
      ? 'اختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية'
      : 'Color Testing for Drug and Psychoactive Substance Detection',
    description: isArabic
      ? 'نظام متقدم لاختبار المواد والمؤثرات العقلية باستخدام الكواشف الكيميائية'
      : 'Advanced system for drug and psychoactive substance testing using chemical reagents',
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'ar': '/ar',
        'en': '/en',
      },
    },
    openGraph: {
      locale: isArabic ? 'ar_SA' : 'en_US',
      alternateLocale: isArabic ? 'en_US' : 'ar_SA',
    },
  };
}

export default async function LanguageLayout({
  children,
  params,
}: LanguageLayoutProps) {
  const { lang } = await params;
  // Validate language parameter
  if (!i18nConfig.supportedLanguages.includes(lang)) {
    notFound();
  }

  const direction = getTextDirection(lang);
  const fontClass = getFontFamily(lang);

  return (
    <html lang={lang} dir={direction} suppressHydrationWarning>
      <body className={`${fontClass} antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header lang={lang} />
            <main className="flex-1">
              {children}
            </main>
            <Footer lang={lang} />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
