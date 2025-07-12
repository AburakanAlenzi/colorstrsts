import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { TestPage } from '@/components/pages/test-page';
import { getChemicalTests } from '@/lib/firebase-realtime';
import { getTranslations } from '@/lib/translations';

// Generate static params for all test combinations
export async function generateStaticParams() {
  // Use static test IDs for build time since Firebase is not available in SSR
  const staticTestIds = [
    'marquis-test',
    'mecke-test',
    'mandelin-test',
    'ehrlich-test',
    'hofmann-test',
    'simon-test',
    'froehde-test',
    'liebermann-test',
    'scott-test',
    'cobalt-thiocyanate-test',
    'ferric-chloride-test',
    'ferric-sulfate-test',
    'fast-blue-b-test',
    'dille-koppanyi-test',
    'duquenois-levine-test',
    'van-urk-test',
    'zimmermann-test',
    'nitric-acid-test',
    'sulfuric-acid-test',
    'hydrochloric-acid-test',
    'sodium-hydroxide-test',
    'potassium-permanganate-test',
    'iodine-test',
    'ninhydrin-test',
    'dragendorff-test',
    'mayer-test',
    'wagner-test',
    'marquis-modified-test',
    'chen-test',
    'gallic-acid-test'
  ];

  const languages: Language[] = ['ar', 'en'];

  const params = [];
  for (const lang of languages) {
    for (const testId of staticTestIds) {
      params.push({
        lang,
        testId,
      });
    }
  }

  return params;
}

interface TestPageProps {
  params: Promise<{
    lang: Language;
    testId: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language; testId: string }>;
}): Promise<Metadata> {
  const { lang, testId } = await params;

  // Use static metadata since Firebase is not available in SSR
  const testNames: Record<string, { ar: string; en: string }> = {
    'marquis-test': { ar: 'اختبار ماركيز', en: 'Marquis Test' },
    'mecke-test': { ar: 'اختبار ميك', en: 'Mecke Test' },
    'mandelin-test': { ar: 'اختبار مانديلين', en: 'Mandelin Test' },
    'ehrlich-test': { ar: 'اختبار إيرليش', en: 'Ehrlich Test' },
    'fast-blue-b-test': { ar: 'اختبار الأزرق السريع ب', en: 'Fast Blue B Test' }
  };

  const testInfo = testNames[testId];
  const testName = testInfo ? (lang === 'ar' ? testInfo.ar : testInfo.en) : 'Chemical Test';

  return {
    title: testName,
    description: lang === 'ar' ? 'اختبار كيميائي للكشف عن المواد' : 'Chemical test for substance detection',
  };
}

export default async function Test({ params }: TestPageProps) {
  const { lang, testId } = await params;

  // Skip test validation in SSR since Firebase is not available
  // The TestPage component will handle loading and validation
  return <TestPage lang={lang} testId={testId} />;
}
