'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChemicalTest } from '@/lib/firebase-tests';
import TestPrintView from './TestPrintView';
import { Button } from '@/components/ui/button';
import { 
  PrinterIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';

interface PrintPageProps {
  testId?: string;
  tests?: ChemicalTest[];
}

export default function PrintPage({ testId, tests }: PrintPageProps) {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<ChemicalTest | null>(null);
  const [showBothLanguages, setShowBothLanguages] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestData = async () => {
      try {
        if (testId && !tests) {
          // Load single test from localStorage or API
          const localTests = localStorage.getItem('chemical-tests');
          if (localTests) {
            const parsedTests = JSON.parse(localTests);
            const test = parsedTests.find((t: ChemicalTest) => t.id === testId);
            if (test) {
              setSelectedTest(test);
            }
          }
        } else if (tests && tests.length > 0) {
          // Use provided tests
          setSelectedTest(tests[0]);
        }
      } catch (error) {
        console.error('Error loading test data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTestData();
  }, [testId, tests]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.back();
  };

  const toggleLanguageMode = () => {
    setShowBothLanguages(!showBothLanguages);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedTest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The requested test could not be found.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Controls - Hidden during print */}
      <div className="no-print bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="text-sm text-gray-600">
              Printing: <span className="font-medium">{selectedTest.method_name}</span>
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
            
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <PrinterIcon className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div className="print-content">
        <TestPrintView 
          test={selectedTest} 
          showBoth={showBothLanguages}
        />
      </div>

      {/* Print Instructions - Hidden during print */}
      <div className="no-print bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Print Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Print Settings:</h4>
              <ul className="space-y-1">
                <li>• Paper Size: A4</li>
                <li>• Orientation: Portrait</li>
                <li>• Margins: Default (1-2cm)</li>
                <li>• Color: Black & White recommended</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Browser Tips:</h4>
              <ul className="space-y-1">
                <li>• Use Ctrl+P (Windows) or Cmd+P (Mac)</li>
                <li>• Enable "Background graphics" for better appearance</li>
                <li>• Check print preview before printing</li>
                <li>• Adjust scale if content doesn't fit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-content {
            margin: 0;
            padding: 0;
          }
          
          /* Hide browser default header/footer */
          @page {
            margin: 1cm;
            size: A4;
          }
          
          /* Ensure content fits on one page */
          .print-container {
            page-break-inside: avoid;
            orphans: 3;
            widows: 3;
          }
          
          /* Prevent breaking of important sections */
          .print-section {
            page-break-inside: avoid;
          }
          
          /* Ensure footer stays at bottom */
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
          }
        }
        
        @media screen {
          .print-content {
            background: #f9fafb;
            min-height: calc(100vh - 200px);
            padding: 20px 0;
          }
        }
      `}</style>
    </div>
  );
}
