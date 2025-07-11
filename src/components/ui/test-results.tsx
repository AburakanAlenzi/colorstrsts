'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { DataService } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ShareIcon,
  ArrowLeftIcon,
  BeakerIcon,
  EyeIcon,
  ClockIcon
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

interface TestResultsProps {
  testId: string;
  selectedColor: string;
  lang: Language;
  onBack: () => void;
  onNewTest: () => void;
}

export function TestResults({ testId, selectedColor, lang, onBack, onNewTest }: TestResultsProps) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const t = getTranslationsSync(lang);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);

        // Get test and color data
        const test = DataService.getChemicalTestById(testId);
        const colorResults = DataService.getColorResults();
        const colorResult = colorResults.find(cr =>
          cr.test_id === testId && cr.color_hex === selectedColor
        );

        if (!test) {
          throw new Error('Test data not found');
        }

        // If no specific color result found, create a generic one
        if (!colorResult) {
          console.warn('Color result not found, creating generic result');
        }

        // Convert confidence level to numeric score
        const getConfidenceScore = (level: string): number => {
          switch (level) {
            case 'very_high': return 95;
            case 'high': return 85;
            case 'medium': return 75;
            case 'low': return 60;
            case 'very_low': return 40;
            default: return 50;
          }
        };

        // Parse substances (handle comma-separated values)
        const parseSubstances = (substanceText: string): string[] => {
          if (!substanceText) return [];
          return substanceText.split(',').map(s => s.trim()).filter(s => s.length > 0);
        };

        // Create result object
        const testResult: TestResult = {
          id: `${testId}-${selectedColor}-${Date.now()}`,
          testId,
          colorId: selectedColor,
          confidence: colorResult ? getConfidenceScore(colorResult.confidence_level) : 50,
          substances: colorResult
            ? parseSubstances(lang === 'ar' ? colorResult.possible_substance_ar : colorResult.possible_substance)
            : [lang === 'ar' ? 'غير محدد' : 'Unknown'],
          timestamp: new Date(),
          colorName: colorResult ? (lang === 'ar' ? colorResult.color_result_ar : colorResult.color_result) : '',
          colorHex: selectedColor
        };

        setResult(testResult);

        // Save result to localStorage
        const savedResults = JSON.parse(localStorage.getItem('test_results') || '[]');
        savedResults.push(testResult);
        localStorage.setItem('test_results', JSON.stringify(savedResults));
        setSaved(true);

      } catch (error) {
        console.error('Error loading test result:', error);
      } finally {
        setLoading(false);
      }
    };

    if (testId && selectedColor) {
      loadResult();
    }
  }, [testId, selectedColor, lang]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: lang === 'ar' ? 'نتيجة اختبار الألوان' : 'Color Test Result',
          text: `${lang === 'ar' ? 'نتيجة الاختبار' : 'Test Result'}: ${result.confidence}% ${lang === 'ar' ? 'ثقة' : 'confidence'}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${lang === 'ar' ? 'نتيجة اختبار الألوان' : 'Color Test Result'}: ${result?.confidence}% ${lang === 'ar' ? 'ثقة' : 'confidence'}`;
      navigator.clipboard.writeText(text);
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 90) return { level: 'very-high', color: 'text-green-700', bg: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' };
    if (confidence >= 80) return { level: 'high', color: 'text-green-600', bg: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' };
    if (confidence >= 70) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800' };
    return { level: 'low', color: 'text-red-600', bg: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' };
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 90) return lang === 'ar' ? 'عالي جداً' : 'Very High';
    if (confidence >= 80) return lang === 'ar' ? 'عالي' : 'High';
    if (confidence >= 70) return lang === 'ar' ? 'متوسط' : 'Medium';
    return lang === 'ar' ? 'منخفض' : 'Low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">
            {lang === 'ar' ? 'جاري تحليل النتائج...' : 'Analyzing results...'}
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-warning-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {lang === 'ar' ? 'خطأ في تحميل النتائج' : 'Error Loading Results'}
        </h3>
        <p className="text-gray-500 mb-4">
          {lang === 'ar' ? 'حدث خطأ أثناء تحليل النتائج' : 'An error occurred while analyzing the results'}
        </p>
        <Button onClick={onBack}>
          {lang === 'ar' ? 'العودة' : 'Go Back'}
        </Button>
      </div>
    );
  }

  const confidenceInfo = getConfidenceLevel(result.confidence);

  return (
    <>
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            font-size: 10pt !important;
            line-height: 1.4 !important;
            color: black !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:text-4xl { font-size: 2rem !important; }
          .print\\:text-base { font-size: 0.875rem !important; }
          .print\\:p-4 { padding: 1rem !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-gray-400 { border-color: #9ca3af !important; }
          .print\\:mb-2 { margin-bottom: 0.5rem !important; }
          .print\\:mb-4 { margin-bottom: 1rem !important; }
          .print\\:text-sm { font-size: 0.75rem !important; }
          h1 { font-size: 1.5rem !important; margin-bottom: 0.5rem !important; }
          h2 { font-size: 1.25rem !important; margin-bottom: 0.5rem !important; }
          h3 { font-size: 1.125rem !important; margin-bottom: 0.25rem !important; }
          .max-w-4xl { max-width: 100% !important; }
          .p-6 { padding: 1rem !important; }
          .mb-8 { margin-bottom: 1rem !important; }
          .space-y-3 > * + * { margin-top: 0.5rem !important; }
          .space-y-2 > * + * { margin-top: 0.25rem !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto p-6 print:p-4 print:max-w-full">
        {/* Header */}
        <div className="text-center mb-8 print:mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4 print:mb-2 print:w-12 print:h-12">
            <CheckCircleIcon className="h-8 w-8 text-primary-600 print:h-6 print:w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 print:text-xl print:mb-1">
            {lang === 'ar' ? 'نتائج الاختبار' : 'Test Results'}
          </h1>
          <p className="text-gray-500 print:text-sm">
            {lang === 'ar' ? 'تم تحليل العينة بنجاح' : 'Sample analysis completed successfully'}
          </p>
        </div>

      {/* Result Card */}
      <div className="bg-white border border-gray-300 rounded-xl shadow-lg mb-8 dark:bg-gray-800 dark:border-gray-600 print:shadow-none print:border-gray-400">
        {/* Test Information Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 print:p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <BeakerIcon className="h-10 w-10 text-primary-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {lang === 'ar' ? 'نوع الاختبار' : 'Test Type'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {DataService.getChemicalTestById(testId)?.[lang === 'ar' ? 'method_name_ar' : 'method_name'] || testId.charAt(0).toUpperCase() + testId.slice(1)} Test
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <ClockIcon className="h-10 w-10 text-primary-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {lang === 'ar' ? 'وقت الاختبار' : 'Test Time'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {result.timestamp.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Observed Color Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 print:p-4">
          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
            <EyeIcon className="h-8 w-8 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'اللون المُلاحظ' : 'Observed Color'}
            </h3>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {result.colorName || (lang === 'ar' ? 'لون مخصص' : 'Custom Color')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {selectedColor}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Possible Substances Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 print:p-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'المواد المحتملة' : 'Possible Substances'}
            </h3>
          </div>

          {result.substances.length > 0 ? (
            <div className="space-y-3">
              {result.substances.map((substance, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-lg"
                >
                  <div className="w-3 h-3 rounded-full bg-primary-600 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-gray-100 font-medium text-lg">
                    {substance}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {lang === 'ar' ? 'لا توجد مواد محددة لهذا اللون' : 'No specific substances identified for this color'}
              </p>
            </div>
          )}
        </div>

        {/* Confidence Level Section */}
        <div className={`border-b border-gray-200 dark:border-gray-700 p-6 print:p-4 ${confidenceInfo.bg}`}>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${confidenceInfo.color.replace('text-', 'bg-').replace('-600', '-100')} ${confidenceInfo.color.replace('text-', 'border-').replace('-600', '-300')} border-2`}>
                <CheckCircleIcon className={`h-5 w-5 ${confidenceInfo.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'مستوى الثقة' : 'Confidence Level'}
              </h3>
            </div>

            <div className="space-y-2">
              <div className={`text-5xl font-bold ${confidenceInfo.color} print:text-4xl`}>
                {result.confidence}%
              </div>
              <p className={`text-lg font-semibold ${confidenceInfo.color} print:text-base`}>
                {getConfidenceText(result.confidence)}
              </p>
              <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${confidenceInfo.color.replace('text-', 'bg-')}`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reference Section */}
        {(() => {
          const test = DataService.getChemicalTestById(testId);
          const reference = test?.reference;

          // Debug logging
          console.log('TestResults - testId:', testId);
          console.log('TestResults - test found:', test);
          console.log('TestResults - reference:', reference);

          if (reference && reference.trim()) {
            return (
              <div className="p-6 print:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {lang === 'ar' ? 'المرجع العلمي' : 'Scientific Reference'}
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {lang === 'ar' ? 'المصدر الأكاديمي للطريقة' : 'Academic source for this method'}
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                          {lang === 'ar' ? 'مرجع علمي' : 'Scientific Reference'}
                        </span>
                      </div>
                      <p className="text-sm text-blue-900 dark:text-blue-100 font-medium leading-relaxed">
                        {reference}
                      </p>
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {lang === 'ar'
                            ? 'هذا المرجع يؤكد صحة الطريقة المستخدمة في هذا الاختبار'
                            : 'This reference validates the methodology used in this test'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}


      </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-6 print:hidden">
          {/* Primary Action - Perform Another Test */}
          <div className="text-center">
            <Button
              onClick={() => {
                console.log('Perform Another Test clicked - navigating to tests page');
                router.push(`/${lang}/tests`);
              }}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-lg flex items-center space-x-3 rtl:space-x-reverse mx-auto shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <BeakerIcon className="h-6 w-6 text-white" />
              <span>{lang === 'ar' ? 'إجراء اختبار آخر' : 'Perform Another Test'}</span>
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              {lang === 'ar' ? 'ابدأ اختبار جديد بنوع مختلف من الكواشف' : 'Start a new test with a different type of reagent'}
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">

            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center space-x-2 rtl:space-x-reverse hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'طباعة التقرير' : 'Print Report'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center space-x-2 rtl:space-x-reverse hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ShareIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'مشاركة النتائج' : 'Share Results'}</span>
            </Button>
          </div>

          {/* Tertiary Actions */}
          <div className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                console.log('Back to color selection clicked');
                if (onBack) {
                  onBack();
                } else {
                  router.back();
                }
              }}
              className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'العودة لاختيار اللون' : 'Back to Color Selection'}</span>
            </Button>
          </div>
        </div>

        {/* Save Confirmation */}
        {saved && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg print:hidden">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">
                {lang === 'ar' ? 'تم حفظ النتائج بنجاح' : 'Results saved successfully'}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
