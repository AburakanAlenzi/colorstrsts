import { Metadata } from 'next';
import { Language } from '@/types';
import { SubscriptionManagement } from '@/components/admin/SubscriptionManagement';
import { AdminGuard } from '@/components/auth/AdminGuard';

interface AdminSubscriptionsPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: AdminSubscriptionsPageProps): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'إدارة الاشتراكات - لوحة الإدارة' : 'Subscription Management - Admin Panel',
    description: lang === 'ar' ? 'إدارة اشتراكات المستخدمين ومدفوعات STC Pay' : 'Manage user subscriptions and STC Pay payments',
  };
}

export default async function AdminSubscriptionsPage({ params }: AdminSubscriptionsPageProps) {
  const { lang } = await params;

  return (
    <AdminGuard lang={lang}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SubscriptionManagement lang={lang} />
        </div>
      </div>
    </AdminGuard>
  );
}
