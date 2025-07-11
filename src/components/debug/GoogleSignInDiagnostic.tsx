'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';

export function GoogleSignInDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    const runDiagnostics = () => {
      const results = {
        // Firebase Configuration
        firebaseConfig: {
          apiKey: auth.app.options.apiKey ? '✅ Present' : '❌ Missing',
          authDomain: auth.app.options.authDomain ? '✅ Present' : '❌ Missing',
          projectId: auth.app.options.projectId ? '✅ Present' : '❌ Missing',
          actualValues: {
            apiKey: auth.app.options.apiKey?.substring(0, 10) + '...',
            authDomain: auth.app.options.authDomain,
            projectId: auth.app.options.projectId
          }
        },

        // Browser Environment
        browser: {
          userAgent: navigator.userAgent,
          cookiesEnabled: navigator.cookieEnabled ? '✅ Enabled' : '❌ Disabled',
          localStorage: typeof Storage !== 'undefined' ? '✅ Available' : '❌ Not Available',
          popupSupport: (() => {
            try {
              const popup = window.open('', '_blank', 'width=1,height=1');
              if (popup) {
                popup.close();
                return '✅ Supported';
              }
              return '❌ Blocked';
            } catch {
              return '❌ Not Supported';
            }
          })(),
          thirdPartyCookies: document.cookie ? '✅ Enabled' : '⚠️ May be disabled'
        },

        // Network & Security
        network: {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          port: window.location.port || 'default',
          isLocalhost: window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('localhost'),
          isHTTPS: window.location.protocol === 'https:',
        },

        // Google OAuth Requirements
        googleOAuth: {
          domainVerification: auth.app.options.authDomain ? 
            `Check if ${auth.app.options.authDomain} is added to Google Console` : 
            'Auth domain not configured',
          redirectURIs: [
            `${window.location.protocol}//${window.location.host}/__/auth/handler`,
            `${window.location.protocol}//${window.location.host}`
          ],
          authorizedDomains: [
            window.location.hostname,
            auth.app.options.authDomain
          ].filter(Boolean)
        },

        // Common Issues
        commonIssues: [
          {
            issue: 'Popup Blocked',
            check: (() => {
              try {
                const popup = window.open('', '_blank', 'width=1,height=1');
                if (popup) {
                  popup.close();
                  return '✅ OK';
                }
                return '❌ Blocked';
              } catch {
                return '❌ Blocked';
              }
            })(),
            solution: 'Allow popups for this site in browser settings'
          },
          {
            issue: 'Third-party cookies',
            check: document.cookie ? '✅ OK' : '⚠️ May be disabled',
            solution: 'Enable third-party cookies or use redirect method'
          },
          {
            issue: 'HTTPS requirement',
            check: window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost' ? '✅ OK' : '❌ HTTP not allowed',
            solution: 'Use HTTPS in production'
          },
          {
            issue: 'Domain authorization',
            check: auth.app.options.authDomain ? '✅ Configured' : '❌ Missing',
            solution: 'Add domain to Firebase Auth settings'
          }
        ],

        // Recommended Actions
        recommendations: [
          'Ensure your domain is added to Firebase Auth authorized domains',
          'Check Google Cloud Console OAuth consent screen configuration',
          'Verify OAuth client ID is correctly configured',
          'Test with different browsers to isolate browser-specific issues',
          'Check browser console for detailed error messages',
          'Try using redirect method instead of popup if popup is blocked'
        ]
      };

      setDiagnostics(results);
    };

    runDiagnostics();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-auto z-50">
      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">🔍 Google Sign-In Diagnostics</h3>
      
      <div className="space-y-3 text-xs">
        {/* Firebase Config */}
        <div>
          <strong>Firebase Config:</strong>
          <div className="ml-2">
            {Object.entries(diagnostics.firebaseConfig || {}).map(([key, value]) => (
              key !== 'actualValues' && (
                <div key={key}>{key}: {value}</div>
              )
            ))}
          </div>
        </div>

        {/* Browser Support */}
        <div>
          <strong>Browser Support:</strong>
          <div className="ml-2">
            {Object.entries(diagnostics.browser || {}).map(([key, value]) => (
              <div key={key}>{key}: {value}</div>
            ))}
          </div>
        </div>

        {/* Network Info */}
        <div>
          <strong>Network:</strong>
          <div className="ml-2">
            {Object.entries(diagnostics.network || {}).map(([key, value]) => (
              <div key={key}>{key}: {String(value)}</div>
            ))}
          </div>
        </div>

        {/* Common Issues */}
        <div>
          <strong>Issue Checks:</strong>
          <div className="ml-2">
            {(diagnostics.commonIssues || []).map((item: any, index: number) => (
              <div key={index} className="mb-1">
                <div>{item.issue}: {item.check}</div>
                {item.check.includes('❌') && (
                  <div className="text-blue-600 text-xs">💡 {item.solution}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <strong>Recommendations:</strong>
          <div className="ml-2">
            {(diagnostics.recommendations || []).map((rec: string, index: number) => (
              <div key={index} className="text-blue-600">• {rec}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
