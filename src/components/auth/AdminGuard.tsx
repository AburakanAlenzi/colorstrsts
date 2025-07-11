'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { validateAdminSession } from '@/lib/auth-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldExclamationIcon,
  ArrowLeftIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface AdminGuardProps {
  children: React.ReactNode;
  lang: Language;
  redirectTo?: string;
}

export function AdminGuard({ children, lang, redirectTo }: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isRTL = lang === 'ar';

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = () => {
    try {
      const adminSession = validateAdminSession();
      setIsAdmin(adminSession);
    } catch (error) {
      console.error('Error validating admin session:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.push(`/${lang}/admin`);
    }
  };

  const handleGoHome = () => {
    router.push(`/${lang}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'جاري التحقق من الصلاحيات...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldExclamationIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400">
              {isRTL ? 'وصول مرفوض' : 'Access Denied'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة. هذه المنطقة مخصصة للمديرين فقط.'
                : 'You do not have permission to access this page. This area is restricted to administrators only.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <LockClosedIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    {isRTL ? 'للوصول إلى لوحة الإدارة:' : 'To access the admin panel:'}
                  </p>
                  <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>
                      {isRTL 
                        ? '• يجب أن تكون مسجل دخول كمدير'
                        : '• You must be logged in as an administrator'
                      }
                    </li>
                    <li>
                      {isRTL 
                        ? '• تأكد من صحة بيانات الدخول'
                        : '• Ensure your login credentials are correct'
                      }
                    </li>
                    <li>
                      {isRTL 
                        ? '• تواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ'
                        : '• Contact the system administrator if you believe this is an error'
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleRedirect}
                className="w-full"
              >
                {isRTL ? 'الذهاب إلى صفحة تسجيل دخول المدير' : 'Go to Admin Login'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleGoHome}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <ArrowLeftIcon className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                <span>{isRTL ? 'العودة للصفحة الرئيسية' : 'Back to Home'}</span>
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isRTL 
                  ? 'إذا كنت تواجه مشاكل في الوصول، يرجى التواصل مع الدعم الفني'
                  : 'If you are experiencing access issues, please contact technical support'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted - render children
  return <>{children}</>;
}

// Hook for checking admin status in components
export function useAdminGuard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = () => {
      try {
        const adminSession = validateAdminSession();
        setIsAdmin(adminSession);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    // Check admin status periodically
    const interval = setInterval(checkAdmin, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { isAdmin, loading };
}

// Higher-order component for admin protection
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>,
  lang: Language,
  redirectTo?: string
) {
  return function AdminProtectedComponent(props: P) {
    return (
      <AdminGuard lang={lang} redirectTo={redirectTo}>
        <Component {...props} />
      </AdminGuard>
    );
  };
}
