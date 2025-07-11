'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface RootAuthRedirectProps {
  defaultLang?: string;
}

export function RootAuthRedirect({ defaultLang = 'en' }: RootAuthRedirectProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Detect user's preferred language from browser or localStorage
    let preferredLang = defaultLang;
    
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const savedLang = localStorage.getItem('preferred-language');
      if (savedLang && ['ar', 'en'].includes(savedLang)) {
        preferredLang = savedLang;
      } else {
        // Fallback to browser language detection
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('ar')) {
          preferredLang = 'ar';
        }
      }
    }

    if (user) {
      // User is authenticated, redirect to main app
      router.replace(`/${preferredLang}`);
    } else {
      // User is not authenticated, redirect to auth page
      router.replace(`/${preferredLang}/auth`);
    }
  }, [user, loading, router, defaultLang]);

  // Show loading spinner while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-900 dark:to-secondary-950">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading...
        </p>
      </div>
    </div>
  );
}
