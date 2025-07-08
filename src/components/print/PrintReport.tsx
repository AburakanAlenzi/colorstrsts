'use client';

import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';

interface PrintReportProps {
  lang: Language;
  testResult: {
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
    userInfo?: {
      name: string;
      email: string;
    };
  };
}

export function PrintReport({ lang, testResult }: PrintReportProps) {
  const isRTL = lang === 'ar';
  const t = getTranslationsSync(lang);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isRTL 
      ? date.toLocaleDateString('ar-SA')
      : date.toLocaleDateString('en-US');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.4;
            color: #000;
            background: white;
          }
          
          .print-container {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .print-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          .print-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          
          .print-subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 15px;
          }
          
          .print-field {
            margin-bottom: 12px;
          }
          
          .print-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 4px;
            font-size: 12px;
          }
          
          .print-value {
            color: #111827;
            font-size: 14px;
          }
          
          .print-color-box {
            width: 40px;
            height: 40px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            display: inline-block;
            margin-right: 10px;
            vertical-align: middle;
          }
          
          .print-substances {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 5px;
          }
          
          .print-substance {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
          }
          
          .print-confidence {
            background: #dcfce7;
            border: 1px solid #16a34a;
            color: #15803d;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          }
          
          .print-footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 30px;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
          }
          
          .rtl {
            direction: rtl;
            text-align: right;
          }
          
          .rtl .print-color-box {
            margin-right: 0;
            margin-left: 10px;
          }
        }
        
        @media screen {
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 20mm;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
        }
      `}</style>

      <div className={`print-container ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Print Button - Hidden in print */}
        <div className="no-print mb-6">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isRTL ? 'طباعة التقرير' : 'Print Report'}
          </button>
        </div>

        {/* Header */}
        <div className="print-header">
          <div className="print-title">
            {isRTL ? 'تقرير نتيجة الاختبار الكيميائي' : 'Chemical Test Result Report'}
          </div>
          <div className="print-subtitle">
            {isRTL ? `معرف التقرير: ${testResult.id}` : `Report ID: ${testResult.id}`}
          </div>
          <div className="print-subtitle">
            {isRTL ? `تاريخ الإنشاء: ${formatDate(new Date().toISOString())}` : `Generated: ${formatDate(new Date().toISOString())}`}
          </div>
        </div>

        {/* Test Information */}
        <div className="print-section">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {isRTL ? 'معلومات الاختبار' : 'Test Information'}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="print-field">
              <div className="print-label">
                {isRTL ? 'نوع الاختبار' : 'Test Type'}
              </div>
              <div className="print-value">
                {isRTL ? testResult.testNameAr : testResult.testName}
              </div>
            </div>
            
            <div className="print-field">
              <div className="print-label">
                {isRTL ? 'تاريخ الاختبار' : 'Test Date'}
              </div>
              <div className="print-value">
                {formatDate(testResult.date)} - {testResult.time}
              </div>
            </div>
          </div>
        </div>

        {/* Color Result */}
        <div className="print-section">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {isRTL ? 'نتيجة اللون' : 'Color Result'}
          </h2>
          
          <div className="flex items-center">
            <div 
              className="print-color-box"
              style={{ backgroundColor: testResult.colorHex }}
            ></div>
            <div>
              <div className="print-value font-semibold">
                {testResult.observedColor}
              </div>
              <div className="text-sm text-gray-600">
                {testResult.colorHex}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="print-section">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {isRTL ? 'النتائج والتفسير' : 'Results & Interpretation'}
          </h2>
          
          <div className="print-field">
            <div className="print-label">
              {isRTL ? 'المواد المحتملة' : 'Possible Substances'}
            </div>
            <div className="print-substances">
              {(isRTL ? testResult.possibleSubstancesAr : testResult.possibleSubstances).map((substance, index) => (
                <span key={index} className="print-substance">
                  {substance}
                </span>
              ))}
            </div>
          </div>
          
          <div className="print-field mt-4">
            <div className="print-label">
              {isRTL ? 'مستوى الثقة' : 'Confidence Level'}
            </div>
            <div className="print-confidence">
              {testResult.confidence}% - {isRTL ? 
                (testResult.confidenceLevel === 'High' ? 'عالي' : 
                 testResult.confidenceLevel === 'Medium' ? 'متوسط' : 'منخفض') :
                testResult.confidenceLevel
              }
            </div>
          </div>
        </div>

        {/* Reference */}
        {testResult.reference && (
          <div className="print-section">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {isRTL ? 'المرجع العلمي' : 'Scientific Reference'}
            </h2>
            <div className="print-value text-sm leading-relaxed">
              {testResult.reference}
            </div>
          </div>
        )}

        {/* Notes */}
        {testResult.notes && (
          <div className="print-section">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {isRTL ? 'ملاحظات' : 'Notes'}
            </h2>
            <div className="print-value">
              {testResult.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="print-footer">
          <p>
            {isRTL 
              ? 'هذا التقرير تم إنشاؤه بواسطة نظام اختبارات الألوان للكشف عن المواد الكيميائية'
              : 'This report was generated by the Color Testing Drug Detection System'
            }
          </p>
          <p className="mt-2">
            {isRTL 
              ? 'تنبيه: هذه النتائج للأغراض التعليمية فقط ولا تحل محل التحليل المختبري المتخصص'
              : 'Disclaimer: These results are for educational purposes only and do not replace professional laboratory analysis'
            }
          </p>
        </div>
      </div>
    </>
  );
}
