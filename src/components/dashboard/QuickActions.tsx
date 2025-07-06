'use client';

import Link from 'next/link';
import { Language } from '@/types';
import { useAuth } from '@/components/providers';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  BeakerIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  PhotoIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  lang: Language;
}

export function QuickActions({ lang }: QuickActionsProps) {
  const { user } = useAuth();
  const t = getTranslationsSync(lang);

  const actions = [
    {
      title: lang === 'ar' ? 'اختبار جديد' : 'New Test',
      description: lang === 'ar' ? 'ابدأ اختبار كشف المواد' : 'Start a substance detection test',
      href: `/${lang}/tests`,
      icon: BeakerIcon,
      color: 'bg-primary-500 hover:bg-primary-600',
      textColor: 'text-white'
    },
    {
      title: lang === 'ar' ? 'تحليل الصورة' : 'Image Analysis',
      description: lang === 'ar' ? 'حلل لون من صورة' : 'Analyze color from image',
      href: `/${lang}/image-analyzer`,
      icon: PhotoIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      title: lang === 'ar' ? 'النتائج' : 'Results',
      description: lang === 'ar' ? 'عرض نتائج الاختبارات' : 'View test results',
      href: `/${lang}/results`,
      icon: ChartBarIcon,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    },
    {
      title: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
      description: lang === 'ar' ? 'إدارة معلوماتك' : 'Manage your information',
      href: `/${lang}/profile`,
      icon: UserIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white'
    },
    {
      title: lang === 'ar' ? 'الإعدادات' : 'Settings',
      description: lang === 'ar' ? 'تخصيص التطبيق' : 'Customize the app',
      href: `/${lang}/settings`,
      icon: Cog6ToothIcon,
      color: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-white'
    },
    {
      title: lang === 'ar' ? 'المساعدة' : 'Help',
      description: lang === 'ar' ? 'دليل الاستخدام' : 'User guide',
      href: `/${lang}/help`,
      icon: QuestionMarkCircleIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Link
              key={index}
              href={action.href}
              className="group block"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-md">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <IconComponent className={`h-6 w-6 ${action.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={lang === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* إجراء مميز للاشتراك */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
            <StarIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              {lang === 'ar' ? 'ترقية للمميز' : 'Upgrade to Premium'}
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {lang === 'ar' 
                ? 'احصل على اختبارات غير محدودة وميزات إضافية'
                : 'Get unlimited tests and additional features'
              }
            </p>
          </div>
          <Button 
            size="sm" 
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            asChild
          >
            <Link href={`/${lang}/subscription`}>
              {lang === 'ar' ? 'ترقية' : 'Upgrade'}
            </Link>
          </Button>
        </div>
      </div>

      {/* نصائح سريعة */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          {lang === 'ar' ? 'نصيحة اليوم' : 'Tip of the Day'}
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {lang === 'ar' 
            ? 'تأكد من إجراء الاختبار في إضاءة جيدة للحصول على أفضل النتائج'
            : 'Make sure to perform tests in good lighting for the best results'
          }
        </p>
      </div>
    </div>
  );
}
