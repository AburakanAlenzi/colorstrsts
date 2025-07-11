'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import { stcPayService } from '@/lib/stc-pay';
import {
  Cog6ToothIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface STCPaySettingsProps {
  lang: Language;
}

interface PaymentSettings {
  merchantId: string;
  apiKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  baseUrl: string;
  enabledPlans: string[];
  autoRenew: boolean;
  testMode: boolean;
}

export function STCPaySettings({ lang }: STCPaySettingsProps) {
  const [settings, setSettings] = useState<PaymentSettings>({
    merchantId: process.env.NEXT_PUBLIC_STC_PAY_MERCHANT_ID || '',
    apiKey: '',
    webhookSecret: '',
    environment: 'sandbox',
    baseUrl: process.env.NEXT_PUBLIC_STC_PAY_BASE_URL || 'https://api.stcpay.com.sa',
    enabledPlans: ['monthly', 'yearly'],
    autoRenew: false,
    testMode: true
  });

  const [showSecrets, setShowSecrets] = useState({
    apiKey: false,
    webhookSecret: false
  });

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const isRTL = lang === 'ar';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // في التطبيق الحقيقي، ستجلب هذه الإعدادات من قاعدة البيانات
    // هنا سنستخدم القيم من متغيرات البيئة والإعدادات الافتراضية
    const savedSettings = localStorage.getItem('stc_pay_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsed });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // في التطبيق الحقيقي، ستحفظ هذه الإعدادات في قاعدة البيانات الآمنة
      localStorage.setItem('stc_pay_settings', JSON.stringify(settings));
      
      setMessage({
        type: 'success',
        text: isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully'
      });

      // اختبار الاتصال بعد الحفظ
      await testConnection();

    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: isRTL ? 'خطأ في حفظ الإعدادات' : 'Error saving settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      // محاكاة اختبار الاتصال
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (settings.environment === 'sandbox' || settings.merchantId) {
        setConnectionStatus('connected');
        setMessage({
          type: 'success',
          text: isRTL ? 'تم الاتصال بـ STC Pay بنجاح' : 'Successfully connected to STC Pay'
        });
      } else {
        throw new Error('Invalid configuration');
      }
    } catch (error) {
      setConnectionStatus('error');
      setMessage({
        type: 'error',
        text: isRTL ? 'فشل في الاتصال بـ STC Pay' : 'Failed to connect to STC Pay'
      });
    }
  };

  const handleInputChange = (field: keyof PaymentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const togglePlan = (planId: string) => {
    const enabledPlans = settings.enabledPlans.includes(planId)
      ? settings.enabledPlans.filter(id => id !== planId)
      : [...settings.enabledPlans, planId];
    
    handleInputChange('enabledPlans', enabledPlans);
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'connected':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <GlobeAltIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return isRTL ? 'جاري الاختبار...' : 'Testing...';
      case 'connected':
        return isRTL ? 'متصل' : 'Connected';
      case 'error':
        return isRTL ? 'خطأ في الاتصال' : 'Connection Error';
      default:
        return isRTL ? 'غير مختبر' : 'Not Tested';
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isRTL ? 'إعدادات STC Pay' : 'STC Pay Settings'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'إعداد وإدارة نظام الدفع STC Pay' : 'Configure and manage STC Pay payment system'}
          </p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {getConnectionStatusIcon()}
          <span className="text-sm text-gray-600">{getConnectionStatusText()}</span>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <Alert className={
          message.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
          message.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
          'border-green-200 bg-green-50 dark:bg-green-900/20'
        }>
          <AlertDescription className={
            message.type === 'error' ? 'text-red-800 dark:text-red-200' :
            message.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
            'text-green-800 dark:text-green-200'
          }>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Environment Warning */}
      {settings.environment === 'production' && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {isRTL 
              ? '⚠️ أنت في بيئة الإنتاج. تأكد من صحة جميع الإعدادات قبل الحفظ.'
              : '⚠️ You are in production environment. Make sure all settings are correct before saving.'
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cog6ToothIcon className="h-5 w-5" />
              {isRTL ? 'الإعدادات الأساسية' : 'Basic Configuration'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'إعدادات الاتصال الأساسية مع STC Pay' : 'Basic connection settings for STC Pay'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {isRTL ? 'البيئة' : 'Environment'}
              </label>
              <select
                value={settings.environment}
                onChange={(e) => handleInputChange('environment', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sandbox">{isRTL ? 'تجريبي (Sandbox)' : 'Sandbox'}</option>
                <option value="production">{isRTL ? 'إنتاج (Production)' : 'Production'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {isRTL ? 'معرف التاجر (Merchant ID)' : 'Merchant ID'}
              </label>
              <input
                type="text"
                value={settings.merchantId}
                onChange={(e) => handleInputChange('merchantId', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isRTL ? 'أدخل معرف التاجر' : 'Enter merchant ID'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {isRTL ? 'رابط API' : 'API Base URL'}
              </label>
              <input
                type="url"
                value={settings.baseUrl}
                onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.stcpay.com.sa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {isRTL ? 'مفتاح API' : 'API Key'}
              </label>
              <div className="relative">
                <input
                  type={showSecrets.apiKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  className="w-full p-2 pr-10 rtl:pl-10 rtl:pr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isRTL ? 'أدخل مفتاح API' : 'Enter API key'}
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(prev => ({ ...prev, apiKey: !prev.apiKey }))}
                  className="absolute right-2 rtl:left-2 rtl:right-auto top-1/2 transform -translate-y-1/2"
                >
                  {showSecrets.apiKey ? 
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" /> : 
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  }
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {isRTL ? 'مفتاح Webhook' : 'Webhook Secret'}
              </label>
              <div className="relative">
                <input
                  type={showSecrets.webhookSecret ? 'text' : 'password'}
                  value={settings.webhookSecret}
                  onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                  className="w-full p-2 pr-10 rtl:pl-10 rtl:pr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isRTL ? 'أدخل مفتاح Webhook' : 'Enter webhook secret'}
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(prev => ({ ...prev, webhookSecret: !prev.webhookSecret }))}
                  className="absolute right-2 rtl:left-2 rtl:right-auto top-1/2 transform -translate-y-1/2"
                >
                  {showSecrets.webhookSecret ? 
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" /> : 
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  }
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5" />
              {isRTL ? 'خطط الاشتراك' : 'Subscription Plans'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'إدارة الخطط المتاحة للمستخدمين' : 'Manage available plans for users'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free').map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {isRTL ? plan.nameAr : plan.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stcPayService.formatPrice(plan.price, plan.currency, isRTL ? 'ar-SA' : 'en-US')}
                    <span className="mx-1">/</span>
                    {isRTL ? (plan.duration === 'monthly' ? 'شهر' : 'سنة') : plan.duration}
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enabledPlans.includes(plan.id)}
                    onChange={() => togglePlan(plan.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 rtl:mr-2 rtl:ml-0 text-sm">
                    {isRTL ? 'مفعل' : 'Enabled'}
                  </span>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5" />
            {isRTL ? 'الإعدادات المتقدمة' : 'Advanced Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoRenew}
                onChange={(e) => handleInputChange('autoRenew', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 rtl:mr-2 rtl:ml-0">
                {isRTL ? 'التجديد التلقائي' : 'Auto Renewal'}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.testMode}
                onChange={(e) => handleInputChange('testMode', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 rtl:mr-2 rtl:ml-0">
                {isRTL ? 'وضع الاختبار' : 'Test Mode'}
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          onClick={testConnection}
          variant="outline"
          disabled={connectionStatus === 'checking'}
          className="flex items-center gap-2"
        >
          <GlobeAltIcon className="h-4 w-4" />
          {isRTL ? 'اختبار الاتصال' : 'Test Connection'}
        </Button>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Button
            onClick={loadSettings}
            variant="outline"
          >
            {isRTL ? 'إعادة تحميل' : 'Reload'}
          </Button>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <DocumentTextIcon className="h-4 w-4" />
            )}
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الإعدادات' : 'Save Settings')}
          </Button>
        </div>
      </div>
    </div>
  );
}
