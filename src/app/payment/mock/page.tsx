'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function MockPaymentPage() {
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get('transaction_id');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePaymentAction = (action: 'success' | 'fail' | 'cancel') => {
    setProcessing(true);
    
    setTimeout(() => {
      const lang = window.location.pathname.includes('/ar/') ? 'ar' : 'en';
      
      switch (action) {
        case 'success':
          router.push(`/${lang}/subscription/success?transaction_id=${transactionId}&status=completed`);
          break;
        case 'fail':
          router.push(`/${lang}/subscription/cancel?transaction_id=${transactionId}&status=failed&reason=payment_failed`);
          break;
        case 'cancel':
          router.push(`/${lang}/subscription/cancel?transaction_id=${transactionId}&status=cancelled`);
          break;
      }
    }, 2000);
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Processing Payment</CardTitle>
            <CardDescription>Please wait while we process your payment...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCardIcon className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Mock STC Pay Gateway</CardTitle>
          <CardDescription>
            This is a simulation of STC Pay payment gateway for testing purposes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-semibold">{amount} SAR</span>
              </div>
              <div className="flex justify-between">
                <span>Merchant:</span>
                <span>Color Testing App</span>
              </div>
            </div>
          </div>

          {/* Auto-redirect notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Auto-redirect in {countdown} seconds</strong>
              <br />
              This page will automatically redirect to success page for testing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => handlePaymentAction('success')}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Simulate Successful Payment
            </Button>
            
            <Button 
              onClick={() => handlePaymentAction('fail')}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircleIcon className="h-4 w-4 mr-2" />
              Simulate Failed Payment
            </Button>
            
            <Button 
              onClick={() => handlePaymentAction('cancel')}
              variant="outline"
              className="w-full"
            >
              Cancel Payment
            </Button>
          </div>

          {/* Development Notice */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Development Mode:</strong> This is a mock payment gateway for testing. 
              In production, this would be replaced with the actual STC Pay integration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Auto-redirect after 5 seconds
setTimeout(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transaction_id');
    const lang = window.location.pathname.includes('/ar/') ? 'ar' : 'en';
    
    if (transactionId) {
      window.location.href = `/${lang}/subscription/success?transaction_id=${transactionId}&status=completed`;
    }
  }
}, 5000);
