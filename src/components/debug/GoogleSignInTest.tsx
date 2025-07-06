'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { Button } from '@/components/ui/button';

export function GoogleSignInTest() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testGoogleSignInPopup = async () => {
    setLoading(true);
    setMessage('🔄 Testing Google Sign-In with Popup...');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('🔄 Starting popup sign-in...');
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Popup sign-in successful:', result);
      setMessage(`✅ Popup Success: ${result.user.email}`);
    } catch (error: any) {
      console.error('❌ Popup sign-in failed:', error);
      setMessage(`❌ Popup Failed: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleSignInRedirect = async () => {
    setLoading(true);
    setMessage('🔄 Testing Google Sign-In with Redirect...');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('🔄 Starting redirect sign-in...');
      await signInWithRedirect(auth, provider);
      // Note: This will redirect the page, so we won't reach the success message
    } catch (error: any) {
      console.error('❌ Redirect sign-in failed:', error);
      setMessage(`❌ Redirect Failed: ${error.code} - ${error.message}`);
      setLoading(false);
    }
  };

  const checkRedirectResult = async () => {
    setMessage('🔄 Checking redirect result...');
    
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('✅ Redirect result found:', result);
        setMessage(`✅ Redirect Success: ${result.user.email}`);
      } else {
        console.log('ℹ️ No redirect result');
        setMessage('ℹ️ No redirect result found');
      }
    } catch (error: any) {
      console.error('❌ Redirect result error:', error);
      setMessage(`❌ Redirect Result Error: ${error.code} - ${error.message}`);
    }
  };

  const testFirebaseConfig = () => {
    const config = {
      apiKey: auth.app.options.apiKey,
      authDomain: auth.app.options.authDomain,
      projectId: auth.app.options.projectId,
    };
    
    console.log('Firebase Config:', config);
    setMessage(`Config: ${JSON.stringify(config, null, 2)}`);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">🔍 Google Sign-In Test</h3>
      
      <div className="space-y-3">
        <Button
          onClick={testGoogleSignInPopup}
          disabled={loading}
          size="sm"
          className="w-full text-xs"
        >
          Test Popup Sign-In
        </Button>
        
        <Button
          onClick={testGoogleSignInRedirect}
          disabled={loading}
          size="sm"
          variant="outline"
          className="w-full text-xs"
        >
          Test Redirect Sign-In
        </Button>
        
        <Button
          onClick={checkRedirectResult}
          disabled={loading}
          size="sm"
          variant="secondary"
          className="w-full text-xs"
        >
          Check Redirect Result
        </Button>
        
        <Button
          onClick={testFirebaseConfig}
          size="sm"
          variant="ghost"
          className="w-full text-xs"
        >
          Show Firebase Config
        </Button>

        {message && (
          <div className="text-xs p-2 bg-gray-100 dark:bg-gray-700 rounded max-h-32 overflow-auto">
            <pre className="whitespace-pre-wrap">{message}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
