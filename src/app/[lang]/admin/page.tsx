'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';

interface AdminRedirectProps {
  params: Promise<{ lang: Language }>;
}

export default function AdminRedirect({ params }: AdminRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const { lang } = await params;
      // إعادة توجيه إلى الرابط الجديد
      router.replace(`/${lang}/yousef`);
    };

    redirect();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">
          جاري إعادة التوجيه... | Redirecting...
        </p>
      </div>
    </div>
  );
}
