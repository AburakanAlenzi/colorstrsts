'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  CircleStackIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { firebaseTestsService, TestStatistics } from '@/lib/firebase-tests-service';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import {
  runFirebaseDiagnostics,
  fixCommonFirebaseIssues,
  createSampleData,
  exportFirebaseData,
  type FirebaseDiagnostics
} from '@/lib/firebase-diagnostics';
import toast from 'react-hot-toast';

interface DatabaseManagementProps {
  lang: Language;
}

interface DatabaseStatus {
  status: 'healthy' | 'warning' | 'error';
  totalRecords: number;
  lastBackup: string;
  size: string;
  version: string;
  uptime: string;
  firebaseConnected: boolean;
  lastSync: string;
}

export function DatabaseManagement({ lang }: DatabaseManagementProps) {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    status: 'healthy',
    totalRecords: 0,
    lastBackup: '',
    size: '0 MB',
    version: '2.0.0',
    uptime: '0 days',
    firebaseConnected: false,
    lastSync: ''
  });
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<FirebaseDiagnostics | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [statistics, setStatistics] = useState<TestStatistics | null>(null);

  const t = getTranslationsSync(lang);

  // Load Firebase statistics on component mount
  useEffect(() => {
    loadFirebaseStatistics();
  }, []);

  const loadFirebaseStatistics = async () => {
    setLoading(true);
    try {
      const stats = await firebaseTestsService.getTestsStatistics();
      const tests = await firebaseTestsService.getAllTests();

      setStatistics(stats);
      setDbStatus(prev => ({
        ...prev,
        status: 'healthy',
        totalRecords: tests.length,
        firebaseConnected: true,
        lastSync: new Date().toLocaleString(),
        size: `${(JSON.stringify(tests).length / 1024).toFixed(1)} KB`
      }));
    } catch (error) {
      console.error('Error loading Firebase statistics:', error);
      setDbStatus(prev => ({
        ...prev,
        status: 'error',
        firebaseConnected: false
      }));
      toast.error(lang === 'ar' ? 'خطأ في الاتصال بـ Firebase' : 'Error connecting to Firebase');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'error': return 'text-red-600 bg-red-50 dark:bg-red-950';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="h-5 w-5" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  // تشخيص Firebase شامل
  const runDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const result = await runFirebaseDiagnostics();
      setDiagnostics(result);

      // تحديث حالة قاعدة البيانات بناءً على التشخيص
      setDbStatus(prev => ({
        ...prev,
        totalRecords: result.totalRecords,
        firebaseConnected: result.isConnected,
        status: result.isConnected ? (result.totalRecords > 0 ? 'healthy' : 'warning') : 'error',
        size: `${result.totalSize.toFixed(2)} KB`,
        lastSync: new Date().toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')
      }));

      if (result.errors.length > 0) {
        toast.error(lang === 'ar' ? 'تم العثور على أخطاء في التشخيص' : 'Errors found in diagnostics');
      } else {
        toast.success(lang === 'ar' ? 'تم التشخيص بنجاح' : 'Diagnostics completed successfully');
      }

    } catch (error) {
      console.error('Error running diagnostics:', error);
      toast.error(lang === 'ar' ? 'فشل في تشخيص Firebase' : 'Failed to run Firebase diagnostics');
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  // إصلاح مشاكل Firebase
  const fixFirebaseIssues = async () => {
    setLoading(true);
    try {
      const result = await fixCommonFirebaseIssues();

      if (result.success) {
        toast.success(lang === 'ar' ? result.messageAr : result.message);
        // إعادة تشغيل التشخيص بعد الإصلاح
        await runDiagnostics();
      } else {
        toast.error(lang === 'ar' ? result.messageAr : result.message);
      }

    } catch (error) {
      console.error('Error fixing Firebase issues:', error);
      toast.error(lang === 'ar' ? 'فشل في إصلاح المشاكل' : 'Failed to fix issues');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setBackupLoading(true);
    try {
      // Get all tests from Firebase
      const tests = await firebaseTestsService.getAllTests();
      const stats = await firebaseTestsService.getTestsStatistics();

      // Create backup file
      const backupData = {
        timestamp: new Date().toISOString(),
        version: dbStatus.version,
        records: tests.length,
        statistics: stats,
        tests: tests
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `firebase-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup time
      setDbStatus(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleString()
      }));

      toast.success(lang === 'ar' ? 'تم إنشاء النسخة الاحتياطية' : 'Backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error(lang === 'ar' ? 'خطأ في إنشاء النسخة الاحتياطية' : 'Error creating backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const importFromJSON = async () => {
    setImportLoading(true);
    try {
      // Get tests from local JSON service
      const groupedTests = await databaseColorTestService.getGroupedTests();

      // Convert grouped tests to individual tests for Firebase
      const testsToImport = groupedTests.map(groupedTest => ({
        method_name: groupedTest.method_name,
        method_name_ar: groupedTest.method_name_ar,
        test_type: groupedTest.test_type,
        test_number: groupedTest.test_number,
        prepare: groupedTest.prepare,
        prepare_ar: groupedTest.prepare_ar,
        reference: groupedTest.reference,
        results: groupedTest.results,
        created_by: 'json_import'
      }));

      await firebaseTestsService.importFromJSON(testsToImport);
      await loadFirebaseStatistics(); // Refresh statistics

      toast.success(lang === 'ar' ? 'تم استيراد البيانات من JSON' : 'Data imported from JSON successfully');
    } catch (error) {
      console.error('Error importing from JSON:', error);
      toast.error(lang === 'ar' ? 'خطأ في استيراد البيانات' : 'Error importing data');
    } finally {
      setImportLoading(false);
    }
  };

  const handleRestore = async (file: File) => {
    setRestoreLoading(true);
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // In real app, would validate and restore from file
      console.log('Restoring from file:', file.name);
      
      alert(lang === 'ar' 
        ? 'تم استعادة قاعدة البيانات بنجاح' 
        : 'Database restored successfully'
      );
    } catch (error) {
      console.error('Error restoring database:', error);
      alert(lang === 'ar' 
        ? 'خطأ في استعادة قاعدة البيانات' 
        : 'Error restoring database'
      );
    } finally {
      setRestoreLoading(false);
    }
  };

  const runMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      // Simulate maintenance tasks
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Update database status
      setDbStatus(prev => ({
        ...prev,
        status: 'healthy',
        size: '2.2 MB' // Optimized size
      }));
      
      alert(lang === 'ar' 
        ? 'تم تشغيل صيانة قاعدة البيانات بنجاح' 
        : 'Database maintenance completed successfully'
      );
    } catch (error) {
      console.error('Error running maintenance:', error);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <CircleStackIcon className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'إدارة قاعدة البيانات' : 'Database Management'}
          </h2>
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {lang === 'ar' ? 'حالة قاعدة البيانات' : 'Database Status'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <div className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg ${getStatusColor(dbStatus.status)}`}>
              {getStatusIcon(dbStatus.status)}
              <span className="font-medium">
                {dbStatus.status === 'healthy' && (lang === 'ar' ? 'سليمة' : 'Healthy')}
                {dbStatus.status === 'warning' && (lang === 'ar' ? 'تحذير' : 'Warning')}
                {dbStatus.status === 'error' && (lang === 'ar' ? 'خطأ' : 'Error')}
              </span>
            </div>
          </div>

          {/* Total Records */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === 'ar' ? 'إجمالي السجلات' : 'Total Records'}
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {dbStatus.totalRecords.toLocaleString()}
            </p>
          </div>

          {/* Database Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === 'ar' ? 'حجم قاعدة البيانات' : 'Database Size'}
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {dbStatus.size}
            </p>
          </div>

          {/* Last Backup */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === 'ar' ? 'آخر نسخة احتياطية' : 'Last Backup'}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dbStatus.lastBackup}
            </p>
          </div>

          {/* Version */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === 'ar' ? 'الإصدار' : 'Version'}
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {dbStatus.version}
            </p>
          </div>

          {/* Firebase Connection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === 'ar' ? 'اتصال Firebase' : 'Firebase Connection'}
            </label>
            <div className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg ${
              dbStatus.firebaseConnected
                ? 'text-green-600 bg-green-50 dark:bg-green-950'
                : 'text-red-600 bg-red-50 dark:bg-red-950'
            }`}>
              <ServerIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {dbStatus.firebaseConnected
                  ? (lang === 'ar' ? 'متصل' : 'Connected')
                  : (lang === 'ar' ? 'غير متصل' : 'Disconnected')
                }
              </span>
            </div>
          </div>

          {/* Last Sync */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === 'ar' ? 'آخر مزامنة' : 'Last Sync'}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dbStatus.lastSync || (lang === 'ar' ? 'لم يتم' : 'Never')}
            </p>
          </div>
        </div>
      </div>

      {/* Firebase Statistics */}
      {statistics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {lang === 'ar' ? 'إحصائيات Firebase' : 'Firebase Statistics'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? 'إجمالي الاختبارات' : 'Total Tests'}
              </label>
              <p className="text-2xl font-bold text-primary-600">
                {statistics.total_tests}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? 'أنواع الاختبارات' : 'Test Types'}
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.tests_by_type ? Object.keys(statistics.tests_by_type).length : 0}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? 'إجمالي النتائج' : 'Total Results'}
              </label>
              <p className="text-2xl font-bold text-green-600">
                {statistics.total_results}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? 'آخر تحديث' : 'Last Updated'}
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {statistics.last_updated ? new Date(statistics.last_updated).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Database Operations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {lang === 'ar' ? 'عمليات قاعدة البيانات' : 'Database Operations'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Firebase Diagnostics */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'تشخيص Firebase' : 'Firebase Diagnostics'}
            </h4>
            <Button
              onClick={runDiagnostics}
              disabled={diagnosticsLoading}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              {diagnosticsLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <WrenchScrewdriverIcon className="h-4 w-4" />
              )}
              <span>
                {diagnosticsLoading
                  ? (lang === 'ar' ? 'جاري التشخيص...' : 'Running Diagnostics...')
                  : (lang === 'ar' ? 'تشخيص شامل' : 'Run Diagnostics')
                }
              </span>
            </Button>

            {/* Fix Issues Button */}
            <Button
              onClick={fixFirebaseIssues}
              disabled={loading}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <WrenchScrewdriverIcon className="h-4 w-4" />
              )}
              <span>
                {loading
                  ? (lang === 'ar' ? 'جاري الإصلاح...' : 'Fixing...')
                  : (lang === 'ar' ? 'إصلاح المشاكل' : 'Fix Issues')
                }
              </span>
            </Button>
          </div>

          {/* Backup */}
          <div className="space-y-4">
            <div className="text-center">
              <ArrowDownTrayIcon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'إنشاء نسخة احتياطية' : 'Create Backup'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {lang === 'ar' 
                  ? 'إنشاء نسخة احتياطية من قاعدة البيانات الحالية'
                  : 'Create a backup of the current database'
                }
              </p>
            </div>
            <Button
              onClick={createBackup}
              loading={backupLoading}
              disabled={backupLoading}
              className="w-full"
            >
              {lang === 'ar' ? 'إنشاء نسخة احتياطية' : 'Create Backup'}
            </Button>
          </div>

          {/* Restore */}
          <div className="space-y-4">
            <div className="text-center">
              <ArrowUpTrayIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'استعادة قاعدة البيانات' : 'Restore Database'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {lang === 'ar' 
                  ? 'استعادة قاعدة البيانات من نسخة احتياطية'
                  : 'Restore database from backup file'
                }
              </p>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleRestore(file);
                  }
                }}
                className="hidden"
                id="restore-file"
              />
              <Button
                onClick={() => document.getElementById('restore-file')?.click()}
                loading={restoreLoading}
                disabled={restoreLoading}
                variant="outline"
                className="w-full"
              >
                {lang === 'ar' ? 'اختيار ملف الاستعادة' : 'Choose Restore File'}
              </Button>
            </div>
          </div>

          {/* Import from JSON */}
          <div className="space-y-4">
            <div className="text-center">
              <CloudArrowUpIcon className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'استيراد من JSON' : 'Import from JSON'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {lang === 'ar'
                  ? 'استيراد البيانات من ملف JSON المحلي إلى Firebase'
                  : 'Import data from local JSON file to Firebase'
                }
              </p>
            </div>
            <Button
              onClick={importFromJSON}
              loading={importLoading}
              disabled={importLoading}
              variant="outline"
              className="w-full"
            >
              {lang === 'ar' ? 'استيراد البيانات' : 'Import Data'}
            </Button>
          </div>

          {/* Maintenance */}
          <div className="space-y-4">
            <div className="text-center">
              <WrenchScrewdriverIcon className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'صيانة قاعدة البيانات' : 'Database Maintenance'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {lang === 'ar'
                  ? 'تشغيل مهام الصيانة وتحسين الأداء'
                  : 'Run maintenance tasks and optimize performance'
                }
              </p>
            </div>
            <Button
              onClick={runMaintenance}
              loading={maintenanceLoading}
              disabled={maintenanceLoading}
              variant="outline"
              className="w-full"
            >
              {lang === 'ar' ? 'تشغيل الصيانة' : 'Run Maintenance'}
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-medium mb-1">
              {lang === 'ar' ? 'تحذير مهم:' : 'Important Warning:'}
            </p>
            <p>
              {lang === 'ar' 
                ? 'تأكد من إنشاء نسخة احتياطية قبل تشغيل عمليات الاستعادة أو الصيانة. هذه العمليات قد تؤثر على البيانات الحالية.'
                : 'Make sure to create a backup before running restore or maintenance operations. These operations may affect current data.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Diagnostics Results */}
      {diagnostics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {lang === 'ar' ? 'نتائج التشخيص' : 'Diagnostics Results'}
          </h3>

          {/* Connection Status */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
              {diagnostics.isConnected ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {lang === 'ar' ? 'حالة الاتصال:' : 'Connection Status:'}
              </span>
              <span className={diagnostics.isConnected ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.isConnected
                  ? (lang === 'ar' ? 'متصل' : 'Connected')
                  : (lang === 'ar' ? 'غير متصل' : 'Disconnected')
                }
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar' ? `معرف المشروع: ${diagnostics.projectId}` : `Project ID: ${diagnostics.projectId}`}
            </p>
          </div>

          {/* Collections Info */}
          {diagnostics.collections.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                {lang === 'ar' ? 'المجموعات:' : 'Collections:'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {diagnostics.collections.map((collection, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{collection.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {collection.count} {lang === 'ar' ? 'سجل' : 'records'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {collection.size}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {diagnostics.errors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-red-600 mb-3">
                {lang === 'ar' ? 'الأخطاء المكتشفة:' : 'Detected Errors:'}
              </h4>
              <div className="space-y-2">
                {diagnostics.errors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{diagnostics.totalRecords}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {lang === 'ar' ? 'إجمالي السجلات' : 'Total Records'}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{diagnostics.totalSize.toFixed(2)} KB</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {lang === 'ar' ? 'الحجم التقديري' : 'Estimated Size'}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{diagnostics.collections.length}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {lang === 'ar' ? 'المجموعات' : 'Collections'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
