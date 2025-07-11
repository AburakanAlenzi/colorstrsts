'use client';

import React, { useState } from 'react';
import { emailService } from '@/lib/email-service';
import { Button } from '@/components/ui/button';

export function EmailTest() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testEmail, setTestEmail] = useState('aburakan4551@gmail.com');

  const testContactMessage = async () => {
    setLoading(true);
    setMessage('🔄 Testing contact message...');
    
    try {
      const result = await emailService.sendContactMessage({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Message from Color Testing App',
        message: 'This is a test message to verify email functionality is working correctly.'
      });

      if (result.success) {
        setMessage(`✅ Contact message sent successfully! Message ID: ${result.messageId}`);
      } else {
        setMessage(`❌ Failed to send contact message: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testVerificationCode = async () => {
    setLoading(true);
    setMessage('🔄 Testing verification code...');
    
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const result = await emailService.sendVerificationCode(testEmail, code, 'ar');

      if (result.success) {
        setMessage(`✅ Verification code sent successfully! Code: ${code}, Message ID: ${result.messageId}`);
      } else {
        setMessage(`❌ Failed to send verification code: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFormSubmitService = async () => {
    setLoading(true);
    setMessage('🔄 Testing FormSubmit service directly...');
    
    try {
      const response = await fetch('https://formsubmit.co/aburakan4551@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Email Test',
          email: 'test@colortest.system',
          subject: 'Direct FormSubmit Test',
          message: 'This is a direct test of the FormSubmit service to verify it works.',
          _captcha: 'false',
          _template: 'table'
        })
      });

      if (response.ok) {
        setMessage('✅ FormSubmit service test successful!');
      } else {
        setMessage(`❌ FormSubmit service failed: HTTP ${response.status}`);
      }
    } catch (error: any) {
      setMessage(`❌ FormSubmit error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg max-w-sm z-40">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">📧 Email Test</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Test Email:</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm mt-1"
            placeholder="Enter email to test"
          />
        </div>

        <div className="space-y-2">
          <Button
            onClick={testContactMessage}
            disabled={loading}
            size="sm"
            className="w-full text-xs"
          >
            Test Contact Message
          </Button>
          
          <Button
            onClick={testVerificationCode}
            disabled={loading}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            Test Verification Code
          </Button>
          
          <Button
            onClick={testFormSubmitService}
            disabled={loading}
            size="sm"
            variant="secondary"
            className="w-full text-xs"
          >
            Test FormSubmit Direct
          </Button>
        </div>

        {message && (
          <div className="text-xs p-2 bg-gray-100 dark:bg-gray-700 rounded max-h-32 overflow-auto">
            <pre className="whitespace-pre-wrap">{message}</pre>
          </div>
        )}

        <div className="text-xs text-gray-500 border-t pt-2">
          <p><strong>Service:</strong> FormSubmit.co</p>
          <p><strong>Target:</strong> aburakan4551@gmail.com</p>
          <p><strong>Method:</strong> POST JSON</p>
        </div>
      </div>
    </div>
  );
}
