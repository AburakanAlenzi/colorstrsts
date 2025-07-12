'use client';

import React from 'react';
import { ChemicalTest } from '@/lib/firebase-tests';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PrinterIcon,
  DocumentIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

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

  const handleSinglePrint = () => {
    if (test) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
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
                  margin: 1cm;
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
                .bilingual {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                }
                .arabic {
                  direction: rtl;
                  text-align: right;
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
                ${test.test_number ? `<div>Test Number: ${test.test_number}</div>` : ''}
              </div>

              ${test.prepare || test.prepare_ar ? `
                <div class="section">
                  <div class="section-title">Preparation Steps / خطوات التحضير</div>
                  <div class="bilingual">
                    <div>${(test.prepare || '').replace(/\\n/g, '<br>')}</div>
                    <div class="arabic">${(test.prepare_ar || '').replace(/\\n/g, '<br>')}</div>
                  </div>
                </div>
              ` : ''}

              ${test.color_result || test.possible_substance ? `
                <div class="section">
                  <div class="section-title">Expected Results / النتائج المتوقعة</div>
                  ${test.color_result ? `<p><strong>Color:</strong> ${test.color_result} / ${test.color_result_ar || test.color_result}</p>` : ''}
                  ${test.possible_substance ? `<p><strong>Substance:</strong> ${test.possible_substance} / ${test.possible_substance_ar || test.possible_substance}</p>` : ''}
                </div>
              ` : ''}

              ${test.reference ? `
                <div class="section">
                  <div class="section-title">Scientific Reference / المرجع العلمي</div>
                  <p style="font-style: italic;">${test.reference}</p>
                </div>
              ` : ''}

              <div class="footer">
                <div>جميع الحقوق محفوظة © 2025</div>
                <div>تم تطويره من قبل: محمد نفاع الرويلي - يوسف مسير العنزي</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  const handleQuickPrintAll = () => {
    if (tests && tests.length > 0) {
      handleMultiplePrint();
    }
  };

  const handleMultiplePrint = () => {
    if (tests && tests.length > 0) {
      // Create a new window for printing multiple tests
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        const testsHtml = tests.map(test => `
          <div style="page-break-after: always; margin-bottom: 20px;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
              <div style="font-size: 16pt; font-weight: bold; margin-bottom: 5px;">
                ${test.method_name} / ${test.method_name_ar}
              </div>
              ${test.test_number ? `<div>Test Number: ${test.test_number}</div>` : ''}
            </div>

            ${test.prepare || test.prepare_ar ? `
              <div style="margin-bottom: 12px;">
                <div style="font-size: 12pt; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 6px;">
                  Preparation Steps / خطوات التحضير
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div>${(test.prepare || '').replace(/\\n/g, '<br>')}</div>
                  <div style="direction: rtl; text-align: right;">${(test.prepare_ar || '').replace(/\\n/g, '<br>')}</div>
                </div>
              </div>
            ` : ''}

            ${test.color_result || test.possible_substance ? `
              <div style="margin-bottom: 12px;">
                <div style="font-size: 12pt; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 6px;">
                  Expected Results / النتائج المتوقعة
                </div>
                ${test.color_result ? `<p><strong>Color:</strong> ${test.color_result} / ${test.color_result_ar || test.color_result}</p>` : ''}
                ${test.possible_substance ? `<p><strong>Substance:</strong> ${test.possible_substance} / ${test.possible_substance_ar || test.possible_substance}</p>` : ''}
              </div>
            ` : ''}

            ${test.reference ? `
              <div style="margin-bottom: 12px;">
                <div style="font-size: 12pt; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 6px;">
                  Scientific Reference / المرجع العلمي
                </div>
                <p style="font-style: italic;">${test.reference}</p>
              </div>
            ` : ''}
          </div>
        `).join('');

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Multiple Tests</title>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 1cm;
                  line-height: 1.4;
                  font-size: 11pt;
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
                @media print {
                  @page { margin: 1cm; size: A4; }
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${testsHtml}
              <div class="footer">
                <div>جميع الحقوق محفوظة © 2025</div>
                <div>تم تطويره من قبل: محمد نفاع الرويلي - يوسف مسير العنزي</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
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
      </>
    );
  }

  return null;
}
