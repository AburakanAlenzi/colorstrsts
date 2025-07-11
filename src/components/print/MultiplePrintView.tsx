'use client';

import React, { useState } from 'react';
import { ChemicalTest } from '@/lib/firebase-tests';
import TestPrintView from './TestPrintView';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  PrinterIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  LanguageIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface MultiplePrintViewProps {
  tests: ChemicalTest[];
  onBack: () => void;
}

export default function MultiplePrintView({ tests, onBack }: MultiplePrintViewProps) {
  const [selectedTests, setSelectedTests] = useState<string[]>(tests.map(t => t.id));
  const [showBothLanguages, setShowBothLanguages] = useState(true);
  const [printLayout, setPrintLayout] = useState<'single' | 'multiple'>('single'); // single = one per page, multiple = multiple per page

  const handleTestSelection = (testId: string, checked: boolean) => {
    if (checked) {
      setSelectedTests(prev => [...prev, testId]);
    } else {
      setSelectedTests(prev => prev.filter(id => id !== testId));
    }
  };

  const handleSelectAll = () => {
    if (selectedTests.length === tests.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(tests.map(t => t.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleLanguageMode = () => {
    setShowBothLanguages(!showBothLanguages);
  };

  const selectedTestsData = tests.filter(test => selectedTests.includes(test.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Controls - Hidden during print */}
      <div className="no-print bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedTests.length}</span> of {tests.length} tests
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={toggleLanguageMode} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <LanguageIcon className="h-4 w-4" />
                {showBothLanguages ? 'Bilingual' : 'English Only'}
              </Button>
              
              <select 
                value={printLayout}
                onChange={(e) => setPrintLayout(e.target.value as 'single' | 'multiple')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="single">One per page</option>
                <option value="multiple">Multiple per page</option>
              </select>
              
              <Button 
                onClick={handlePrint} 
                disabled={selectedTests.length === 0}
                className="flex items-center gap-2"
              >
                <PrinterIcon className="h-4 w-4" />
                Print Selected ({selectedTests.length})
              </Button>
            </div>
          </div>

          {/* Test Selection */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Select Tests to Print</h3>
              <Button 
                onClick={handleSelectAll}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                {selectedTests.length === tests.length ? (
                  <>
                    <XMarkIcon className="h-4 w-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Select All
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
              {tests.map((test) => (
                <div key={test.id} className="flex items-center space-x-2 p-2 bg-white rounded border">
                  <Checkbox
                    id={test.id}
                    checked={selectedTests.includes(test.id)}
                    onCheckedChange={(checked) => handleTestSelection(test.id, checked as boolean)}
                  />
                  <label 
                    htmlFor={test.id} 
                    className="text-sm font-medium text-gray-700 cursor-pointer flex-1 truncate"
                  >
                    {test.method_name}
                  </label>
                  {test.test_number && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {test.test_number}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div className="print-content">
        {selectedTestsData.length === 0 ? (
          <div className="no-print flex items-center justify-center min-h-96">
            <div className="text-center">
              <DocumentDuplicateIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Selected</h3>
              <p className="text-gray-600">Please select at least one test to print.</p>
            </div>
          </div>
        ) : (
          <div className={printLayout === 'single' ? 'print-single-layout' : 'print-multiple-layout'}>
            {selectedTestsData.map((test, index) => (
              <div 
                key={test.id} 
                className={printLayout === 'single' ? 'print-page-break' : 'print-test-item'}
              >
                <TestPrintView 
                  test={test} 
                  showBoth={showBothLanguages}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print Instructions - Hidden during print */}
      <div className="no-print bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Multiple Tests Print Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Layout Options:</h4>
              <ul className="space-y-1">
                <li>• <strong>One per page:</strong> Each test on separate page</li>
                <li>• <strong>Multiple per page:</strong> Compact layout</li>
                <li>• Automatic page breaks for readability</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Print Settings:</h4>
              <ul className="space-y-1">
                <li>• Paper Size: A4</li>
                <li>• Orientation: Portrait</li>
                <li>• Margins: Default</li>
                <li>• Scale: Fit to page width</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tips:</h4>
              <ul className="space-y-1">
                <li>• Preview before printing</li>
                <li>• Check page count in print dialog</li>
                <li>• Use bilingual mode for complete info</li>
                <li>• Consider paper usage for large selections</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .print-single-layout .print-page-break {
            page-break-after: always;
          }
          
          .print-single-layout .print-page-break:last-child {
            page-break-after: auto;
          }
          
          .print-multiple-layout {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          
          .print-multiple-layout .print-test-item {
            page-break-inside: avoid;
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 15px;
          }
          
          .print-multiple-layout .print-test-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          
          /* Compact layout for multiple tests */
          .print-multiple-layout .print-container {
            padding: 0.5cm;
            margin-bottom: 10px;
          }
          
          .print-multiple-layout .print-header {
            margin-bottom: 10px;
          }
          
          .print-multiple-layout .print-title {
            font-size: 14pt;
          }
          
          .print-multiple-layout .print-section {
            margin-bottom: 8px;
          }
          
          .print-multiple-layout .print-info-grid {
            gap: 5px;
          }
          
          .print-multiple-layout .print-footer {
            display: none; /* Hide footer for multiple layout to save space */
          }
        }
        
        @media screen {
          .print-content {
            background: #f9fafb;
            min-height: calc(100vh - 300px);
            padding: 20px 0;
          }
          
          .print-single-layout .print-page-break {
            margin-bottom: 40px;
            border-bottom: 2px dashed #ddd;
            padding-bottom: 20px;
          }
          
          .print-single-layout .print-page-break:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          
          .print-multiple-layout .print-test-item {
            margin-bottom: 30px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 20px;
          }
          
          .print-multiple-layout .print-test-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
