'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthProvider';

export function FirebaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkFirebaseStatus = () => {
      const info = {
        // Firebase Auth Status
        authInitialized: !!auth,
        authCurrentUser: auth.currentUser,
        authConfig: {
          apiKey: auth.app.options.apiKey ? '✅ Set' : '❌ Missing',
          authDomain: auth.app.options.authDomain ? '✅ Set' : '❌ Missing',
          projectId: auth.app.options.projectId ? '✅ Set' : '❌ Missing',
        },
        
        // Auth Provider Status
        providerUser: user,
        providerLoading: loading,
        
        // Environment Variables
        envVars: {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        },
        
        // Browser Info
        browser: {
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
          cookiesEnabled: typeof window !== 'undefined' ? navigator.cookieEnabled : 'Unknown',
          localStorage: typeof window !== 'undefined' && window.localStorage ? '✅ Available' : '❌ Not Available',
        }
      };
      
      setDebugInfo(info);
    };

    checkFirebaseStatus();
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      checkFirebaseStatus();
    });

    return () => unsubscribe();
  }, [user, loading]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-auto z-50">
      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">🔧 Firebase Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Auth Status:</strong>
          <div className="ml-2">
            <div>Initialized: {debugInfo.authInitialized ? '✅' : '❌'}</div>
            <div>Current User: {debugInfo.authCurrentUser ? '✅ Logged In' : '❌ Not Logged In'}</div>
            <div>Provider User: {debugInfo.providerUser ? '✅ Available' : '❌ Null'}</div>
            <div>Loading: {debugInfo.providerLoading ? '⏳ Yes' : '✅ No'}</div>
          </div>
        </div>

        <div>
          <strong>Firebase Config:</strong>
          <div className="ml-2">
            {Object.entries(debugInfo.authConfig || {}).map(([key, value]) => (
              <div key={key}>{key}: {value}</div>
            ))}
          </div>
        </div>

        <div>
          <strong>Environment:</strong>
          <div className="ml-2">
            {Object.entries(debugInfo.envVars || {}).map(([key, value]) => (
              <div key={key}>{key}: {value}</div>
            ))}
          </div>
        </div>

        <div>
          <strong>Browser:</strong>
          <div className="ml-2">
            {Object.entries(debugInfo.browser || {}).map(([key, value]) => (
              <div key={key}>{key}: {value}</div>
            ))}
          </div>
        </div>

        {debugInfo.authCurrentUser && (
          <div>
            <strong>User Details:</strong>
            <div className="ml-2">
              <div>UID: {debugInfo.authCurrentUser.uid}</div>
              <div>Email: {debugInfo.authCurrentUser.email}</div>
              <div>Display Name: {debugInfo.authCurrentUser.displayName || 'Not Set'}</div>
              <div>Email Verified: {debugInfo.authCurrentUser.emailVerified ? '✅' : '❌'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
