'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { DataService } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import { ReportsSystem } from './reports-system';
import { DatabaseManagement } from './database-management';
import { ExcelManagement } from './excel-management';
import { TestsManagement } from './tests-management';
import { ColorResultsManagement } from './color-results-management';
import {
  ChartBarIcon,
  BeakerIcon,
  SwatchIcon,
  UsersIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  CircleStackIcon,
  TableCellsIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface AdminDashboardProps {
  lang: Language;
}

interface DashboardStats {
  totalTests: number;
  totalColors: number;
  totalSessions: number;
  recentActivity: any[];
  popularTests: any[];
  systemHealth: string;
}

export function AdminDashboard({ lang }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    totalColors: 0,
    totalSessions: 0,
    recentActivity: [],
    popularTests: [],
    systemHealth: 'good'
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const t = getTranslationsSync(lang);

  const tabs = [
    { id: 'dashboard', name: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard', icon: ChartBarIcon },
    { id: 'tests', name: lang === 'ar' ? 'إدارة الاختبارات' : 'Tests Management', icon: BeakerIcon },
    { id: 'colors', name: lang === 'ar' ? 'إدارة النتائج اللونية' : 'Color Results', icon: SwatchIcon },
    { id: 'reports', name: lang === 'ar' ? 'التقارير' : 'Reports', icon: DocumentTextIcon },
    { id: 'database', name: lang === 'ar' ? 'قاعدة البيانات' : 'Database', icon: CircleStackIcon },
    { id: 'excel', name: lang === 'ar' ? 'ملفات Excel' : 'Excel Files', icon: TableCellsIcon }
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load basic stats
        const tests = DataService.getChemicalTests();
        const colors = DataService.getColorResults();
        
        // Get stored sessions from localStorage
        const sessions = JSON.parse(localStorage.getItem('test_results') || '[]');
        const recentSessions = sessions.slice(-10).reverse();
        
        // Calculate popular tests
        const testCounts = sessions.reduce((acc: any, session: any) => {
          acc[session.testId] = (acc[session.testId] || 0) + 1;
          return acc;
        }, {});
        
        const popularTests = Object.entries(testCounts)
          .map(([testId, count]) => ({ testId, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalTests: tests.length,
          totalColors: colors.length,
          totalSessions: sessions.length,
          recentActivity: recentSessions,
          popularTests,
          systemHealth: 'good'
        });
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleExportData = () => {
    try {
      const data = {
        testResults: JSON.parse(localStorage.getItem('test_results') || '[]'),
        exportDate: new Date().toISOString(),
        version: '2.0.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `color-testing-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.testResults && Array.isArray(data.testResults)) {
          localStorage.setItem('test_results', JSON.stringify(data.testResults));
          window.location.reload();
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert(lang === 'ar' ? 'خطأ في استيراد البيانات' : 'Error importing data');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف جميع البيانات؟' : 'Are you sure you want to clear all data?')) {
      localStorage.removeItem('test_results');
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">
            {lang === 'ar' ? 'جاري تحميل البيانات...' : 'Loading dashboard data...'}
          </p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tests':
        return <TestsManagement lang={lang} />;
      case 'colors':
        return <ColorResultsManagement lang={lang} />;
      case 'reports':
        return <ReportsSystem lang={lang} />;
      case 'database':
        return <DatabaseManagement lang={lang} />;
      case 'excel':
        return <ExcelManagement lang={lang} />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {lang === 'ar' ? 'إجمالي الاختبارات' : 'Total Tests'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalTests}</p>
            </div>
            <BeakerIcon className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {lang === 'ar' ? 'النتائج اللونية' : 'Color Results'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalColors}</p>
            </div>
            <SwatchIcon className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {lang === 'ar' ? 'جلسات الاختبار' : 'Test Sessions'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSessions}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {lang === 'ar' ? 'حالة النظام' : 'System Health'}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {lang === 'ar' ? 'ممتاز' : 'Excellent'}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {lang === 'ar' ? 'إدارة البيانات' : 'Data Management'}
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleExportData}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'تصدير البيانات' : 'Export Data'}</span>
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-50 h-10 px-4 py-2 flex items-center space-x-2 rtl:space-x-reverse">
              <DocumentArrowUpIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'استيراد البيانات' : 'Import Data'}</span>
            </span>
          </label>

          <Button
            onClick={handleClearData}
            variant="destructive"
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <TrashIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'مسح البيانات' : 'Clear Data'}</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {lang === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
          </h3>
          
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <EyeIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.testId} Test
                    </p>
                    <p className="text-xs text-gray-500">
                      {lang === 'ar' ? 'ثقة:' : 'Confidence:'} {activity.confidence}%
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <ClockIcon className="h-4 w-4 inline mr-1 rtl:ml-1 rtl:mr-0" />
                    {new Date(activity.timestamp).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {lang === 'ar' ? 'لا يوجد نشاط حديث' : 'No recent activity'}
            </p>
          )}
        </div>

        {/* Popular Tests */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {lang === 'ar' ? 'الاختبارات الأكثر استخداماً' : 'Popular Tests'}
          </h3>
          
          {stats.popularTests.length > 0 ? (
            <div className="space-y-3">
              {stats.popularTests.map((test: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <ChartBarIcon className="h-5 w-5 text-primary-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {test.testId.charAt(0).toUpperCase() + test.testId.slice(1)} Test
                    </span>
                  </div>
                  <span className="text-sm font-medium text-primary-600">
                    {test.count} {lang === 'ar' ? 'مرة' : 'times'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {lang === 'ar' ? 'لا توجد بيانات كافية' : 'Not enough data'}
            </p>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {lang === 'ar' ? 'معلومات النظام' : 'System Information'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'الإصدار:' : 'Version:'}
            </span>
            <span className="text-gray-500 ml-2 rtl:mr-2 rtl:ml-0">2.0.0</span>
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'آخر تحديث:' : 'Last Updated:'}
            </span>
            <span className="text-gray-500 ml-2 rtl:mr-2 rtl:ml-0">
              {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'حالة التخزين:' : 'Storage Status:'}
            </span>
            <span className="text-green-600 ml-2 rtl:mr-2 rtl:ml-0">
              {lang === 'ar' ? 'متاح' : 'Available'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon
                className={`mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5 ${
                  activeTab === tab.id
                    ? 'text-primary-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
