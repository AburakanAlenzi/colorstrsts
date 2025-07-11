'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';

export function AuthTest() {
  const { user, signIn, signUp, signInWithGoogle, logout, loading } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('123456');
  const [message, setMessage] = useState('');

  const handleTestSignIn = async () => {
    try {
      setMessage('🔄 Testing sign in...');
      await signIn(testEmail, testPassword);
      setMessage('✅ Sign in successful!');
    } catch (error: any) {
      setMessage(`❌ Sign in failed: ${error.message}`);
    }
  };

  const handleTestSignUp = async () => {
    try {
      setMessage('🔄 Testing sign up...');
      await signUp(testEmail, testPassword, 'Test User');
      setMessage('✅ Sign up successful!');
    } catch (error: any) {
      setMessage(`❌ Sign up failed: ${error.message}`);
    }
  };

  const handleTestGoogleSignIn = async () => {
    try {
      setMessage('🔄 Testing Google sign in...');
      await signInWithGoogle();
      setMessage('✅ Google sign in successful!');
    } catch (error: any) {
      setMessage(`❌ Google sign in failed: ${error.message}`);
    }
  };

  const handleTestLogout = async () => {
    try {
      setMessage('🔄 Testing logout...');
      await logout();
      setMessage('✅ Logout successful!');
    } catch (error: any) {
      setMessage(`❌ Logout failed: ${error.message}`);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">🧪 Auth Test</h3>
      
      <div className="space-y-3">
        <div>
          <strong>Status:</strong> {loading ? '⏳ Loading...' : user ? '✅ Logged In' : '❌ Not Logged In'}
        </div>
        
        {user && (
          <div className="text-sm">
            <div><strong>UID:</strong> {user.uid}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Name:</strong> {user.displayName || 'Not Set'}</div>
          </div>
        )}

        <div className="space-y-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Test Email"
            className="w-full px-2 py-1 border rounded text-sm"
          />
          <input
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="Test Password"
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleTestSignUp}
            disabled={loading}
            size="sm"
            className="w-full text-xs"
          >
            Test Sign Up
          </Button>
          
          <Button
            onClick={handleTestSignIn}
            disabled={loading}
            size="sm"
            className="w-full text-xs"
          >
            Test Sign In
          </Button>
          
          <Button
            onClick={handleTestGoogleSignIn}
            disabled={loading}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            Test Google Sign In
          </Button>
          
          {user && (
            <Button
              onClick={handleTestLogout}
              disabled={loading}
              size="sm"
              variant="destructive"
              className="w-full text-xs"
            >
              Test Logout
            </Button>
          )}
        </div>

        {message && (
          <div className="text-xs p-2 bg-gray-100 dark:bg-gray-700 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
