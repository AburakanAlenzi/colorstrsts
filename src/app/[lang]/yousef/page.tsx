import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NotFoundPageProps {
  params: Promise<{ lang: Language }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;
  
  return {
    title: lang === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found',
    description: lang === 'ar' ? 'الصفحة المطلوبة غير متاحة' : 'The requested page is not available',
  };
}

export default async function NotFoundPage({ params }: NotFoundPageProps) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const isRTL = lang === 'ar';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md w-full mx-auto text-center px-6">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-red-600 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {isRTL ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isRTL 
            ? 'عذراً، الصفحة التي تبحث عنها غير متاحة أو تم حذفها.'
            : 'Sorry, the page you are looking for is not available or has been removed.'
          }
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href={`/${lang}`}>
              {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href={`/${lang}/admin`}>
              {isRTL ? 'صفحة المدير' : 'Admin Page'}
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {isRTL 
              ? 'إذا كنت تبحث عن لوحة المدير، يرجى استخدام الرابط أعلاه.'
              : 'If you are looking for the admin panel, please use the link above.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
