'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getSubscriptionSettings,
  saveSubscriptionSettings,
  getChemicalTests,
  saveChemicalTests,
  SubscriptionSettings,
  ChemicalTest
} from '@/lib/firebase-realtime';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface FirebaseDebuggerProps {
  lang: Language;
}

export default function FirebaseDebugger({ lang }: FirebaseDebuggerProps) {
  const [loading, setLoading] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<{
    connected: boolean;
    subscriptionSettings: SubscriptionSettings | null;
    chemicalTests: ChemicalTest[] | null;
    error?: string;
  }>({
    connected: false,
    subscriptionSettings: null,
    chemicalTests: null
  });

  const isRTL = lang === 'ar';

  const checkFirebaseStatus = async () => {
    setLoading(true);
    try {
      console.log('🔍 Checking Firebase Realtime Database status...');
      
      // Check subscription settings
      const settings = await getSubscriptionSettings();
      console.log('📊 Subscription settings:', settings);
      
      // Check chemical tests
      const tests = await getChemicalTests();
      console.log('🧪 Chemical tests:', tests?.length || 0, 'items');
      
      setFirebaseStatus({
        connected: true,
        subscriptionSettings: settings,
        chemicalTests: tests,
      });

      toast.success(
        isRTL ? 'تم فحص Firebase بنجاح' : 'Firebase check completed successfully'
      );
    } catch (error) {
      console.error('❌ Firebase check failed:', error);
      setFirebaseStatus({
        connected: false,
        subscriptionSettings: null,
        chemicalTests: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      toast.error(
        isRTL ? 'فشل في الاتصال بـ Firebase' : 'Failed to connect to Firebase'
      );
    } finally {
      setLoading(false);
    }
  };

  const initializeFirebaseData = async () => {
    setLoading(true);
    try {
      console.log('🚀 Initializing Firebase data...');

      // Initialize subscription settings
      const defaultSettings: SubscriptionSettings = {
        freeTestsEnabled: true,
        freeTestsCount: 5,
        premiumRequired: true,
        globalFreeAccess: false,
        specificPremiumTests: []
      };

      await saveSubscriptionSettings(defaultSettings);
      console.log('✅ Subscription settings initialized');

      // Initialize chemical tests (basic set)
      const defaultTests: ChemicalTest[] = [
        {
          id: 'marquis-test',
          method_name: 'Marquis Test',
          method_name_ar: 'اختبار ماركيز',
          color_result: 'Purple/Black',
          color_result_ar: 'بنفسجي/أسود',
          possible_substance: 'MDMA/Amphetamines',
          possible_substance_ar: 'إم دي إم إيه/أمفيتامينات',
          prepare: 'Add 2-3 drops of reagent to sample',
          prepare_ar: 'أضف 2-3 قطرات من الكاشف إلى العينة',
          description: 'Primary screening test for MDMA and amphetamines',
          description_ar: 'اختبار فحص أولي للإم دي إم إيه والأمفيتامينات',
          test_type: 'Presumptive',
          test_number: '1',
          reference: 'DEA Guidelines',
          category: 'basic',
          safety_level: 'medium',
          reagents: ['Marquis Reagent'],
          expected_time: '2-3 minutes'
        },
        {
          id: 'mecke-test',
          method_name: 'Mecke Test',
          method_name_ar: 'اختبار ميك',
          color_result: 'Blue/Green',
          color_result_ar: 'أزرق/أخضر',
          possible_substance: 'Opiates',
          possible_substance_ar: 'مواد أفيونية',
          prepare: 'Add 2-3 drops of reagent to sample',
          prepare_ar: 'أضف 2-3 قطرات من الكاشف إلى العينة',
          description: 'Screening test for opiates and related compounds',
          description_ar: 'اختبار فحص للمواد الأفيونية والمركبات ذات الصلة',
          test_type: 'Presumptive',
          test_number: '2',
          reference: 'UNODC Manual',
          category: 'basic',
          safety_level: 'medium',
          reagents: ['Mecke Reagent'],
          expected_time: '2-3 minutes'
        },
        {
          id: 'fast-blue-b-test',
          method_name: 'Fast Blue B Salt Test',
          method_name_ar: 'اختبار الأزرق السريع ب',
          color_result: 'Orange/Red',
          color_result_ar: 'برتقالي/أحمر',
          possible_substance: 'THC/Cannabis',
          possible_substance_ar: 'تي إتش سي/حشيش',
          prepare: 'Mix sample with Fast Blue B salt solution',
          prepare_ar: 'اخلط العينة مع محلول ملح الأزرق السريع ب',
          description: 'Specific test for THC and cannabis compounds',
          description_ar: 'اختبار محدد لمركبات التي إتش سي والحشيش',
          test_type: 'Confirmatory',
          test_number: '13',
          reference: 'Scientific Literature',
          category: 'advanced',
          safety_level: 'high',
          reagents: ['Fast Blue B Salt', 'Sodium Hydroxide'],
          expected_time: '5-10 minutes'
        }
      ];

      await saveChemicalTests(defaultTests);
      console.log('✅ Chemical tests initialized');

      // Refresh status
      await checkFirebaseStatus();

      toast.success(
        isRTL ? 'تم تهيئة بيانات Firebase بنجاح' : 'Firebase data initialized successfully'
      );
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      toast.error(
        isRTL ? 'فشل في تهيئة بيانات Firebase' : 'Failed to initialize Firebase data'
      );
    } finally {
      setLoading(false);
    }
  };

  const testGlobalFreeAccess = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing global free access...');

      // Enable global free access
      const testSettings: SubscriptionSettings = {
        freeTestsEnabled: true,
        freeTestsCount: 5,
        premiumRequired: false,
        globalFreeAccess: true,
        specificPremiumTests: []
      };

      await saveSubscriptionSettings(testSettings);
      console.log('✅ Global free access enabled');

      // Refresh status
      await checkFirebaseStatus();

      toast.success(
        isRTL ? 'تم تفعيل الوصول المجاني العام' : 'Global free access enabled'
      );
    } catch (error) {
      console.error('❌ Failed to enable global free access:', error);
      toast.error(
        isRTL ? 'فشل في تفعيل الوصول المجاني العام' : 'Failed to enable global free access'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5" />
          {isRTL ? 'مصحح Firebase' : 'Firebase Debugger'}
        </CardTitle>
        <CardDescription>
          {isRTL 
            ? 'أداة لفحص وإصلاح اتصال Firebase Realtime Database'
            : 'Tool to check and fix Firebase Realtime Database connection'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <Alert>
          {firebaseStatus.connected ? (
            <CheckCircleIcon className="h-4 w-4" />
          ) : (
            <ExclamationTriangleIcon className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                {firebaseStatus.connected 
                  ? (isRTL ? 'متصل بـ Firebase' : 'Connected to Firebase')
                  : (isRTL ? 'غير متصل بـ Firebase' : 'Not connected to Firebase')
                }
              </p>
              {firebaseStatus.error && (
                <p className="text-sm text-red-600">{firebaseStatus.error}</p>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Data Status */}
        {firebaseStatus.connected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">
                {isRTL ? 'إعدادات الاشتراكات' : 'Subscription Settings'}
              </h4>
              {firebaseStatus.subscriptionSettings ? (
                <div className="text-sm space-y-1">
                  <p>Global Free Access: {firebaseStatus.subscriptionSettings.globalFreeAccess ? '✅' : '❌'}</p>
                  <p>Free Tests: {firebaseStatus.subscriptionSettings.freeTestsCount}</p>
                  <p>Premium Required: {firebaseStatus.subscriptionSettings.premiumRequired ? '✅' : '❌'}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {isRTL ? 'لا توجد إعدادات' : 'No settings found'}
                </p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">
                {isRTL ? 'الاختبارات الكيميائية' : 'Chemical Tests'}
              </h4>
              <p className="text-sm">
                {firebaseStatus.chemicalTests 
                  ? `${firebaseStatus.chemicalTests.length} ${isRTL ? 'اختبار' : 'tests'}`
                  : (isRTL ? 'لا توجد اختبارات' : 'No tests found')
                }
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={checkFirebaseStatus} 
            disabled={loading}
            variant="outline"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            {isRTL ? 'إعادة فحص' : 'Refresh'}
          </Button>

          <Button 
            onClick={initializeFirebaseData} 
            disabled={loading}
          >
            {isRTL ? 'تهيئة البيانات' : 'Initialize Data'}
          </Button>

          <Button 
            onClick={testGlobalFreeAccess} 
            disabled={loading}
            variant="secondary"
          >
            {isRTL ? 'تفعيل الوصول المجاني' : 'Enable Global Free Access'}
          </Button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-600">
              {isRTL ? 'جاري المعالجة...' : 'Processing...'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
