'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TestRoutingDebugProps {
  lang: Language;
}

export function TestRoutingDebug({ lang }: TestRoutingDebugProps) {
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);

  const testRoutes = [
    'test-simple',
    'marquis-test',
    'mecke-test',
    'fast-blue-b-test'
  ];

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testRoute = async (testId: string) => {
    const url = `/${lang}/tests/${testId}`;
    addResult(`Testing route: ${url}`);
    
    try {
      // Test 1: Router.push
      addResult(`Attempting router.push...`);
      router.push(url);
      addResult(`✅ Router.push successful`);
    } catch (error) {
      addResult(`❌ Router.push failed: ${error}`);
      
      try {
        // Test 2: Window.location
        addResult(`Attempting window.location...`);
        window.location.href = url;
        addResult(`✅ Window.location successful`);
      } catch (error2) {
        addResult(`❌ Window.location failed: ${error2}`);
      }
    }
  };

  const testDirectLink = (testId: string) => {
    const url = `/${lang}/tests/${testId}`;
    addResult(`Opening direct link: ${url}`);
    window.open(url, '_blank');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Test Routing Debug</CardTitle>
        <CardDescription>
          Debug tool for testing chemical test page routing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testRoutes.map((testId) => (
              <div key={testId} className="space-y-2">
                <h4 className="font-medium text-sm">{testId}</h4>
                <div className="space-y-1">
                  <Button
                    size="sm"
                    onClick={() => testRoute(testId)}
                    className="w-full"
                  >
                    Router Push
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testDirectLink(testId)}
                    className="w-full"
                  >
                    Direct Link
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
            <Button 
              onClick={() => addResult(`Current URL: ${window.location.href}`)}
              variant="outline"
            >
              Log Current URL
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-2">
            <h3 className="font-medium">Test Results:</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-sm">No test results yet...</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Current State */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <h3 className="font-medium mb-2">Current State:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Language:</strong> {lang}</p>
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
              <p><strong>Router Ready:</strong> {router ? '✅' : '❌'}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h3 className="font-medium">Quick Navigation:</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/${lang}/tests`)}
              >
                Tests Page
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/${lang}/tests/debug`)}
              >
                Debug Page
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/${lang}/admin`)}
              >
                Admin Page
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
