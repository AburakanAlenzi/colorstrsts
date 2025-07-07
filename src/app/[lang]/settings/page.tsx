import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';
import SettingsPage from '@/components/pages/settings-page';

interface PageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'الإعدادات - اختبارات الألوان' : 'Settings - Color Testing',
    description: lang === 'ar' ? 'تخصيص إعدادات التطبيق والتفضيلات' : 'Customize app settings and preferences',
  };
}

export default async function Settings({ params }: PageProps) {
  const { lang } = await params;
  
  // Validate language
  if (!['ar', 'en'].includes(lang)) {
    notFound();
  }
  
  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <SettingsPage lang={lang} />
    </AuthGuard>
  );
}
