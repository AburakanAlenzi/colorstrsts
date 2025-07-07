'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Language } from '@/types';
import { useAuth } from '@/components/providers';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  BeakerIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface RecentTestsProps {
  lang: Language;
}

interface TestResult {
  id: string;
  testType: string;
  color: string;
  result: 'positive' | 'negative' | 'inconclusive';
  date: string;
  substances?: string[];
}

export function RecentTests({ lang }: RecentTestsProps) {
  const { user } = useAuth();
  const t = getTranslationsSync(lang);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // هنا يمكن جلب الاختبارات الفعلية من قاعدة البيانات
    // مؤقتاً سنستخدم بيانات تجريبية
    const mockTests: TestResult[] = [
      {
        id: '1',
        testType: 'Marquis',
        color: '#8B4513',
        result: 'positive',
        date: '2024-01-15T10:30:00Z',
        substances: ['MDMA', 'Amphetamine']
      },
      {
        id: '2',
        testType: 'Mecke',
        color: '#000080',
        result: 'negative',
        date: '2024-01-14T15:45:00Z',
        substances: []
      },
      {
        id: '3',
        testType: 'Liebermann',
        color: '#FFD700',
        result: 'inconclusive',
        date: '2024-01-13T09:15:00Z',
        substances: ['Unknown']
      },
      {
        id: '4',
        testType: 'Simon',
        color: '#4169E1',
        result: 'positive',
        date: '2024-01-12T14:20:00Z',
        substances: ['MDMA']
      },
      {
        id: '5',
        testType: 'Marquis',
        color: '#32CD32',
        result: 'negative',
        date: '2024-01-11T11:10:00Z',
        substances: []
      }
    ];
    
    setTimeout(() => {
      setTests(mockTests);
      setLoading(false);
    }, 1000);
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'positive':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'inconclusive':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <BeakerIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'positive':
        return lang === 'ar' ? 'إيجابي' : 'Positive';
      case 'negative':
        return lang === 'ar' ? 'سلبي' : 'Negative';
      case 'inconclusive':
        return lang === 'ar' ? 'غير محدد' : 'Inconclusive';
      default:
        return lang === 'ar' ? 'غير معروف' : 'Unknown';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'positive':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'negative':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'inconclusive':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <BeakerIcon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {lang === 'ar' ? 'الاختبارات الأخيرة' : 'Recent Tests'}
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <BeakerIcon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {lang === 'ar' ? 'الاختبارات الأخيرة' : 'Recent Tests'}
          </h2>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/${lang}/results`}>
            {lang === 'ar' ? 'عرض الكل' : 'View All'}
          </Link>
        </Button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-12">
          <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {lang === 'ar' ? 'لا توجد اختبارات بعد' : 'No tests yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {lang === 'ar' 
              ? 'ابدأ اختبارك الأول لرؤية النتائج هنا'
              : 'Start your first test to see results here'
            }
          </p>
          <Button asChild>
            <Link href={`/${lang}/tests`}>
              <BeakerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'ابدأ اختبار' : 'Start Test'}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* عينة اللون */}
              <div className="flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: test.color }}
                  title={`Color: ${test.color}`}
                />
              </div>

              {/* معلومات الاختبار */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {test.testType}
                  </h3>
                  {getResultIcon(test.result)}
                </div>
                
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(test.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTime(test.date)}</span>
                  </div>
                </div>

                {test.substances && test.substances.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {test.substances.map((substance, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
                        >
                          {substance}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* النتيجة والإجراءات */}
              <div className="flex-shrink-0 text-right rtl:text-left">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(test.result)}`}>
                  {getResultText(test.result)}
                </span>
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${lang}/results/${test.id}`}>
                      <EyeIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                      {lang === 'ar' ? 'عرض' : 'View'}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
