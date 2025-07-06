'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { useAuth } from '@/components/providers';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  XMarkIcon,
  SparklesIcon,
  BeakerIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface WelcomeMessageProps {
  lang: Language;
}

export function WelcomeMessage({ lang }: WelcomeMessageProps) {
  const { user } = useAuth();
  const t = getTranslationsSync(lang);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user) {
      // تحقق من إذا كان المستخدم جديد (تم إنشاء الحساب خلال آخر 24 ساعة)
      const createdAt = new Date(user.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      // إظهار رسالة الترحيب للمستخدمين الجدد أو إذا لم يتم إخفاؤها من قبل
      const hasSeenWelcome = localStorage.getItem(`welcome_seen_${user.id}`);
      
      if (hoursDiff < 24 || !hasSeenWelcome) {
        setIsVisible(true);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (user) {
      localStorage.setItem(`welcome_seen_${user.id}`, 'true');
    }
  };

  if (!isVisible || !user) {
    return null;
  }

  const userName = user.full_name || user.email?.split('@')[0] || t('navigation.user');

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-6 shadow-lg mb-8 relative overflow-hidden">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* زر الإغلاق */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-white/80 hover:text-white transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      <div className="relative z-10">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {lang === 'ar' ? `مرحباً ${userName}!` : `Welcome ${userName}!`}
            </h2>
            <p className="text-primary-100">
              {lang === 'ar' 
                ? 'نحن سعداء لانضمامك إلينا' 
                : "We're excited to have you on board"
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
              <BeakerIcon className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">
                {lang === 'ar' ? 'ابدأ اختبارك الأول' : 'Start Your First Test'}
              </h3>
            </div>
            <p className="text-primary-100 text-sm">
              {lang === 'ar' 
                ? 'لديك 5 اختبارات مجانية للبدء' 
                : 'You have 5 free tests to get started'
              }
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
              <ChartBarIcon className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">
                {lang === 'ar' ? 'تتبع نتائجك' : 'Track Your Results'}
              </h3>
            </div>
            <p className="text-primary-100 text-sm">
              {lang === 'ar' 
                ? 'احفظ وراجع نتائج اختباراتك' 
                : 'Save and review your test results'
              }
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
              <UserIcon className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">
                {lang === 'ar' ? 'أكمل ملفك الشخصي' : 'Complete Your Profile'}
              </h3>
            </div>
            <p className="text-primary-100 text-sm">
              {lang === 'ar' 
                ? 'أضف معلوماتك لتجربة أفضل' 
                : 'Add your info for a better experience'
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            variant="secondary" 
            asChild
            className="bg-white text-primary-600 hover:bg-primary-50"
          >
            <a href={`/${lang}/tests`}>
              <BeakerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'ابدأ اختبار' : 'Start Test'}
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            asChild
            className="border-white/30 text-white hover:bg-white/10"
          >
            <a href={`/${lang}/help`}>
              {lang === 'ar' ? 'تعلم المزيد' : 'Learn More'}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
