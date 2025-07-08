'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { 
  DocumentTextIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  BeakerIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface TestResult {
  id: string;
  testId: string;
  colorId: string;
  confidence: number;
  substances: string[];
  timestamp: Date;
  colorName?: string;
  colorHex?: string;
}

interface ResultsPageProps {
  lang: Language;
}

export function ResultsPage({ lang }: ResultsPageProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = getTranslationsSync(lang);
  const isRTL = lang === 'ar';

  useEffect(() => {
    const loadResults = () => {
      try {
        const savedResults = localStorage.getItem('test_results');
        if (savedResults) {
          const parsedResults = JSON.parse(savedResults).map((result: any) => ({
            ...result,
            timestamp: new Date(result.timestamp)
          }));
          // Sort by timestamp (newest first)
          parsedResults.sort((a: TestResult, b: TestResult) => 
            b.timestamp.getTime() - a.timestamp.getTime()
          );
          setResults(parsedResults);
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  const deleteResult = (resultId: string) => {
    const updatedResults = results.filter(result => result.id !== resultId);
    setResults(updatedResults);
    localStorage.setItem('test_results', JSON.stringify(updatedResults));
  };

  const clearAllResults = () => {
    setResults([]);
    localStorage.removeItem('test_results');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 80) return 'text-green-500 bg-green-50 border-green-200';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 90) return lang === 'ar' ? 'عالي جداً' : 'Very High';
    if (confidence >= 80) return lang === 'ar' ? 'عالي' : 'High';
    if (confidence >= 70) return lang === 'ar' ? 'متوسط' : 'Medium';
    return lang === 'ar' ? 'منخفض' : 'Low';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">
            {lang === 'ar' ? 'جاري تحميل النتائج...' : 'Loading results...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
            <DocumentTextIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {lang === 'ar' ? 'نتائج الاختبارات' : 'Test Results'}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {lang === 'ar' 
              ? 'عرض وإدارة نتائج الاختبارات المحفوظة'
              : 'View and manage your saved test results'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <Button
            onClick={() => router.push(`/${lang}/tests`)}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <BeakerIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'إجراء اختبار جديد' : 'Perform New Test'}</span>
          </Button>

          {results.length > 0 && (
            <Button
              onClick={clearAllResults}
              variant="outline"
              className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'حذف جميع النتائج' : 'Clear All Results'}</span>
            </Button>
          )}
        </div>

        {/* Results List */}
        {results.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {lang === 'ar' ? 'لا توجد نتائج محفوظة' : 'No Saved Results'}
            </h3>
            <p className="text-gray-500 mb-6">
              {lang === 'ar' 
                ? 'لم تقم بإجراء أي اختبارات بعد. ابدأ اختبارك الأول الآن!'
                : "You haven't performed any tests yet. Start your first test now!"
              }
            </p>
            <Button
              onClick={() => router.push(`/${lang}/tests`)}
              className="flex items-center space-x-2 rtl:space-x-reverse mx-auto"
            >
              <BeakerIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'ابدأ اختبار جديد' : 'Start New Test'}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Test Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <BeakerIcon className="h-5 w-5 text-primary-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {result.testId.charAt(0).toUpperCase() + result.testId.slice(1)} Test
                    </span>
                  </div>
                  <Button
                    onClick={() => deleteResult(result.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Color Display */}
                <div className="mb-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: result.colorHex || result.colorId }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {result.colorName || result.colorId}
                    </span>
                  </div>
                </div>

                {/* Substances */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {lang === 'ar' ? 'المواد المحتملة:' : 'Possible Substances:'}
                  </h4>
                  <div className="space-y-1">
                    {result.substances.map((substance, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        • {substance}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confidence */}
                <div className="mb-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(result.confidence)}`}>
                    {result.confidence}% - {getConfidenceText(result.confidence)}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  {result.timestamp.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
