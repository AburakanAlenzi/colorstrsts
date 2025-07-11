'use client';

import React from 'react';
import { ChemicalTest } from '@/lib/firebase-tests';
import { 
  BeakerIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

interface TestPrintViewProps {
  test: ChemicalTest;
  showBoth?: boolean; // Show both Arabic and English
}

export default function TestPrintView({ test, showBoth = true }: TestPrintViewProps) {
  const formatPreparationSteps = (steps: string) => {
    if (!steps) return [];
    return steps.split('\n').filter(step => step.trim()).map(step => step.trim());
  };

  const getSafetyLevelText = (level: string) => {
    const levels = {
      'low': { en: 'Low Risk', ar: 'خطر منخفض' },
      'medium': { en: 'Medium Risk', ar: 'خطر متوسط' },
      'high': { en: 'High Risk', ar: 'خطر عالي' },
      'extreme': { en: 'Extreme Risk', ar: 'خطر شديد' }
    };
    return levels[level as keyof typeof levels] || { en: level, ar: level };
  };

  const getCategoryText = (category: string) => {
    const categories = {
      'basic': { en: 'Basic Test', ar: 'اختبار أساسي' },
      'advanced': { en: 'Advanced Test', ar: 'اختبار متقدم' },
      'specialized': { en: 'Specialized Test', ar: 'اختبار متخصص' }
    };
    return categories[category as keyof typeof categories] || { en: category, ar: category };
  };

  return (
    <div className="print-container">
      <style jsx>{`
        @media print {
          .print-container {
            font-family: 'Arial', 'Tahoma', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 1cm;
            max-width: none;
            box-shadow: none;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-header {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          
          .print-title {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 8px;
          }
          
          .print-subtitle {
            font-size: 14pt;
            text-align: center;
            color: #333;
            margin-bottom: 5px;
          }
          
          .print-section {
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          
          .print-section-title {
            font-size: 12pt;
            font-weight: bold;
            border-bottom: 1px solid #ccc;
            padding-bottom: 3px;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .print-icon {
            width: 12px;
            height: 12px;
            stroke-width: 2;
          }
          
          .print-content {
            padding-left: 10px;
          }
          
          .print-steps {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .print-step {
            margin-bottom: 4px;
            padding-left: 15px;
            position: relative;
          }
          
          .print-step::before {
            content: counter(step-counter);
            counter-increment: step-counter;
            position: absolute;
            left: 0;
            font-weight: bold;
            color: #666;
          }
          
          .print-steps {
            counter-reset: step-counter;
          }
          
          .print-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          
          .print-info-item {
            border: 1px solid #ddd;
            padding: 6px;
            border-radius: 3px;
          }
          
          .print-info-label {
            font-weight: bold;
            font-size: 10pt;
            color: #666;
            margin-bottom: 2px;
          }
          
          .print-info-value {
            font-size: 11pt;
          }
          
          .print-footer {
            position: fixed;
            bottom: 1cm;
            left: 1cm;
            right: 1cm;
            border-top: 1px solid #ccc;
            padding-top: 8px;
            font-size: 9pt;
            text-align: center;
            color: #666;
          }
          
          .print-bilingual {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .print-arabic {
            direction: rtl;
            text-align: right;
          }
          
          .print-english {
            direction: ltr;
            text-align: left;
          }
          
          .print-reference {
            background: #f5f5f5;
            padding: 8px;
            border-left: 3px solid #333;
            font-style: italic;
            font-size: 10pt;
          }
          
          .print-warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 6px;
            border-radius: 3px;
            font-size: 10pt;
          }
          
          .print-safety-high, .print-safety-extreme {
            background: #f8d7da;
            border-color: #f5c6cb;
          }
          
          .print-safety-medium {
            background: #fff3cd;
            border-color: #ffeaa7;
          }
          
          .print-safety-low {
            background: #d4edda;
            border-color: #c3e6cb;
          }
        }
        
        @media screen {
          .print-container {
            max-width: 21cm;
            margin: 20px auto;
            padding: 2cm;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            font-family: 'Arial', 'Tahoma', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
          }
        }
      `}</style>

      {/* Header */}
      <div className="print-header">
        <div className="print-title">
          {showBoth ? (
            <div className="print-bilingual">
              <div className="print-english">{test.method_name}</div>
              <div className="print-arabic">{test.method_name_ar}</div>
            </div>
          ) : (
            <div>{test.method_name}</div>
          )}
        </div>
        
        {test.test_number && (
          <div className="print-subtitle">
            Test Number: {test.test_number}
          </div>
        )}
      </div>

      {/* Test Information Grid */}
      <div className="print-info-grid">
        {test.category && (
          <div className="print-info-item">
            <div className="print-info-label">Category / الفئة</div>
            <div className="print-info-value">
              {getCategoryText(test.category).en} / {getCategoryText(test.category).ar}
            </div>
          </div>
        )}
        
        {test.preparation_time && (
          <div className="print-info-item">
            <div className="print-info-label">Prep Time / وقت التحضير</div>
            <div className="print-info-value">
              {test.preparation_time} minutes / {test.preparation_time} دقيقة
            </div>
          </div>
        )}
        
        {test.test_type && (
          <div className="print-info-item">
            <div className="print-info-label">Test Type / نوع الاختبار</div>
            <div className="print-info-value">{test.test_type}</div>
          </div>
        )}
        
        {test.safety_level && (
          <div className={`print-info-item print-safety-${test.safety_level}`}>
            <div className="print-info-label">
              <ExclamationTriangleIcon className="print-icon inline mr-1" />
              Safety Level / مستوى الأمان
            </div>
            <div className="print-info-value">
              {getSafetyLevelText(test.safety_level).en} / {getSafetyLevelText(test.safety_level).ar}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {(test.description || test.description_ar) && (
        <div className="print-section">
          <div className="print-section-title">
            <DocumentTextIcon className="print-icon" />
            Description / الوصف
          </div>
          <div className="print-content">
            {showBoth ? (
              <div className="print-bilingual">
                <div className="print-english">{test.description}</div>
                <div className="print-arabic">{test.description_ar}</div>
              </div>
            ) : (
              <div>{test.description}</div>
            )}
          </div>
        </div>
      )}

      {/* Preparation Steps */}
      {(test.prepare || test.prepare_ar) && (
        <div className="print-section">
          <div className="print-section-title">
            <BeakerIcon className="print-icon" />
            Preparation Steps / خطوات التحضير
          </div>
          <div className="print-content">
            {showBoth ? (
              <div className="print-bilingual">
                <div className="print-english">
                  <div className="print-steps">
                    {formatPreparationSteps(test.prepare || '').map((step, index) => (
                      <div key={index} className="print-step">{step}</div>
                    ))}
                  </div>
                </div>
                <div className="print-arabic">
                  <div className="print-steps">
                    {formatPreparationSteps(test.prepare_ar || '').map((step, index) => (
                      <div key={index} className="print-step">{step}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="print-steps">
                {formatPreparationSteps(test.prepare || '').map((step, index) => (
                  <div key={index} className="print-step">{step}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expected Results */}
      {(test.color_result || test.possible_substance) && (
        <div className="print-section">
          <div className="print-section-title">
            <EyeIcon className="print-icon" />
            Expected Results / النتائج المتوقعة
          </div>
          <div className="print-content">
            {test.color_result && (
              <div className="print-info-item" style={{ marginBottom: '8px' }}>
                <div className="print-info-label">Color Result / نتيجة اللون</div>
                <div className="print-info-value">
                  {showBoth ? (
                    <>{test.color_result} / {test.color_result_ar}</>
                  ) : (
                    test.color_result
                  )}
                </div>
              </div>
            )}
            
            {test.possible_substance && (
              <div className="print-info-item">
                <div className="print-info-label">Possible Substance / المادة المحتملة</div>
                <div className="print-info-value">
                  {showBoth ? (
                    <>{test.possible_substance} / {test.possible_substance_ar}</>
                  ) : (
                    test.possible_substance
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scientific Reference */}
      {test.reference && (
        <div className="print-section">
          <div className="print-section-title">
            <BookOpenIcon className="print-icon" />
            Scientific Reference / المرجع العلمي
          </div>
          <div className="print-content">
            <div className="print-reference">
              {test.reference}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="print-footer">
        <div>جميع الحقوق محفوظة © 2025</div>
        <div style={{ marginTop: '4px' }}>
          تم تطويره من قبل: محمد نفاع الرويلي - يوسف مسير العنزي
        </div>
      </div>
    </div>
  );
}
