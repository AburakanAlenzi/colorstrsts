import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { TestPage } from '@/components/pages/test-page';
import { DataService } from '@/lib/data-service';
import { getTranslations } from '@/lib/translations';

// Generate static params for all test combinations
export async function generateStaticParams() {
  const tests = DataService.getChemicalTests();
  const languages: Language[] = ['ar', 'en'];

  const params = [];
  for (const lang of languages) {
    for (const test of tests) {
      params.push({
        lang,
        testId: test.id,
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
  const test = DataService.getChemicalTestById(testId);

  if (!test) {
    return {
      title: 'Test Not Found',
    };
  }

  const testName = lang === 'ar' ? test.method_name_ar : test.method_name;
  const testDescription = lang === 'ar' ? test.description_ar : test.description;

  return {
    title: testName,
    description: testDescription,
  };
}

export default async function Test({ params }: TestPageProps) {
  const { lang, testId } = await params;
  const test = DataService.getChemicalTestById(testId);

  if (!test) {
    notFound();
  }

  return <TestPage lang={lang} testId={testId} />;
}
