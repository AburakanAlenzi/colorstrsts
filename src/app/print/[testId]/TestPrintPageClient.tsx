'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChemicalTest } from '@/lib/firebase-tests';
import PrintPage from '@/components/print/PrintPage';

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

interface TestPrintPageClientProps {
  testId: string;
}

export default function TestPrintPageClient({ testId }: TestPrintPageClientProps) {
  const router = useRouter();
  const [test, setTest] = useState<ChemicalTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load from localStorage first (for admin-created tests)
        const localTests = localStorage.getItem('chemical-tests');
        if (localTests) {
          const parsedTests = JSON.parse(localTests);
          const foundTest = parsedTests.find((t: ChemicalTest) => t.id === testId);
          if (foundTest) {
            setTest(foundTest);
            return;
          }
        }

        // Load from JSON file (for default tests)
        const tests = await loadChemicalTests();
        const foundTest = tests.find(t => t.id === testId);
        
        if (foundTest) {
          setTest(foundTest);
        } else {
          setError('Test not found');
        }
      } catch (err) {
        console.error('Error loading test:', err);
        setError('Failed to load test data');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      loadTest();
    }
  }, [testId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Test Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The requested test could not be loaded.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <PrintPage testId={testId} tests={[test]} />;
}
