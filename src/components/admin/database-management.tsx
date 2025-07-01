'use client';

import { useState } from 'react';
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
  ClockIcon
} from '@heroicons/react/24/outline';

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
}

export function DatabaseManagement({ lang }: DatabaseManagementProps) {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    status: 'healthy',
    totalRecords: 1247,
    lastBackup: '2025-01-10 14:30:00',
    size: '2.4 MB',
    version: '2.0.0',
    uptime: '15 days, 6 hours'
  });
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  const t = getTranslationsSync(lang);

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

  const createBackup = async () => {
    setBackupLoading(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create backup file
      const backupData = {
        timestamp: new Date().toISOString(),
        version: dbStatus.version,
        records: dbStatus.totalRecords,
        data: 'Mock backup data...'
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup time
      setDbStatus(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleString()
      }));
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setBackupLoading(false);
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

          {/* Uptime */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === 'ar' ? 'وقت التشغيل' : 'Uptime'}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dbStatus.uptime}
            </p>
          </div>
        </div>
      </div>

      {/* Database Operations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {lang === 'ar' ? 'عمليات قاعدة البيانات' : 'Database Operations'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
