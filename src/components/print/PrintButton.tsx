'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChemicalTest } from '@/lib/firebase-tests';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  PrinterIcon,
  DocumentIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import MultiplePrintView from './MultiplePrintView';

interface PrintButtonProps {
  test?: ChemicalTest;
  tests?: ChemicalTest[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function PrintButton({ 
  test, 
  tests, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: PrintButtonProps) {
  const router = useRouter();
  const [showMultiplePrint, setShowMultiplePrint] = useState(false);

  const handleSinglePrint = () => {
    if (test) {
      // Create a temporary print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print - ${test.method_name}</title>
              <meta charset="utf-8">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 1cm; 
                  line-height: 1.4;
                  font-size: 11pt;
                }
                .header { 
                  text-align: center; 
                  border-bottom: 2px solid #000; 
                  padding-bottom: 10px; 
                  margin-bottom: 15px; 
                }
                .title { 
                  font-size: 16pt; 
                  font-weight: bold; 
                  margin-bottom: 5px; 
                }
                .subtitle { 
                  font-size: 14pt; 
                  color: #333; 
                }
                .section { 
                  margin-bottom: 12px; 
                  page-break-inside: avoid; 
                }
                .section-title { 
                  font-size: 12pt; 
                  font-weight: bold; 
                  border-bottom: 1px solid #ccc; 
                  padding-bottom: 3px; 
                  margin-bottom: 6px; 
                }
                .content { 
                  padding-left: 10px; 
                }
                .info-grid { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 10px; 
                  margin-bottom: 10px; 
                }
                .info-item { 
                  border: 1px solid #ddd; 
                  padding: 6px; 
                  border-radius: 3px; 
                }
                .info-label { 
                  font-weight: bold; 
                  font-size: 10pt; 
                  color: #666; 
                  margin-bottom: 2px; 
                }
                .steps { 
                  counter-reset: step-counter; 
                  list-style: none; 
                  padding: 0; 
                }
                .step { 
                  margin-bottom: 4px; 
                  padding-left: 15px; 
                  position: relative; 
                }
                .step::before { 
                  content: counter(step-counter); 
                  counter-increment: step-counter; 
                  position: absolute; 
                  left: 0; 
                  font-weight: bold; 
                  color: #666; 
                }
                .reference { 
                  background: #f5f5f5; 
                  padding: 8px; 
                  border-left: 3px solid #333; 
                  font-style: italic; 
                  font-size: 10pt; 
                }
                .footer { 
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
                .bilingual { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 15px; 
                }
                .arabic { 
                  direction: rtl; 
                  text-align: right; 
                }
                @media print {
                  @page { margin: 1cm; size: A4; }
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">
                  <div class="bilingual">
                    <div>${test.method_name}</div>
                    <div class="arabic">${test.method_name_ar}</div>
                  </div>
                </div>
                ${test.test_number ? `<div class="subtitle">Test Number: ${test.test_number}</div>` : ''}
              </div>

              <div class="info-grid">
                ${test.category ? `
                  <div class="info-item">
                    <div class="info-label">Category / الفئة</div>
                    <div>${test.category}</div>
                  </div>
                ` : ''}
                ${test.preparation_time ? `
                  <div class="info-item">
                    <div class="info-label">Prep Time / وقت التحضير</div>
                    <div>${test.preparation_time} minutes / ${test.preparation_time} دقيقة</div>
                  </div>
                ` : ''}
                ${test.test_type ? `
                  <div class="info-item">
                    <div class="info-label">Test Type / نوع الاختبار</div>
                    <div>${test.test_type}</div>
                  </div>
                ` : ''}
                ${test.safety_level ? `
                  <div class="info-item">
                    <div class="info-label">Safety Level / مستوى الأمان</div>
                    <div>${test.safety_level}</div>
                  </div>
                ` : ''}
              </div>

              ${test.description || test.description_ar ? `
                <div class="section">
                  <div class="section-title">Description / الوصف</div>
                  <div class="content">
                    <div class="bilingual">
                      <div>${test.description || ''}</div>
                      <div class="arabic">${test.description_ar || ''}</div>
                    </div>
                  </div>
                </div>
              ` : ''}

              ${test.prepare || test.prepare_ar ? `
                <div class="section">
                  <div class="section-title">Preparation Steps / خطوات التحضير</div>
                  <div class="content">
                    <div class="bilingual">
                      <div>
                        <div class="steps">
                          ${(test.prepare || '').split('\\n').filter(s => s.trim()).map((step, i) => 
                            `<div class="step">${step.trim()}</div>`
                          ).join('')}
                        </div>
                      </div>
                      <div class="arabic">
                        <div class="steps">
                          ${(test.prepare_ar || '').split('\\n').filter(s => s.trim()).map((step, i) => 
                            `<div class="step">${step.trim()}</div>`
                          ).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ` : ''}

              ${test.color_result || test.possible_substance ? `
                <div class="section">
                  <div class="section-title">Expected Results / النتائج المتوقعة</div>
                  <div class="content">
                    ${test.color_result ? `
                      <div class="info-item" style="margin-bottom: 8px;">
                        <div class="info-label">Color Result / نتيجة اللون</div>
                        <div>${test.color_result} / ${test.color_result_ar || test.color_result}</div>
                      </div>
                    ` : ''}
                    ${test.possible_substance ? `
                      <div class="info-item">
                        <div class="info-label">Possible Substance / المادة المحتملة</div>
                        <div>${test.possible_substance} / ${test.possible_substance_ar || test.possible_substance}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              ${test.reference ? `
                <div class="section">
                  <div class="section-title">Scientific Reference / المرجع العلمي</div>
                  <div class="content">
                    <div class="reference">${test.reference}</div>
                  </div>
                </div>
              ` : ''}

              <div class="footer">
                <div>جميع الحقوق محفوظة © 2025</div>
                <div style="margin-top: 4px;">
                  تم تطويره من قبل: محمد نفاع الرويلي - يوسف مسير العنزي
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const handleQuickPrintAll = () => {
    if (tests && tests.length > 0) {
      window.print();
    }
  };

  const handleMultiplePrint = () => {
    setShowMultiplePrint(true);
  };

  // Single test button
  if (test && !tests) {
    return (
      <Button
        onClick={handleSinglePrint}
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        <PrinterIcon className="h-4 w-4" />
        Print
      </Button>
    );
  }

  // Multiple tests dropdown
  if (tests && tests.length > 0) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={`flex items-center gap-2 ${className}`}
            >
              <PrinterIcon className="h-4 w-4" />
              Print
              <ChevronDownIcon className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleQuickPrintAll}>
              <DocumentIcon className="mr-2 h-4 w-4" />
              Quick Print All ({tests.length})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMultiplePrint}>
              <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
              Select & Print Multiple
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={showMultiplePrint} onOpenChange={setShowMultiplePrint}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
            <MultiplePrintView 
              tests={tests}
              onBack={() => setShowMultiplePrint(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
}
