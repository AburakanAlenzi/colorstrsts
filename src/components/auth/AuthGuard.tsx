'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Language } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  lang: Language;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  lang, 
  requireAuth = true, 
  redirectTo 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    const checkAuth = () => {
      if (requireAuth && !user) {
        // User is not authenticated but auth is required
        const authPath = redirectTo || `/${lang}/auth`;
        
        // Store the intended destination for redirect after login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterAuth', pathname);
        }
        
        router.replace(authPath);
        return;
      }

      if (!requireAuth && user) {
        // User is authenticated but trying to access auth pages
        const redirectPath = redirectTo || `/${lang}`;
        
        // Check if there's a stored redirect path
        if (typeof window !== 'undefined') {
          const storedRedirect = sessionStorage.getItem('redirectAfterAuth');
          if (storedRedirect) {
            sessionStorage.removeItem('redirectAfterAuth');
            router.replace(storedRedirect);
            return;
          }
        }
        
        router.replace(redirectPath);
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [user, loading, requireAuth, router, lang, pathname, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If we reach here, the auth check passed
  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    redirectTo?: string;
  } = {}
) {
  return function AuthGuardedComponent(props: P & { lang: Language }) {
    return (
      <AuthGuard 
        lang={props.lang} 
        requireAuth={options.requireAuth}
        redirectTo={options.redirectTo}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };
}
