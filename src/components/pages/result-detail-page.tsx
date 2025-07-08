'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PrintReport } from '@/components/print/PrintReport';
import {
  ArrowLeftIcon,
  BeakerIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface ResultDetailPageProps {
  lang: Language;
  resultId: string;
}

interface TestResult {
  id: string;
  testName: string;
  testNameAr: string;
  date: string;
  time: string;
  observedColor: string;
  colorHex: string;
  possibleSubstances: string[];
  possibleSubstancesAr: string[];
  confidence: number;
  confidenceLevel: string;
  testType: string;
  reference?: string;
  notes?: string;
}

export function ResultDetailPage({ lang, resultId }: ResultDetailPageProps) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrintView, setShowPrintView] = useState(false);
  const router = useRouter();
  const isRTL = lang === 'ar';

  useEffect(() => {
    // Load result from localStorage or API
    const loadResult = () => {
      try {
        const savedResults = localStorage.getItem('test_results');
        if (savedResults) {
          const results = JSON.parse(savedResults);
          const foundResult = results.find((r: any) => r.id === resultId);
          
          if (foundResult) {
            setResult(foundResult);
          } else {
            // Create mock result for demo
            setResult({
              id: resultId,
              testName: 'Marquis Test',
              testNameAr: 'اختبار ماركيز',
              date: '2024-12-07',
              time: '20:17:01',
              observedColor: 'Orange',
              colorHex: '#FFA500',
              possibleSubstances: ['Morphine', 'Heroin'],
              possibleSubstancesAr: ['مورفين', 'هيروين'],
              confidence: 85,
              confidenceLevel: 'High',
              testType: 'Presumptive',
              reference: 'Clarke, E.G.C. (1986). Clarke\'s Isolation and Identification of Drugs, 2nd ed.',
              notes: 'Test performed under controlled conditions'
            });
          }
        } else {
          // Create mock result
          setResult({
            id: resultId,
            testName: 'Nitric Acid Test',
            testNameAr: 'اختبار حمض النيتريك',
            date: '2024-12-07',
            time: '20:17:01',
            observedColor: 'Orange',
            colorHex: '#FFA500',
            possibleSubstances: ['Morphine'],
            possibleSubstancesAr: ['مورفين'],
            confidence: 85,
            confidenceLevel: 'High',
            testType: 'Presumptive',
            reference: 'Clarke, E.G.C. (1986). Clarke\'s Isolation and Identification of Drugs, 2nd ed.',
            notes: 'Sample analysis completed successfully'
          });
        }
      } catch (error) {
        console.error('Error loading result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [resultId]);

  const getConfidenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'very_high':
      case 'high':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
      case 'very_low':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isRTL 
      ? date.toLocaleDateString('ar-SA')
      : date.toLocaleDateString('en-US');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {isRTL ? 'النتيجة غير موجودة' : 'Result Not Found'}
          </h1>
          <Button onClick={() => router.push(`/${lang}/results`)}>
            {isRTL ? 'العودة للنتائج' : 'Back to Results'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-background dark:to-blue-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <ArrowLeftIcon className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{isRTL ? 'رجوع' : 'Back'}</span>
            </Button>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                <BeakerIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {isRTL ? 'تفاصيل النتيجة' : 'Result Details'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL ? `معرف النتيجة: ${result.id}` : `Result ID: ${result.id}`}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowPrintView(true)}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 hover:bg-green-700"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>{isRTL ? 'طباعة التقرير' : 'Print Report'}</span>
            </Button>
          </div>

          {/* Test Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <BeakerIcon className="h-5 w-5" />
                <span>{isRTL ? 'معلومات الاختبار' : 'Test Information'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? 'نوع الاختبار' : 'Test Type'}
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {isRTL ? result.testNameAr : result.testName}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? 'تاريخ ووقت الاختبار' : 'Test Date & Time'}
                  </label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-gray-100">{formatDate(result.date)}</span>
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-gray-100">{result.time}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Result */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <EyeIcon className="h-5 w-5" />
                <span>{isRTL ? 'اللون المُلاحظ' : 'Observed Color'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: result.colorHex }}
                ></div>
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {result.observedColor}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {result.colorHex}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <CheckCircleIcon className="h-5 w-5" />
                <span>{isRTL ? 'النتائج المحتملة' : 'Possible Results'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'المواد المحتملة' : 'Possible Substances'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(isRTL ? result.possibleSubstancesAr : result.possibleSubstances).map((substance, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {substance}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'مستوى الثقة' : 'Confidence Level'}
                  </label>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidenceLevel)}`}>
                      {result.confidence}% - {isRTL ? 
                        (result.confidenceLevel === 'High' ? 'عالي' : result.confidenceLevel === 'Medium' ? 'متوسط' : 'منخفض') :
                        result.confidenceLevel
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reference */}
          {result.reference && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>{isRTL ? 'المرجع العلمي' : 'Scientific Reference'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {result.reference}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {result.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span>{isRTL ? 'ملاحظات' : 'Notes'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  {result.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Print View Modal */}
      {showPrintView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {isRTL ? 'معاينة الطباعة' : 'Print Preview'}
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowPrintView(false)}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <span>{isRTL ? 'إغلاق' : 'Close'}</span>
              </Button>
            </div>
            <div className="p-4">
              <PrintReport lang={lang} testResult={result} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
