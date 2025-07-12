'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CloudIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { getChemicalTests, getSubscriptionSettings } from '@/lib/firebase-realtime';

interface FirebaseStatusProps {
  isRTL?: boolean;
}

export default function FirebaseStatus({ isRTL = false }: FirebaseStatusProps) {
  const [status, setStatus] = useState({
    connected: false,
    testsCount: 0,
    settingsLoaded: false,
    lastUpdated: null as string | null,
    loading: true,
    error: null as string | null
  });

  const checkFirebaseStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Check chemical tests
      const tests = await getChemicalTests();
      
      // Check subscription settings
      const settings = await getSubscriptionSettings();
      
      setStatus({
        connected: true,
        testsCount: tests.length,
        settingsLoaded: !!settings,
        lastUpdated: settings.lastUpdated || null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Firebase status check failed:', error);
      setStatus(prev => ({
        ...prev,
        connected: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const getStatusColor = () => {
    if (status.loading) return 'bg-gray-100 text-gray-800';
    if (status.error) return 'bg-red-100 text-red-800';
    if (status.connected) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = () => {
    if (status.loading) return isRTL ? 'جاري التحقق...' : 'Checking...';
    if (status.error) return isRTL ? 'خطأ في الاتصال' : 'Connection Error';
    if (status.connected) return isRTL ? 'متصل' : 'Connected';
    return isRTL ? 'غير متصل' : 'Disconnected';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudIcon className="h-5 w-5 text-blue-600" />
          {isRTL ? 'حالة Firebase Realtime Database' : 'Firebase Realtime Database Status'}
        </CardTitle>
        <CardDescription>
          {isRTL 
            ? 'حالة الاتصال وإحصائيات قاعدة البيانات' 
            : 'Connection status and database statistics'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {isRTL ? 'حالة الاتصال:' : 'Connection Status:'}
          </span>
          <Badge className={getStatusColor()}>
            {status.connected && !status.loading && (
              <CheckCircleIcon className="h-3 w-3 mr-1" />
            )}
            {status.error && (
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            )}
            {getStatusText()}
          </Badge>
        </div>

        {/* Database URL */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {isRTL ? 'رابط قاعدة البيانات:' : 'Database URL:'}
          </span>
          <a 
            href="https://colorstests-573ef-default-rtdb.firebaseio.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            colorstests-573ef-default-rtdb.firebaseio.com
          </a>
        </div>

        {/* Statistics */}
        {status.connected && !status.loading && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{status.testsCount}</div>
              <div className="text-sm text-blue-800">
                {isRTL ? 'اختبار كيميائي' : 'Chemical Tests'}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {status.settingsLoaded ? '✓' : '✗'}
              </div>
              <div className="text-sm text-green-800">
                {isRTL ? 'إعدادات الاشتراك' : 'Subscription Settings'}
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {status.lastUpdated && (
          <div className="text-xs text-gray-500">
            {isRTL ? 'آخر تحديث: ' : 'Last updated: '}
            {new Date(status.lastUpdated).toLocaleString(isRTL ? 'ar' : 'en')}
          </div>
        )}

        {/* Error Message */}
        {status.error && (
          <Alert>
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>{isRTL ? 'خطأ:' : 'Error:'}</strong> {status.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkFirebaseStatus}
            disabled={status.loading}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${status.loading ? 'animate-spin' : ''}`} />
            {isRTL ? 'تحديث الحالة' : 'Refresh Status'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://colorstests-573ef-default-rtdb.firebaseio.com/', '_blank')}
          >
            <CloudIcon className="h-4 w-4 mr-2" />
            {isRTL ? 'فتح قاعدة البيانات' : 'Open Database'}
          </Button>
        </div>

        {/* Migration Info */}
        {!status.connected && (
          <Alert>
            <CloudIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  {isRTL 
                    ? 'لنقل البيانات إلى Firebase Realtime Database:' 
                    : 'To migrate data to Firebase Realtime Database:'
                  }
                </p>
                <code className="block bg-gray-100 p-2 rounded text-sm">
                  npm run migrate:firebase
                </code>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
