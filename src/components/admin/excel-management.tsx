'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  readExcelFile,
  validateExcelData,
  exportToExcel,
  createBackup,
  convertExcelToDatabase,
  downloadSampleTemplate,
  getSampleExcelData,
  EXPECTED_HEADERS,
  type ExcelData,
  type ValidationError
} from '@/lib/excel-utils';
import {
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

interface ExcelManagementProps {
  lang: Language;
}

export function ExcelManagement({ lang }: ExcelManagementProps) {
  const [uploadedData, setUploadedData] = useState<ExcelData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const t = getTranslationsSync(lang);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setValidationErrors([]);

    try {
      // Read Excel file using the utility library
      const excelData = await readExcelFile(file);

      // Validate data
      const errors = validateExcelData(excelData, lang);
      setValidationErrors(errors);
      setUploadedData(excelData);
      setShowPreview(true);

    } catch (error) {
      console.error('Error reading file:', error);
      alert(lang === 'ar' ? 'خطأ في قراءة الملف' : 'Error reading file');
    } finally {
      setUploading(false);
    }
  };



  const importData = async () => {
    if (!uploadedData || validationErrors.length > 0) return;

    setImporting(true);
    try {
      // Create backup before importing
      const existingData = JSON.parse(localStorage.getItem('chemical_tests') || '[]');
      createBackup(existingData, 'pre-import-backup');

      // Convert Excel data to database format
      const newData = convertExcelToDatabase(uploadedData);

      // Merge with existing data or replace
      const updatedData = [...existingData, ...newData];
      localStorage.setItem('chemical_tests', JSON.stringify(updatedData));

      alert(lang === 'ar'
        ? `تم استيراد ${uploadedData.rowCount} سجل بنجاح`
        : `Successfully imported ${uploadedData.rowCount} records`
      );

      // Reset state
      setUploadedData(null);
      setShowPreview(false);
      setValidationErrors([]);

    } catch (error) {
      console.error('Error importing data:', error);
      alert(lang === 'ar' ? 'خطأ في استيراد البيانات' : 'Error importing data');
    } finally {
      setImporting(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      // Get existing data or use sample data
      const existingData = JSON.parse(localStorage.getItem('chemical_tests') || '[]');
      const dataToExport = existingData.length > 0 ? existingData : getSampleExcelData();

      // Export to Excel
      exportToExcel(dataToExport, `chemical-tests-export-${new Date().toISOString().split('T')[0]}`);

    } catch (error) {
      console.error('Error exporting data:', error);
      alert(lang === 'ar' ? 'خطأ في تصدير البيانات' : 'Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <TableCellsIcon className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'إدارة ملفات Excel' : 'Excel File Management'}
          </h2>
        </div>
      </div>

      {/* Import/Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <div className="text-center mb-6">
            <DocumentArrowUpIcon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'استيراد البيانات' : 'Import Data'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {lang === 'ar' 
                ? 'رفع ملف Excel لاستيراد البيانات إلى قاعدة البيانات'
                : 'Upload Excel file to import data into database'
              }
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                className="hidden"
                id="excel-upload"
              />
              <Button
                onClick={() => document.getElementById('excel-upload')?.click()}
                loading={uploading}
                disabled={uploading}
                className="w-full"
              >
                {lang === 'ar' ? 'اختيار ملف Excel' : 'Choose Excel File'}
              </Button>
            </div>

            {/* Expected Format */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {lang === 'ar' ? 'التنسيق المطلوب:' : 'Expected Format:'}
                </h4>
                <Button
                  onClick={downloadSampleTemplate}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {lang === 'ar' ? 'تحميل نموذج' : 'Download Template'}
                </Button>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {EXPECTED_HEADERS.map(header => (
                  <div key={header} className="font-mono">
                    {header}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <div className="text-center mb-6">
            <DocumentArrowDownIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'تصدير البيانات' : 'Export Data'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {lang === 'ar' 
                ? 'تصدير البيانات الحالية إلى ملف Excel'
                : 'Export current data to Excel file'
              }
            </p>
          </div>

          <Button
            onClick={exportData}
            loading={exporting}
            disabled={exporting}
            className="w-full"
          >
            {lang === 'ar' ? 'تصدير إلى Excel' : 'Export to Excel'}
          </Button>
        </div>
      </div>

      {/* File Preview */}
      {uploadedData && showPreview && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'معاينة الملف' : 'File Preview'}
            </h3>
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
              size="sm"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>

          {/* File Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? 'اسم الملف' : 'File Name'}
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">{uploadedData.fileName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? 'حجم الملف' : 'File Size'}
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">{uploadedData.fileSize}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? 'عدد الصفوف' : 'Row Count'}
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">{uploadedData.rowCount}</p>
            </div>
          </div>

          {/* Validation Status */}
          <div className="mb-6">
            {validationErrors.length === 0 ? (
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">
                  {lang === 'ar' ? 'الملف صالح للاستيراد' : 'File is valid for import'}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-red-600">
                  <XCircleIcon className="h-5 w-5" />
                  <span className="font-medium">
                    {lang === 'ar' 
                      ? `تم العثور على ${validationErrors.length} خطأ`
                      : `Found ${validationErrors.length} validation errors`
                    }
                  </span>
                </div>
                <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 dark:text-red-300">
                      {lang === 'ar' ? 'صف' : 'Row'} {error.row}, {lang === 'ar' ? 'عمود' : 'Column'} {error.column}: {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Data Preview Table */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {uploadedData.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {uploadedData.rows.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {uploadedData.rows.length > 5 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                {lang === 'ar' 
                  ? `... و ${uploadedData.rows.length - 5} صف إضافي`
                  : `... and ${uploadedData.rows.length - 5} more rows`
                }
              </p>
            )}
          </div>

          {/* Import Button */}
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={importData}
              loading={importing}
              disabled={importing || validationErrors.length > 0}
            >
              {lang === 'ar' ? 'استيراد البيانات' : 'Import Data'}
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">
              {lang === 'ar' ? 'تعليمات مهمة:' : 'Important Instructions:'}
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                {lang === 'ar' 
                  ? 'تأكد من أن ملف Excel يحتوي على جميع الأعمدة المطلوبة'
                  : 'Make sure Excel file contains all required columns'
                }
              </li>
              <li>
                {lang === 'ar' 
                  ? 'سيتم إنشاء نسخة احتياطية تلقائياً قبل الاستيراد'
                  : 'Automatic backup will be created before import'
                }
              </li>
              <li>
                {lang === 'ar' 
                  ? 'الملفات المدعومة: .xlsx, .xls, .csv'
                  : 'Supported formats: .xlsx, .xls, .csv'
                }
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
