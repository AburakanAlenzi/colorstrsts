import { Metadata } from 'next';
import { Language } from '@/types';
import { STCPaySettings } from '@/components/admin/STCPaySettings';
import { AdminGuard } from '@/components/auth/AdminGuard';

interface AdminPaymentsPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: AdminPaymentsPageProps): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'إعدادات الدفع - لوحة الإدارة' : 'Payment Settings - Admin Panel',
    description: lang === 'ar' ? 'إعداد وإدارة نظام الدفع STC Pay' : 'Configure and manage STC Pay payment system',
  };
}

export default async function AdminPaymentsPage({ params }: AdminPaymentsPageProps) {
  const { lang } = await params;

  return (
    <AdminGuard lang={lang}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <STCPaySettings lang={lang} />
        </div>
      </div>
    </AdminGuard>
  );
}
