'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Cog6ToothIcon,
  LanguageIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface SettingsPageProps {
  lang: Language;
}

interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  notifications: boolean;
  autoSave: boolean;
  showConfidence: boolean;
  compactView: boolean;
}

export default function SettingsPage({ lang }: SettingsPageProps) {
  const router = useRouter();
  const isRTL = lang === 'ar';
  
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    language: lang,
    notifications: true,
    autoSave: true,
    showConfidence: true,
    compactView: false
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Apply theme immediately
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLanguageChange = (newLang: 'ar' | 'en') => {
    setSettings(prev => ({ ...prev, language: newLang }));
    // Navigate to the new language
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${lang}/`, `/${newLang}/`);
    router.push(newPath);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-background dark:to-blue-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <ArrowLeftIcon className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                <span>{isRTL ? 'رجوع' : 'Back'}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {isRTL ? 'الإعدادات' : 'Settings'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL ? 'تخصيص إعدادات التطبيق والتفضيلات' : 'Customize app settings and preferences'}
                </p>
              </div>
            </div>
            <Cog6ToothIcon className="h-8 w-8 text-blue-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <SunIcon className="h-5 w-5" />
                  <span>{isRTL ? 'المظهر' : 'Appearance'}</span>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تخصيص مظهر التطبيق' : 'Customize the app appearance'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isRTL ? 'المظهر' : 'Theme'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'light', label: isRTL ? 'فاتح' : 'Light', icon: SunIcon },
                      { value: 'dark', label: isRTL ? 'داكن' : 'Dark', icon: MoonIcon },
                      { value: 'system', label: isRTL ? 'النظام' : 'System', icon: Cog6ToothIcon }
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setSettings(prev => ({ ...prev, theme: theme.value as any }))}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          settings.theme === theme.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <theme.icon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs">{theme.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      {isRTL ? 'العرض المضغوط' : 'Compact View'}
                    </label>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'عرض أكثر كثافة للمحتوى' : 'More dense content display'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, compactView: !prev.compactView }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.compactView ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.compactView ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <LanguageIcon className="h-5 w-5" />
                  <span>{isRTL ? 'اللغة' : 'Language'}</span>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'اختر لغة التطبيق' : 'Choose app language'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleLanguageChange('ar')}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      settings.language === 'ar'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">🇸🇦</div>
                    <div className="font-medium">العربية</div>
                    <div className="text-xs text-gray-500">Arabic</div>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      settings.language === 'en'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">🇺🇸</div>
                    <div className="font-medium">English</div>
                    <div className="text-xs text-gray-500">الإنجليزية</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Test Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>{isRTL ? 'إعدادات الاختبار' : 'Test Settings'}</span>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تخصيص سلوك الاختبارات' : 'Customize test behavior'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      {isRTL ? 'الحفظ التلقائي' : 'Auto Save'}
                    </label>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'حفظ النتائج تلقائياً' : 'Automatically save results'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoSave ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoSave ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      {isRTL ? 'إظهار مستوى الثقة' : 'Show Confidence Level'}
                    </label>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'عرض نسبة الثقة في النتائج' : 'Display confidence percentage in results'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, showConfidence: !prev.showConfidence }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.showConfidence ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.showConfidence ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <BellIcon className="h-5 w-5" />
                  <span>{isRTL ? 'الإشعارات' : 'Notifications'}</span>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'إدارة إشعارات التطبيق' : 'Manage app notifications'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      {isRTL ? 'تفعيل الإشعارات' : 'Enable Notifications'}
                    </label>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'تلقي إشعارات حول النتائج والتحديثات' : 'Receive notifications about results and updates'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={saveSettings}
              className={`px-8 py-3 text-lg ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {saved ? (
                <>
                  <CheckIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'تم الحفظ!' : 'Saved!'}
                </>
              ) : (
                <>
                  <Cog6ToothIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
