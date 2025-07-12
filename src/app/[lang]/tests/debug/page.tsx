'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getChemicalTests } from '@/lib/firebase-realtime';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestRoutingDebug } from '@/components/debug/TestRoutingDebug';

interface DebugPageProps {
  params: Promise<{ lang: Language }>;
}

export default function DebugPage({ params }: DebugPageProps) {
  const [lang, setLang] = useState<Language>('ar');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setLang(resolvedParams.lang);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading tests from Firebase...');
        
        const chemicalTests = await getChemicalTests();
        console.log('📊 Tests loaded:', chemicalTests);
        
        setTests(chemicalTests);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading tests:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  const testLink = (testId: string) => {
    const url = `/${lang}/tests/${testId}`;
    console.log('🔗 Test link:', url);
    return url;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Routing Debug Tool */}
        <TestRoutingDebug lang={lang} />

        {/* Firebase Debug Tool */}
        <Card>
        <CardHeader>
          <CardTitle>🔍 Firebase Tests Debug</CardTitle>
          <CardDescription>
            Debug page to check Firebase tests data and routing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2">Loading tests from Firebase...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-red-800">Error:</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800">
                  ✅ Successfully loaded {tests.length} tests from Firebase
                </h3>
              </div>

              <div className="grid gap-4">
                {tests.map((test, index) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">
                          {lang === 'ar' ? test.method_name_ar : test.method_name}
                        </h4>
                        <p className="text-sm text-gray-600">ID: {test.id}</p>
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const url = testLink(test.id);
                          console.log('🚀 Navigating to:', url);
                          window.location.href = url;
                        }}
                      >
                        Test Link
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = testLink(test.id);
                          navigator.clipboard.writeText(window.location.origin + url);
                          alert('Link copied to clipboard!');
                        }}
                      >
                        Copy Link
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {tests.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800">
                    ⚠️ No tests found in Firebase
                  </h3>
                  <p className="text-yellow-600">
                    Firebase Realtime Database appears to be empty. 
                    Please use the Firebase Debugger in admin panel to initialize data.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Language:</strong> {lang}</p>
              <p><strong>Tests Count:</strong> {tests.length}</p>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
