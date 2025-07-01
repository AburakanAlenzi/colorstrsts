'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { generatePDFReport, type ReportData } from '@/lib/pdf-utils';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
  FunnelIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface ReportsSystemProps {
  lang: Language;
}

interface ReportFilter {
  startDate: string;
  endDate: string;
  testType: string;
  reportType: string;
}



export function ReportsSystem({ lang }: ReportsSystemProps) {
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: '',
    endDate: '',
    testType: 'all',
    reportType: 'usage'
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const t = getTranslationsSync(lang);

  const testTypes = [
    { id: 'all', name: lang === 'ar' ? 'جميع الاختبارات' : 'All Tests' },
    { id: 'marquis', name: 'Marquis Test' },
    { id: 'mecke', name: 'Mecke Test' },
    { id: 'ferric-sulfate', name: 'Ferric Sulfate Test' },
    { id: 'liebermann', name: 'Liebermann Test' },
    { id: 'simon', name: 'Simon Test' },
    { id: 'ehrlich', name: 'Ehrlich Test' }
  ];

  const reportTypes = [
    { id: 'usage', name: lang === 'ar' ? 'تقرير الاستخدام' : 'Usage Report' },
    { id: 'analytics', name: lang === 'ar' ? 'تقرير التحليلات' : 'Analytics Report' },
    { id: 'summary', name: lang === 'ar' ? 'تقرير ملخص' : 'Summary Report' }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data - in real app, this would come from API
      const mockData: ReportData = {
        totalTests: 1247,
        testsByType: {
          'marquis': 342,
          'mecke': 298,
          'ferric-sulfate': 187,
          'liebermann': 156,
          'simon': 134,
          'ehrlich': 130
        },
        dailyUsage: [
          { date: '2025-01-01', count: 45 },
          { date: '2025-01-02', count: 52 },
          { date: '2025-01-03', count: 38 },
          { date: '2025-01-04', count: 67 },
          { date: '2025-01-05', count: 41 }
        ],
        popularTests: [
          { testId: 'marquis', count: 342, name: 'Marquis Test' },
          { testId: 'mecke', count: 298, name: 'Mecke Test' },
          { testId: 'ferric-sulfate', count: 187, name: 'Ferric Sulfate Test' }
        ]
      };
      
      setReportData(mockData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportData) return;

    setGenerating(true);
    try {
      const reportTitle = lang === 'ar'
        ? `تقرير ${reportTypes.find(t => t.id === filters.reportType)?.name || 'عام'}`
        : `${reportTypes.find(t => t.id === filters.reportType)?.name || 'General'} Report`;

      const reportSubtitle = filters.startDate && filters.endDate
        ? `${filters.startDate} - ${filters.endDate}`
        : undefined;

      await generatePDFReport(reportData, {
        title: reportTitle,
        subtitle: reportSubtitle,
        language: lang,
        orientation: 'portrait'
      });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(lang === 'ar' ? 'خطأ في تصدير PDF' : 'Error exporting PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <ChartBarIcon className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'نظام التقارير' : 'Reports System'}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {lang === 'ar' ? 'فلاتر التقرير' : 'Report Filters'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          {/* Test Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'ar' ? 'نوع الاختبار' : 'Test Type'}
            </label>
            <select
              value={filters.testType}
              onChange={(e) => setFilters(prev => ({ ...prev, testType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              {testTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'ar' ? 'نوع التقرير' : 'Report Type'}
            </label>
            <select
              value={filters.reportType}
              onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            onClick={generateReport}
            loading={loading}
            disabled={loading}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'إنشاء التقرير' : 'Generate Report'}</span>
          </Button>

          {reportData && (
            <Button
              onClick={exportToPDF}
              loading={generating}
              disabled={generating}
              variant="outline"
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            {lang === 'ar' ? 'نتائج التقرير' : 'Report Results'}
          </h3>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-primary-50 dark:bg-primary-950 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600 dark:text-primary-400">
                    {lang === 'ar' ? 'إجمالي الاختبارات' : 'Total Tests'}
                  </p>
                  <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                    {reportData.totalTests.toLocaleString()}
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-primary-600" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {lang === 'ar' ? 'أنواع الاختبارات' : 'Test Types'}
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {Object.keys(reportData.testsByType).length}
                  </p>
                </div>
                <FunnelIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {lang === 'ar' ? 'متوسط يومي' : 'Daily Average'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {Math.round(reportData.dailyUsage.reduce((sum, day) => sum + day.count, 0) / reportData.dailyUsage.length)}
                  </p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Popular Tests */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
              {lang === 'ar' ? 'الاختبارات الأكثر استخداماً' : 'Most Popular Tests'}
            </h4>
            <div className="space-y-3">
              {reportData.popularTests.map((test, index) => (
                <div key={test.testId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="flex items-center justify-center w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {test.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {test.count} {lang === 'ar' ? 'استخدام' : 'uses'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
