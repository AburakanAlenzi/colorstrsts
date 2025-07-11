'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileSpreadsheet, Database, AlertCircle, CheckCircle } from 'lucide-react';

interface DataImportExportProps {
  isRTL: boolean;
}

export default function DataImportExport({ isRTL }: DataImportExportProps) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      // Read file content
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('File must contain header and at least one data row');
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['id', 'method_name', 'method_name_ar', 'color_result', 'color_result_ar', 'possible_substance', 'possible_substance_ar', 'prepare', 'test_type', 'test_number', 'reference'];

      // Validate headers
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      // Parse data rows
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row);
        }
      }

      // Save to localStorage (simulating database update)
      const existingData = JSON.parse(localStorage.getItem('chemical_tests') || '[]');
      const updatedData = [...existingData];

      data.forEach(newTest => {
        const existingIndex = updatedData.findIndex(test => test.id === newTest.id);
        if (existingIndex >= 0) {
          updatedData[existingIndex] = newTest; // Update existing
        } else {
          updatedData.push(newTest); // Add new
        }
      });

      localStorage.setItem('chemical_tests', JSON.stringify(updatedData));

      setMessage({
        type: 'success',
        text: isRTL
          ? `تم استيراد ${data.length} اختبار بنجاح من ${file.name}`
          : `Successfully imported ${data.length} tests from ${file.name}`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: isRTL
          ? `خطأ في استيراد البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
          : `Import error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);

    try {
      // Get data from localStorage
      const storedData = JSON.parse(localStorage.getItem('chemical_tests') || '[]');

      // If no data, use default template data
      const defaultData = [
        {
          id: '1',
          method_name: 'Marquis Test',
          method_name_ar: 'اختبار ماركيز',
          color_result: 'Purple/Black',
          color_result_ar: 'بنفسجي/أسود',
          possible_substance: 'MDMA/Amphetamines',
          possible_substance_ar: 'إم دي إم إيه/أمفيتامينات',
          prepare: 'Add 2-3 drops of reagent',
          test_type: 'Presumptive',
          test_number: '1',
          reference: 'DEA Guidelines'
        },
        {
          id: '2',
          method_name: 'Mecke Test',
          method_name_ar: 'اختبار ميك',
          color_result: 'Blue/Green',
          color_result_ar: 'أزرق/أخضر',
          possible_substance: 'Opiates',
          possible_substance_ar: 'مواد أفيونية',
          prepare: 'Add 2-3 drops of reagent',
          test_type: 'Presumptive',
          test_number: '2',
          reference: 'UNODC Manual'
        }
      ];

      const dataToExport = storedData.length > 0 ? storedData : defaultData;

      // Create CSV header
      const headers = ['id', 'method_name', 'method_name_ar', 'color_result', 'color_result_ar', 'possible_substance', 'possible_substance_ar', 'prepare', 'test_type', 'test_number', 'reference'];

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row =>
          headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `chemical_tests_backup_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({
        type: 'success',
        text: isRTL
          ? `تم تصدير ${dataToExport.length} اختبار بنجاح`
          : `Successfully exported ${dataToExport.length} tests`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: isRTL
          ? 'حدث خطأ أثناء تصدير البيانات'
          : 'Error occurred while exporting data'
      });
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/chemical_tests_template.csv';
    link.download = 'chemical_tests_template.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {isRTL ? 'استيراد البيانات' : 'Import Data'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? 'رفع ملف Excel أو CSV لاستيراد البيانات إلى قاعدة البيانات'
              : 'Upload Excel or CSV file to import data to the database'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? 'التنسيق المطلوب:' : 'Required format:'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="mb-4"
              >
                <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {isRTL ? 'تحميل نموذج' : 'Download Template'}
              </Button>
            </div>
            
            <div className="mt-4">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                disabled={importing}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="default"
                  disabled={importing}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:ml-2 rtl:mr-0"></div>
                        {isRTL ? 'جاري الاستيراد...' : 'Importing...'}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {isRTL ? 'اختر ملف للاستيراد' : 'Choose File to Import'}
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">
              {isRTL ? 'الأعمدة المطلوبة:' : 'Required columns:'}
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span>• id</span>
              <span>• method_name</span>
              <span>• method_name_ar</span>
              <span>• color_result</span>
              <span>• color_result_ar</span>
              <span>• possible_substance</span>
              <span>• possible_substance_ar</span>
              <span>• prepare</span>
              <span>• test_type</span>
              <span>• test_number</span>
              <span>• reference</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {isRTL ? 'تصدير البيانات' : 'Export Data'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? 'إنشاء نسخة احتياطية من البيانات الحالية'
              : 'Create a backup of current data'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:ml-2 rtl:mr-0"></div>
                {isRTL ? 'جاري التصدير...' : 'Exporting...'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {isRTL ? 'تصدير جميع البيانات' : 'Export All Data'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status Message */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:bg-green-900/20'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
