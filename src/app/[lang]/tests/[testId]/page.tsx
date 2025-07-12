import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { TestPage } from '@/components/pages/test-page';
import { getAllTestIds, getTestById } from '@/lib/local-data-service';
import { getTranslations } from '@/lib/translations';

// Note: Using static generation with fallback for compatibility with static export

// Generate static params for all test combinations
export async function generateStaticParams() {
  try {
    // Get all test IDs from the local JSON file
    const testIds = getAllTestIds();
    console.log(`📋 Generating static params for ${testIds.length} tests`);

    // Add special test pages
    const allTestIds = [
      'test-simple', // Debug test page
      ...testIds
    ];

    const languages: Language[] = ['ar', 'en'];

    const params = [];
    for (const lang of languages) {
      for (const testId of allTestIds) {
        params.push({
          lang,
          testId,
        });
      }
    }

    console.log(`✅ Generated ${params.length} static params`);
    return params;

  } catch (error) {
    console.error('❌ Error generating static params:', error);

    // Comprehensive fallback test IDs covering all known tests
    const fallbackTestIds = [
      'test-simple',
      'marquis-test',
      'mecke-test',
      'ferric-sulfate-test',
      'nitric-acid-test',
      'fast-blue-b-test',
      'duquenois-levine-test',
      'cobalt-thiocyanate-test',
      'modified-cobalt-thiocyanate-test',
      'wagner-test',
      'simon-test',
      'ehrlich-test',
      'liebermann-test',
      'potassium-dichromate-test',
      'chen-kao-test',
      'nitric-sulfuric-test',
      // Additional common tests that might be added
      'mandelin-test',
      'froehde-test',
      'hofmann-test',
      'scott-test'
    ];

    const languages: Language[] = ['ar', 'en'];
    const params = [];

    for (const lang of languages) {
      for (const testId of fallbackTestIds) {
        params.push({ lang, testId });
      }
    }

    return params;
  }
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
    // Try to get test data from local storage for accurate metadata
    const test = getTestById(testId);

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
