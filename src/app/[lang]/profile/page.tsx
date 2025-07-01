import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';

interface ProfilePageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
    description: lang === 'ar' 
      ? 'إدارة الملف الشخصي وإعدادات الحساب'
      : 'Manage your profile and account settings',
  };
}

export default async function Profile({ params }: ProfilePageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {lang === 'ar' 
                ? 'إدارة معلوماتك الشخصية وإعدادات الحساب'
                : 'Manage your personal information and account settings'
              }
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6">
                <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {lang === 'ar' 
                  ? 'صفحة الملف الشخصي قيد التطوير. ستتمكن قريباً من إدارة معلوماتك الشخصية وإعدادات الحساب.'
                  : 'The profile page is under development. You will soon be able to manage your personal information and account settings.'
                }
              </p>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>
                    {lang === 'ar' ? 'الميزات القادمة:' : 'Upcoming features:'}
                  </strong>
                </p>
                <ul className="space-y-2 text-left max-w-md mx-auto">
                  <li>• {lang === 'ar' ? 'تحرير المعلومات الشخصية' : 'Edit personal information'}</li>
                  <li>• {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change password'}</li>
                  <li>• {lang === 'ar' ? 'إعدادات اللغة' : 'Language preferences'}</li>
                  <li>• {lang === 'ar' ? 'سجل الاختبارات' : 'Test history'}</li>
                  <li>• {lang === 'ar' ? 'إعدادات الإشعارات' : 'Notification settings'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
