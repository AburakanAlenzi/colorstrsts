'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChemicalTest } from '@/lib/firebase-tests';
import MultiplePrintView from '@/components/print/MultiplePrintView';

// Load chemical tests data from JSON file
const loadChemicalTests = async (): Promise<ChemicalTest[]> => {
  try {
    const response = await fetch('/data/chemical-tests.json');
    if (!response.ok) {
      throw new Error('Failed to load chemical tests data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading chemical tests:', error);
    return [];
  }
};

export default function MultiplePrintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get test IDs from URL parameters
        const testIds = searchParams.get('ids')?.split(',') || [];
        
        if (testIds.length === 0) {
          // Load all tests if no specific IDs provided
          const allTests = await loadChemicalTests();
          
          // Also check localStorage for admin-created tests
          const localTests = localStorage.getItem('chemical-tests');
          if (localTests) {
            const parsedLocalTests = JSON.parse(localTests);
            allTests.push(...parsedLocalTests);
          }
          
          setTests(allTests);
        } else {
          // Load specific tests
          const allTests = await loadChemicalTests();
          
          // Also check localStorage
          const localTests = localStorage.getItem('chemical-tests');
          if (localTests) {
            const parsedLocalTests = JSON.parse(localTests);
            allTests.push(...parsedLocalTests);
          }
          
          const selectedTests = allTests.filter(test => testIds.includes(test.id));
          setTests(selectedTests);
        }
      } catch (err) {
        console.error('Error loading tests:', err);
        setError('Failed to load test data');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, [searchParams]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tests data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Tests
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Tests Found
          </h1>
          <p className="text-gray-600 mb-6">
            No tests were found to print.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <MultiplePrintView tests={tests} onBack={handleBack} />;
}
