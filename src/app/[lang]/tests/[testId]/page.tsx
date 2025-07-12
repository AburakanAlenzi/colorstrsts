import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { TestPage } from '@/components/pages/test-page';
import { getChemicalTests } from '@/lib/firebase-realtime';
import { getTranslations } from '@/lib/translations';

// Note: Using static generation with fallback for compatibility with static export

// Generate static params for all test combinations
export async function generateStaticParams() {
  // Include all possible test IDs that might be used
  const allPossibleTestIds = [
    // Basic tests from fallback data
    'marquis-test',
    'mecke-test',
    'fast-blue-b-test',
    'mandelin-test',
    'ehrlich-test',

    // Additional common tests
    'hofmann-test',
    'simon-test',
    'froehde-test',
    'liebermann-test',
    'scott-test',
    'cobalt-thiocyanate-test',
    'ferric-chloride-test',
    'ferric-sulfate-test',
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
    for (const testId of allPossibleTestIds) {
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

  try {
    // Try to get test data from Firebase for accurate metadata
    const tests = await getChemicalTests();
    const test = tests.find(t => t.id === testId);

    if (test) {
      const testName = lang === 'ar' ? test.method_name_ar : test.method_name;
      const testDescription = lang === 'ar' ? test.description_ar : test.description;

      return {
        title: testName,
        description: testDescription,
      };
    }
  } catch (error) {
    console.error('Error loading test metadata:', error);
  }

  // Fallback metadata
  return {
    title: lang === 'ar' ? 'اختبار كيميائي' : 'Chemical Test',
    description: lang === 'ar' ? 'اختبار كيميائي للكشف عن المواد' : 'Chemical test for substance detection',
  };
}

export default async function Test({ params }: TestPageProps) {
  const { lang, testId } = await params;

  // Skip test validation in SSR since Firebase is not available
  // The TestPage component will handle loading and validation
  return <TestPage lang={lang} testId={testId} />;
}
