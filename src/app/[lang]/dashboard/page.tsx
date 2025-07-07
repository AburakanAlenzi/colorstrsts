import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserStats } from '@/components/profile/UserStats';
import { RecentTests } from '@/components/dashboard/RecentTests';
import { QuickActions } from '@/components/dashboard/QuickActions';

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
      <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className={`text-center mb-12 ${isRTL ? 'rtl' : 'ltr'}`}>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </h1>
              <p className="text-xl text-muted-foreground">
                {lang === 'ar'
                  ? 'إدارة اختباراتك ومتابعة نتائجك'
                  : 'Manage your tests and track your results'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* العمود الأول - الإحصائيات والإجراءات السريعة */}
              <div className={`lg:col-span-1 space-y-6 ${isRTL ? 'lg:order-1' : 'lg:order-1'}`}>
                <UserStats lang={lang} />
                <QuickActions lang={lang} />
              </div>

              {/* العمود الثاني - الاختبارات الأخيرة */}
              <div className={`lg:col-span-2 ${isRTL ? 'lg:order-2' : 'lg:order-2'}`}>
                <RecentTests lang={lang} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
