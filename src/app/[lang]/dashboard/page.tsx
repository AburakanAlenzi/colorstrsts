import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserStats } from '@/components/profile/UserStats';
import { RecentTests } from '@/components/dashboard/RecentTests';
import { QuickActions } from '@/components/dashboard/QuickActions';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface DashboardPageProps {
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
    title: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
    description: lang === 'ar' 
      ? 'لوحة التحكم الشخصية لإدارة الاختبارات والنتائج'
      : 'Personal dashboard to manage tests and results',
  };
}

export default async function Dashboard({ params }: DashboardPageProps) {
  const { lang } = await params;
  const isRTL = lang === 'ar';

  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-background dark:to-blue-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                {lang === 'ar'
                  ? 'مرحباً بك في لوحة التحكم الخاصة بك. إدارة اختباراتك ومتابعة نتائجك بسهولة'
                  : 'Welcome to your personal dashboard. Manage your tests and track your results with ease'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Quick Actions - Full Width */}
              <div className="w-full">
                <QuickActions lang={lang} />
              </div>

              {/* Recent Tests - Full Width */}
              <div className="w-full">
                <RecentTests lang={lang} />
              </div>

              {/* User Stats - Below Recent Tests */}
              <div className="w-full">
                <UserStats lang={lang} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
