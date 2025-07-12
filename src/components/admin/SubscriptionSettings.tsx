'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  StarIcon,
  LockOpenIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useSubscriptionSettings } from '@/hooks/useSubscriptionSettings';

interface SubscriptionSettingsProps {
  lang: Language;
}

interface TestAccessSettings {
  freeTestsEnabled: boolean;
  freeTestsCount: number;
  premiumRequired: boolean;
  globalFreeAccess: boolean;
  specificPremiumTests: number[];
}

export default function SubscriptionSettings({ lang }: SubscriptionSettingsProps) {
  const {
    settings,
    loading,
    updateSettings,
    loadSettings
  } = useSubscriptionSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [premiumTestInput, setPremiumTestInput] = useState('');

  const isRTL = lang === 'ar';

  // Update local settings when Firebase settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to Firebase Realtime Database
      await updateSettings(localSettings);

      toast.success(
        isRTL ? 'تم حفظ إعدادات الاشتراكات بنجاح في Firebase' : 'Subscription settings saved successfully to Firebase'
      );
    } catch (error) {
      console.error('Error saving settings to Firebase:', error);
      toast.error(
        isRTL ? 'خطأ في حفظ الإعدادات في Firebase' : 'Error saving settings to Firebase'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddPremiumTest = () => {
    const testNumber = parseInt(premiumTestInput);
    if (testNumber && !localSettings.specificPremiumTests.includes(testNumber)) {
      setLocalSettings(prev => ({
        ...prev,
        specificPremiumTests: [...prev.specificPremiumTests, testNumber].sort((a, b) => a - b)
      }));
      setPremiumTestInput('');
    }
  };

  const handleRemovePremiumTest = (testNumber: number) => {
    setLocalSettings(prev => ({
      ...prev,
      specificPremiumTests: prev.specificPremiumTests.filter(t => t !== testNumber)
    }));
  };

  const resetToDefaults = () => {
    setLocalSettings({
      freeTestsEnabled: true,
      freeTestsCount: 5,
      premiumRequired: true,
      globalFreeAccess: false,
      specificPremiumTests: []
    });
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isRTL ? 'إعدادات الاشتراكات والوصول' : 'Subscription & Access Settings'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'تحكم في إعدادات الوصول للاختبارات والاشتراكات' : 'Control test access and subscription settings'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            {isRTL ? 'إعادة تعيين' : 'Reset'}
          </Button>
          <Button onClick={saveSettings} loading={saving}>
            <Cog6ToothIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الإعدادات' : 'Save Settings')}
          </Button>
        </div>
      </div>

      {/* Global Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockOpenIcon className="h-5 w-5 text-green-600" />
            {isRTL ? 'التحكم العام في الوصول' : 'Global Access Control'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'إعدادات عامة للتحكم في وصول جميع المستخدمين' : 'General settings for controlling all user access'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Free Access */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-medium text-green-800 dark:text-green-200">
                {isRTL ? 'فتح جميع الاختبارات مجاناً' : 'Make All Tests Free'}
              </Label>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                {isRTL ? 'تمكين الوصول المجاني لجميع الاختبارات لكل المستخدمين' : 'Enable free access to all tests for everyone'}
              </p>
            </div>
            <Switch
              checked={localSettings.globalFreeAccess}
              onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, globalFreeAccess: checked }))}
            />
          </div>

          {!localSettings.globalFreeAccess && (
            <>
              {/* Free Tests Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      {isRTL ? 'تمكين الاختبارات المجانية' : 'Enable Free Tests'}
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isRTL ? 'السماح بعدد محدود من الاختبارات المجانية' : 'Allow limited number of free tests'}
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.freeTestsEnabled}
                    onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, freeTestsEnabled: checked }))}
                  />
                </div>

                {localSettings.freeTestsEnabled && (
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium">
                      {isRTL ? 'عدد الاختبارات المجانية:' : 'Number of free tests:'}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={localSettings.freeTestsCount}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, freeTestsCount: parseInt(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  </div>
                )}
              </div>

              {/* Premium Requirements */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    {isRTL ? 'طلب اشتراك مميز' : 'Require Premium Subscription'}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isRTL ? 'طلب اشتراك مميز للاختبارات المتقدمة' : 'Require premium subscription for advanced tests'}
                  </p>
                </div>
                <Switch
                  checked={localSettings.premiumRequired}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, premiumRequired: checked }))}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Specific Premium Tests */}
      {!localSettings.globalFreeAccess && localSettings.premiumRequired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-600" />
              {isRTL ? 'الاختبارات المميزة المحددة' : 'Specific Premium Tests'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'تحديد أرقام الاختبارات التي تتطلب اشتراك مميز' : 'Specify which test numbers require premium subscription'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Premium Test */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={isRTL ? 'رقم الاختبار' : 'Test number'}
                value={premiumTestInput}
                onChange={(e) => setPremiumTestInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddPremiumTest} disabled={!premiumTestInput}>
                {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </div>

            {/* Premium Tests List */}
            {localSettings.specificPremiumTests.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {isRTL ? 'الاختبارات المميزة الحالية:' : 'Current premium tests:'}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {localSettings.specificPremiumTests.map(testNumber => (
                    <div
                      key={testNumber}
                      className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm"
                    >
                      <StarIcon className="h-3 w-3" />
                      {isRTL ? `اختبار ${testNumber}` : `Test ${testNumber}`}
                      <button
                        onClick={() => handleRemovePremiumTest(testNumber)}
                        className="ml-1 rtl:mr-1 rtl:ml-0 text-yellow-600 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Status */}
      <Alert>
        <InformationCircleIcon className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">
              {isRTL ? 'الحالة الحالية:' : 'Current Status:'}
            </p>
            <ul className="text-sm space-y-1">
              {localSettings.globalFreeAccess ? (
                <li className="flex items-center gap-2 text-green-600">
                  <CheckCircleIcon className="h-4 w-4" />
                  {isRTL ? 'جميع الاختبارات مجانية للجميع' : 'All tests are free for everyone'}
                </li>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    {isRTL
                      ? `${localSettings.freeTestsCount} اختبارات مجانية متاحة`
                      : `${localSettings.freeTestsCount} free tests available`
                    }
                  </li>
                  {localSettings.specificPremiumTests.length > 0 && (
                    <li className="flex items-center gap-2">
                      <StarIcon className="h-4 w-4 text-yellow-600" />
                      {isRTL
                        ? `${localSettings.specificPremiumTests.length} اختبارات تتطلب اشتراك مميز`
                        : `${localSettings.specificPremiumTests.length} tests require premium subscription`
                      }
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
