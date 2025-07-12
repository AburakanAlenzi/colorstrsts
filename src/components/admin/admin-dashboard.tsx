'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { getChemicalTests } from '@/lib/firebase-realtime';
import { Button } from '@/components/ui/button';
import { ReportsSystem } from './reports-system';
import { DatabaseManagement } from './database-management';
import { ExcelManagement } from './excel-management';
import { TestsManagement } from './tests-management';
import TestsManagementNew from './TestsManagementNew';
import { ColorResultsManagement } from './color-results-management';
import { SubscriptionManagement } from './SubscriptionManagement';
import SubscriptionSettingsWrapper from './SubscriptionSettingsWrapper';
import FirebaseDebugger from './FirebaseDebugger';
import { STCPaySettings } from './STCPaySettings';
import { UsageChart } from './UsageChart';
import { exportTests } from '@/lib/firebase-tests';
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
  DocumentTextIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  LockOpenIcon
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
    { id: 'subscriptions', name: lang === 'ar' ? 'إدارة الاشتراكات' : 'Subscriptions', icon: CreditCardIcon },
    { id: 'subscription-settings', name: lang === 'ar' ? 'إعدادات الوصول' : 'Access Settings', icon: LockOpenIcon },
    { id: 'firebase-debugger', name: lang === 'ar' ? 'مصحح Firebase' : 'Firebase Debugger', icon: CogIcon },
    { id: 'payments', name: lang === 'ar' ? 'إعدادات الدفع' : 'Payment Settings', icon: Cog6ToothIcon },
    { id: 'reports', name: lang === 'ar' ? 'التقارير' : 'Reports', icon: DocumentTextIcon },
    { id: 'database', name: lang === 'ar' ? 'قاعدة البيانات' : 'Database', icon: CircleStackIcon },
    { id: 'excel', name: lang === 'ar' ? 'ملفات Excel' : 'Excel Files', icon: TableCellsIcon }
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        // Load basic stats from Firebase
        let tests: any[] = [];
        try {
          tests = await getChemicalTests();
        } catch (error) {
          console.error('Error loading tests from Firebase:', error);
          tests = [];
        }

        // Get stored sessions from localStorage (safe)
        let sessions: any[] = [];
        try {
          const sessionsData = localStorage.getItem('test_results');
          sessions = sessionsData ? JSON.parse(sessionsData) : [];
        } catch (error) {
          console.error('Error loading sessions from localStorage:', error);
          sessions = [];
        }

        const recentSessions = sessions.slice(-10).reverse();

        // Calculate popular tests (safe)
        const testCounts = sessions.reduce((acc: any, session: any) => {
          if (session && session.testId) {
            acc[session.testId] = (acc[session.testId] || 0) + 1;
          }
          return acc;
        }, {});

        const popularTests = Object.entries(testCounts)
          .map(([testId, count]) => ({ testId, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalTests: tests?.length || 0,
          totalColors: 0, // Will be updated when we have color results in Firebase
          totalSessions: sessions?.length || 0,
          recentActivity: recentSessions || [],
          popularTests: popularTests || [],
          systemHealth: 'good'
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set safe default values
        setStats({
          totalTests: 0,
          totalColors: 0,
          totalSessions: 0,
          recentActivity: [],
          popularTests: [],
          systemHealth: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleExportData = async () => {
    try {
      console.log('🚀 بدء تصدير جميع البيانات...');

      // جمع البيانات من Firebase أولاً
      let firebaseTests = [];
      try {
        console.log('📥 جلب البيانات من Firebase...');
        firebaseTests = await exportTests();
        console.log(`✅ تم جلب ${firebaseTests.length} اختبار من Firebase`);
      } catch (error) {
        console.warn('⚠️ فشل في جلب البيانات من Firebase:', error);
      }

      // جمع البيانات من جميع المصادر
      const exportData = {
        // بيانات الاختبارات الكيميائية (Firebase + localStorage)
        chemicalTests: {
          firebase: firebaseTests,
          localStorage: JSON.parse(localStorage.getItem('chemical_tests') || '[]')
        },

        // نتائج الاختبارات
        testResults: JSON.parse(localStorage.getItem('test_results') || '[]'),

        // جلسات الاختبار
        testSessions: JSON.parse(localStorage.getItem('test_sessions') || '[]'),

        // نتائج الألوان
        colorResults: JSON.parse(localStorage.getItem('color_results') || '[]'),

        // بيانات المستخدمين
        users: JSON.parse(localStorage.getItem('users') || '[]'),

        // الاشتراكات
        subscriptions: JSON.parse(localStorage.getItem('subscriptions') || '[]'),

        // تاريخ اختبارات المستخدمين
        userTestHistory: JSON.parse(localStorage.getItem('user_test_history') || '[]'),

        // إعدادات المستخدم
        userPreferences: JSON.parse(localStorage.getItem('user_preferences') || '{}'),

        // بيانات الإدارة
        adminData: JSON.parse(localStorage.getItem('admin_data') || '{}'),

        // إعدادات التطبيق
        appSettings: JSON.parse(localStorage.getItem('app_settings') || '{}'),

        // بيانات الدفع
        paymentData: JSON.parse(localStorage.getItem('payment_data') || '[]'),

        // إحصائيات الاستخدام
        usageStats: JSON.parse(localStorage.getItem('usage_stats') || '{}'),

        // معلومات التصدير
        exportInfo: {
          exportDate: new Date().toISOString(),
          version: '2.1.0',
          exportedBy: 'admin',
          totalRecords: 0,
          dataTypes: []
        }
      };

      // حساب إجمالي السجلات وأنواع البيانات
      let totalRecords = 0;
      const dataTypes = [];

      Object.keys(exportData).forEach(key => {
        if (key !== 'exportInfo') {
          const data = exportData[key as keyof typeof exportData];

          if (key === 'chemicalTests') {
            // معالجة خاصة للاختبارات الكيميائية
            const firebaseCount = data.firebase?.length || 0;
            const localCount = data.localStorage?.length || 0;
            totalRecords += firebaseCount + localCount;
            if (firebaseCount > 0 || localCount > 0) {
              dataTypes.push(`${key}: ${firebaseCount} Firebase + ${localCount} localStorage`);
            }
          } else if (Array.isArray(data)) {
            totalRecords += data.length;
            if (data.length > 0) {
              dataTypes.push(`${key}: ${data.length} records`);
            }
          } else if (typeof data === 'object' && data !== null) {
            const objectKeys = Object.keys(data);
            if (objectKeys.length > 0) {
              totalRecords += objectKeys.length;
              dataTypes.push(`${key}: ${objectKeys.length} items`);
            }
          }
        }
      });

      exportData.exportInfo.totalRecords = totalRecords;
      exportData.exportInfo.dataTypes = dataTypes;

      console.log(`📊 إجمالي السجلات للتصدير: ${totalRecords}`);
      console.log('📋 أنواع البيانات:', dataTypes);

      // إنشاء ملف JSON
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json;charset=utf-8'
      });

      // تحميل ملف JSON
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `complete-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      // إنشاء ملف Excel للبيانات الرئيسية
      await createExcelExport(exportData);

      alert(lang === 'ar'
        ? `تم تصدير ${totalRecords} سجل بنجاح من ${dataTypes.length} نوع بيانات مختلف`
        : `Successfully exported ${totalRecords} records from ${dataTypes.length} different data types`
      );

    } catch (error) {
      console.error('❌ خطأ في تصدير البيانات:', error);
      alert(lang === 'ar' ? 'حدث خطأ أثناء تصدير البيانات' : 'Error occurred while exporting data');
    }
  };

  // وظيفة إنشاء ملف Excel
  const createExcelExport = async (data: any) => {
    try {
      const { exportToExcel } = await import('@/lib/excel-utils');

      // تحضير البيانات للـ Excel
      const excelData = [];

      // إضافة الاختبارات الكيميائية من Firebase
      if (data.chemicalTests?.firebase && data.chemicalTests.firebase.length > 0) {
        data.chemicalTests.firebase.forEach((test: any) => {
          excelData.push({
            source: 'Firebase',
            type: 'Chemical Test',
            test_id: test.id || '',
            test_name: test.method_name || '',
            test_name_ar: test.method_name_ar || '',
            color_result: test.color_result || '',
            color_result_ar: test.color_result_ar || '',
            color_hex: '#FFFFFF',
            possible_substance: test.possible_substance || '',
            possible_substance_ar: test.possible_substance_ar || '',
            confidence_level: '75',
            category: test.test_type || 'basic',
            reference: test.reference || `REF-${test.id?.slice(-3) || '000'}`
          });
        });
      }

      // إضافة الاختبارات الكيميائية من localStorage
      if (data.chemicalTests?.localStorage && data.chemicalTests.localStorage.length > 0) {
        data.chemicalTests.localStorage.forEach((test: any) => {
          excelData.push({
            source: 'localStorage',
            type: 'Chemical Test',
            test_id: test.id || '',
            test_name: test.method_name || '',
            test_name_ar: test.method_name_ar || '',
            color_result: test.color_result || '',
            color_result_ar: test.color_result_ar || '',
            color_hex: '#FFFFFF',
            possible_substance: test.possible_substance || '',
            possible_substance_ar: test.possible_substance_ar || '',
            confidence_level: '75',
            category: test.test_type || 'basic',
            reference: test.reference || `REF-${test.id?.slice(-3) || '000'}`
          });
        });
      }

      // إضافة نتائج الاختبارات
      if (data.testResults && data.testResults.length > 0) {
        data.testResults.forEach((result: any) => {
          excelData.push({
            source: 'localStorage',
            type: 'Test Result',
            test_id: result.testId || '',
            result_id: result.id || '',
            user_id: result.userId || '',
            timestamp: result.timestamp || '',
            status: result.status || '',
            notes: result.notes || ''
          });
        });
      }

      // إضافة بيانات المستخدمين
      if (data.users && data.users.length > 0) {
        data.users.forEach((user: any) => {
          excelData.push({
            source: 'localStorage',
            type: 'User',
            user_id: user.id || '',
            email: user.email || '',
            name: user.name || '',
            subscription_type: user.subscriptionType || '',
            created_at: user.createdAt || ''
          });
        });
      }

      if (excelData.length > 0) {
        await exportToExcel(excelData, `complete-data-export-${new Date().toISOString().split('T')[0]}`);
      }
    } catch (error) {
      console.error('خطأ في إنشاء ملف Excel:', error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log('🚀 بدء استيراد البيانات...');
        const importedData = JSON.parse(e.target?.result as string);

        let importedCount = 0;
        const importedTypes = [];

        // استيراد البيانات المختلفة
        const dataMapping = {
          testResults: 'test_results',
          testSessions: 'test_sessions',
          colorResults: 'color_results',
          users: 'users',
          subscriptions: 'subscriptions',
          userTestHistory: 'user_test_history',
          userPreferences: 'user_preferences',
          adminData: 'admin_data',
          appSettings: 'app_settings',
          paymentData: 'payment_data',
          usageStats: 'usage_stats'
        };

        // معالجة خاصة للاختبارات الكيميائية
        if (importedData.chemicalTests) {
          const chemicalTestsData = importedData.chemicalTests;

          // إذا كانت البيانات في التنسيق الجديد (firebase + localStorage)
          if (chemicalTestsData.firebase || chemicalTestsData.localStorage) {
            // استيراد بيانات localStorage
            if (chemicalTestsData.localStorage && Array.isArray(chemicalTestsData.localStorage)) {
              const existingData = JSON.parse(localStorage.getItem('chemical_tests') || '[]');
              const mergedData = mergeArrayData(existingData, chemicalTestsData.localStorage);
              localStorage.setItem('chemical_tests', JSON.stringify(mergedData));
              importedCount += chemicalTestsData.localStorage.length;
              importedTypes.push(`chemicalTests (localStorage): ${chemicalTestsData.localStorage.length} records`);
            }

            // ملاحظة: بيانات Firebase تحتاج إلى معالجة خاصة عبر API
            if (chemicalTestsData.firebase && Array.isArray(chemicalTestsData.firebase)) {
              console.log(`⚠️ تم العثور على ${chemicalTestsData.firebase.length} اختبار من Firebase - يحتاج معالجة خاصة`);
              importedTypes.push(`chemicalTests (Firebase): ${chemicalTestsData.firebase.length} records (noted for manual import)`);
            }
          }
          // إذا كانت البيانات في التنسيق القديم (مصفوفة مباشرة)
          else if (Array.isArray(chemicalTestsData)) {
            const existingData = JSON.parse(localStorage.getItem('chemical_tests') || '[]');
            const mergedData = mergeArrayData(existingData, chemicalTestsData);
            localStorage.setItem('chemical_tests', JSON.stringify(mergedData));
            importedCount += chemicalTestsData.length;
            importedTypes.push(`chemicalTests: ${chemicalTestsData.length} records`);
          }
        }

        // استيراد باقي البيانات
        Object.entries(dataMapping).forEach(([importKey, storageKey]) => {
          if (importedData[importKey]) {
            const data = importedData[importKey];

            if (Array.isArray(data) && data.length > 0) {
              // للمصفوفات، دمج البيانات الموجودة مع الجديدة
              const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
              const mergedData = mergeArrayData(existingData, data);
              localStorage.setItem(storageKey, JSON.stringify(mergedData));
              importedCount += data.length;
              importedTypes.push(`${importKey}: ${data.length} records`);
            } else if (typeof data === 'object' && data !== null) {
              // للكائنات، دمج الخصائص
              const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
              const mergedData = { ...existingData, ...data };
              localStorage.setItem(storageKey, JSON.stringify(mergedData));
              const objectKeys = Object.keys(data);
              if (objectKeys.length > 0) {
                importedCount += objectKeys.length;
                importedTypes.push(`${importKey}: ${objectKeys.length} items`);
              }
            }
          }
        });

        console.log(`📊 تم استيراد ${importedCount} سجل`);
        console.log('📋 أنواع البيانات المستوردة:', importedTypes);

        if (importedCount > 0) {
          alert(lang === 'ar'
            ? `تم استيراد ${importedCount} سجل بنجاح من ${importedTypes.length} نوع بيانات مختلف.\n\nسيتم إعادة تحميل الصفحة لتطبيق التغييرات.`
            : `Successfully imported ${importedCount} records from ${importedTypes.length} different data types.\n\nThe page will reload to apply changes.`
          );

          // إعادة تحميل الصفحة لتطبيق التغييرات
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          alert(lang === 'ar' ? 'لم يتم العثور على بيانات صالحة للاستيراد' : 'No valid data found to import');
        }

      } catch (error) {
        console.error('❌ خطأ في استيراد البيانات:', error);
        alert(lang === 'ar' ? 'خطأ في استيراد البيانات - تأكد من صحة تنسيق الملف' : 'Error importing data - please check file format');
      }
    };
    reader.readAsText(file);

    // إعادة تعيين قيمة الإدخال
    event.target.value = '';
  };

  // وظيفة دمج بيانات المصفوفات
  const mergeArrayData = (existing: any[], imported: any[]) => {
    const merged = [...existing];

    imported.forEach(importedItem => {
      // البحث عن عنصر موجود بنفس المعرف
      const existingIndex = merged.findIndex(existingItem =>
        existingItem.id === importedItem.id ||
        existingItem.test_id === importedItem.test_id ||
        existingItem.email === importedItem.email
      );

      if (existingIndex >= 0) {
        // تحديث العنصر الموجود
        merged[existingIndex] = { ...merged[existingIndex], ...importedItem };
      } else {
        // إضافة عنصر جديد
        merged.push(importedItem);
      }
    });

    return merged;
  };

  // وظيفة تصدير نوع بيانات محدد
  const handleExportSpecificData = async (dataType: string) => {
    try {
      let exportData: any = {};
      let fileName = '';

      switch (dataType) {
        case 'chemicalTests':
          const firebaseTests = await exportTests().catch(() => []);
          exportData = {
            chemicalTests: {
              firebase: firebaseTests,
              localStorage: JSON.parse(localStorage.getItem('chemical_tests') || '[]')
            },
            exportInfo: {
              exportDate: new Date().toISOString(),
              dataType: 'Chemical Tests Only',
              version: '2.1.0'
            }
          };
          fileName = `chemical-tests-${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'testResults':
          exportData = {
            testResults: JSON.parse(localStorage.getItem('test_results') || '[]'),
            exportInfo: {
              exportDate: new Date().toISOString(),
              dataType: 'Test Results Only',
              version: '2.1.0'
            }
          };
          fileName = `test-results-${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'users':
          exportData = {
            users: JSON.parse(localStorage.getItem('users') || '[]'),
            subscriptions: JSON.parse(localStorage.getItem('subscriptions') || '[]'),
            exportInfo: {
              exportDate: new Date().toISOString(),
              dataType: 'Users and Subscriptions',
              version: '2.1.0'
            }
          };
          fileName = `users-data-${new Date().toISOString().split('T')[0]}.json`;
          break;

        default:
          throw new Error('نوع البيانات غير مدعوم');
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json;charset=utf-8'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const recordCount = Array.isArray(exportData[dataType])
        ? exportData[dataType].length
        : (exportData[dataType]?.firebase?.length || 0) + (exportData[dataType]?.localStorage?.length || 0);

      alert(lang === 'ar'
        ? `تم تصدير ${recordCount} سجل من ${dataType} بنجاح`
        : `Successfully exported ${recordCount} records from ${dataType}`
      );

    } catch (error) {
      console.error('خطأ في تصدير البيانات المحددة:', error);
      alert(lang === 'ar' ? 'حدث خطأ أثناء التصدير' : 'Error occurred during export');
    }
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
        return <TestsManagementNew translations={getTranslationsSync(lang).testsManagement} isRTL={lang === 'ar'} />;
      case 'colors':
        return <ColorResultsManagement lang={lang} />;
      case 'subscriptions':
        return <SubscriptionManagement lang={lang} />;
      case 'subscription-settings':
        return <SubscriptionSettingsWrapper lang={lang} />;
      case 'firebase-debugger':
        return <FirebaseDebugger lang={lang} />;
      case 'payments':
        return <STCPaySettings lang={lang} />;
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {lang === 'ar' ? 'مرحباً بك في لوحة الإدارة' : 'Welcome to Admin Dashboard'}
            </h1>
            <p className="text-cyan-100">
              {lang === 'ar' ? 'إدارة شاملة لنظام اختبارات الألوان' : 'Comprehensive management for color testing system'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <ChartBarIcon className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tests Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {lang === 'ar' ? 'إجمالي الاختبارات' : 'Total Tests'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.totalTests}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-500 text-sm font-medium">+12%</span>
                <span className="text-gray-500 text-sm ml-2">{lang === 'ar' ? 'هذا الشهر' : 'this month'}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BeakerIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Color Results Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {lang === 'ar' ? 'النتائج اللونية' : 'Color Results'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.totalColors}</p>
              <div className="flex items-center mt-2">
                <span className="text-purple-500 text-sm font-medium">+8%</span>
                <span className="text-gray-500 text-sm ml-2">{lang === 'ar' ? 'هذا الأسبوع' : 'this week'}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <SwatchIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Test Sessions Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {lang === 'ar' ? 'جلسات الاختبار' : 'Test Sessions'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.totalSessions}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-500 text-sm font-medium">+24%</span>
                <span className="text-gray-500 text-sm ml-2">{lang === 'ar' ? 'اليوم' : 'today'}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {lang === 'ar' ? 'حالة النظام' : 'System Health'}
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {lang === 'ar' ? 'ممتاز' : 'Excellent'}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-500 text-sm">{lang === 'ar' ? 'جميع الأنظمة تعمل' : 'All systems operational'}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {lang === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
          </h3>

          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl p-4 flex items-center space-x-4 rtl:space-x-reverse transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              <div className="text-left rtl:text-right">
                <div className="font-semibold">{lang === 'ar' ? 'إدارة الاشتراكات' : 'Subscription Management'}</div>
                <div className="text-sm opacity-90">{lang === 'ar' ? 'المستخدمين والمدفوعات' : 'Users & Payments'}</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl p-4 flex items-center space-x-4 rtl:space-x-reverse transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BeakerIcon className="h-6 w-6" />
              </div>
              <div className="text-left rtl:text-right">
                <div className="font-semibold">{lang === 'ar' ? 'إدارة الاختبارات' : 'Tests Management'}</div>
                <div className="text-sm opacity-90">{lang === 'ar' ? 'إضافة وتحرير وحذف' : 'Add, Edit & Delete'}</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl p-4 flex items-center space-x-4 rtl:space-x-reverse transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Cog6ToothIcon className="h-6 w-6" />
              </div>
              <div className="text-left rtl:text-right">
                <div className="font-semibold">{lang === 'ar' ? 'إعدادات الدفع' : 'Payment Settings'}</div>
                <div className="text-sm opacity-90">{lang === 'ar' ? 'STC Pay وإعدادات النظام' : 'STC Pay & System Config'}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Analytics Chart Placeholder */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {lang === 'ar' ? 'إحصائيات الاستخدام' : 'Usage Analytics'}
          </h3>

          <UsageChart lang={lang} />
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {lang === 'ar' ? 'إدارة البيانات' : 'Data Management'}
        </h3>

        <div className="space-y-4">
          {/* تصدير شامل */}
          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
              {lang === 'ar' ? 'تصدير شامل' : 'Complete Export'}
            </h4>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleExportData}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 rtl:space-x-reverse"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? 'تصدير جميع البيانات' : 'Export All Data'}</span>
              </Button>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 bg-green-600 hover:bg-green-700 text-white h-10 px-4 py-2 flex items-center space-x-2 rtl:space-x-reverse">
                  <DocumentArrowUpIcon className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'استيراد البيانات' : 'Import Data'}</span>
                </span>
              </label>
            </div>
          </div>

          {/* تصدير محدد */}
          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
              {lang === 'ar' ? 'تصدير محدد' : 'Specific Export'}
            </h4>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleExportSpecificData('chemicalTests')}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 flex items-center space-x-2 rtl:space-x-reverse"
              >
                <BeakerIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? 'الاختبارات الكيميائية' : 'Chemical Tests'}</span>
              </Button>

              <Button
                onClick={() => handleExportSpecificData('testResults')}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20 flex items-center space-x-2 rtl:space-x-reverse"
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? 'نتائج الاختبارات' : 'Test Results'}</span>
              </Button>

              <Button
                onClick={() => handleExportSpecificData('users')}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 flex items-center space-x-2 rtl:space-x-reverse"
              >
                <UsersIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? 'المستخدمون والاشتراكات' : 'Users & Subscriptions'}</span>
              </Button>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{lang === 'ar' ? 'ملاحظة:' : 'Note:'}</strong>{' '}
              {lang === 'ar'
                ? 'التصدير الشامل يتضمن جميع البيانات من Firebase و localStorage. يمكنك تعديل البيانات المصدرة واستيرادها مرة أخرى.'
                : 'Complete export includes all data from Firebase and localStorage. You can edit exported data and import it back.'
              }
            </p>
          </div>

          {/* Clear Data Button */}
          <div className="mt-4">
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
      </div>

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
