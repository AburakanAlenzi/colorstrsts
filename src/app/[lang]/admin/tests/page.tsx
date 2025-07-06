import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { getAllTranslations } from '@/lib/translations';
import TestsManagementNew from '@/components/admin/TestsManagementNew';
import { AuthProvider } from '@/components/auth/AuthProvider';

interface PageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const translations = getAllTranslations(lang);

  return {
    title: `${translations.testsManagement?.title || 'Tests Management'} - ${translations.common?.app_name || 'Color Test'}`,
    description: translations.testsManagement?.subtitle || 'Manage chemical tests',
  };
}

export default async function TestsManagementPage({ params }: PageProps) {
  const { lang } = await params;
  
  // Validate language
  if (!['ar', 'en'].includes(lang)) {
    notFound();
  }
  
  const translations = getAllTranslations(lang);
  const isRTL = lang === 'ar';
  
  return (
    <AuthProvider>
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">
              {isRTL ? 'إدارة الاختبارات' : 'Tests Management'}
            </h1>
            <p className="text-gray-600">
              {isRTL ? 'هذه الصفحة قيد التطوير' : 'This page is under development'}
            </p>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
