import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import TestsManagementClient from './TestsManagementClient';

interface PageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'إدارة الاختبارات - اختبارات الألوان' : 'Tests Management - Color Testing',
    description: lang === 'ar' ? 'إدارة الاختبارات الكيميائية' : 'Manage chemical tests',
  };
}

export default async function TestsManagementPage({ params }: PageProps) {
  const { lang } = await params;

  // Validate language
  if (!['ar', 'en'].includes(lang)) {
    notFound();
  }

  return <TestsManagementClient lang={lang} />;
}
