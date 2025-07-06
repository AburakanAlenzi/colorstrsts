import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserProfile } from '@/components/profile/UserProfile';
import { UserStats } from '@/components/profile/UserStats';
import { WelcomeMessage } from '@/components/profile/WelcomeMessage';

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
    <AuthGuard lang={lang} requireAuth={true}>
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

            <div className="space-y-8">
              <WelcomeMessage lang={lang} />
              <UserStats lang={lang} />
              <UserProfile lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
