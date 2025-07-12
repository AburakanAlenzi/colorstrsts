import { Language } from '@/types';

interface TestSimplePageProps {
  params: Promise<{ lang: Language }>;
}

export default async function TestSimplePage({ params }: TestSimplePageProps) {
  const { lang } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {lang === 'ar' ? 'اختبار بسيط' : 'Simple Test'}
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {lang === 'ar' ? 'اختبار التوجه' : 'Routing Test'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {lang === 'ar' 
              ? 'إذا كنت ترى هذه الصفحة، فإن التوجه يعمل بشكل صحيح.'
              : 'If you can see this page, routing is working correctly.'
            }
          </p>
          
          <div className="space-y-2">
            <p><strong>Language:</strong> {lang}</p>
            <p><strong>URL:</strong> /{lang}/tests/test-simple</p>
            <p><strong>Status:</strong> ✅ Working</p>
          </div>
          
          <div className="mt-6">
            <a 
              href={`/${lang}/tests`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {lang === 'ar' ? 'العودة إلى الاختبارات' : 'Back to Tests'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
