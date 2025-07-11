import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import SubscribersManagement from '@/components/admin/SubscribersManagement';

interface PageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'إدارة المشتركين - اختبارات الألوان' : 'Subscribers Management - Color Testing',
    description: lang === 'ar' ? 'إدارة المشتركين والاشتراكات ومدفوعات STC Pay' : 'Manage subscribers, subscriptions and STC Pay payments',
  };
}

export default async function SubscribersManagementPage({ params }: PageProps) {
  const { lang } = await params;
  
  // Validate language
  if (!['ar', 'en'].includes(lang)) {
    notFound();
  }
  
  const isRTL = lang === 'ar';
  
  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <SubscribersManagement isRTL={isRTL} />
        </div>
      </div>
    </div>
  );
}
