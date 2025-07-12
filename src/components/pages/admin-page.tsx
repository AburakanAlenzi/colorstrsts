'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { DataService } from '@/lib/data-service';
import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import { AdminLogin } from '@/components/admin/admin-login';
import { PasswordRecovery } from '@/components/admin/password-recovery';
import {
  validateAdminPassword,
  createAdminSession,
  validateAdminSession,
  clearAdminSession,
  isAccountLocked,
  getRemainingLockoutTime,
  recordFailedAttempt,
  getLoginAttempts,
  getSessionInfo,
  logSecurityEvent,
} from '@/lib/auth-utils';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AdminPageProps {
  lang: Language;
}

export function AdminPage({ lang }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const t = getTranslationsSync(lang);

  // Security configuration
  const maxAttempts = parseInt(process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || '5');

  useEffect(() => {
    // Check if user is already authenticated as admin
    if (user && isAdmin) {
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Check for valid admin session
    if (validateAdminSession()) {
      setIsAuthenticated(true);
      setLoading(false);
      logSecurityEvent('Valid session found');
      return;
    }

    // Show password prompt for admin access
    setShowPasswordPrompt(true);
    logSecurityEvent('Admin access via /yousef route');

    setLoading(false);
  }, [user, isAdmin]);

  const handlePasswordSubmit = async (password: string) => {
    // Check if account is locked
    if (isAccountLocked()) {
      const remainingTime = getRemainingLockoutTime();
      toast.error(
        lang === 'ar'
          ? `الحساب مقفل. المحاولة مرة أخرى خلال ${remainingTime} دقيقة`
          : `Account locked. Try again in ${remainingTime} minutes`
      );
      return;
    }

    try {
      // Validate password using secure method
      const isValid = await validateAdminPassword(password);

      if (isValid) {
        createAdminSession();
        setIsAuthenticated(true);
        setShowPasswordPrompt(false);

        logSecurityEvent('Successful admin login');
        toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Successfully logged in');
      } else {
        recordFailedAttempt();
        const attempts = getLoginAttempts();

        logSecurityEvent('Failed admin login attempt', { attempts });

        if (attempts >= maxAttempts) {
          toast.error(
            lang === 'ar'
              ? 'تم قفل الحساب بسبب المحاولات المتعددة'
              : 'Account locked due to multiple failed attempts'
          );
        } else {
          toast.error(
            lang === 'ar'
              ? `كلمة مرور خاطئة. المحاولات المتبقية: ${maxAttempts - attempts}`
              : `Invalid password. Attempts remaining: ${maxAttempts - attempts}`
          );
        }
      }
    } catch (error) {
      logSecurityEvent('Password validation error', error);
      toast.error(lang === 'ar' ? 'خطأ في التحقق من كلمة المرور' : 'Password validation error');
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    router.push(`/${lang}`);
    logSecurityEvent('Admin logout');
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out successfully');
  };

  const handlePasswordRecoverySuccess = (newPassword: string) => {
    setShowPasswordRecovery(false);
    setShowPasswordPrompt(true);
    toast.success(lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show password recovery if requested
  if (showPasswordRecovery) {
    return (
      <PasswordRecovery
        lang={lang}
        onBack={() => setShowPasswordRecovery(false)}
        onRecoverySuccess={handlePasswordRecoverySuccess}
      />
    );
  }

  // Show password prompt if triggered by URL hash
  if (showPasswordPrompt && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-900 dark:to-secondary-950 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl border border-gray-300 shadow-lg p-8 dark:bg-gray-800 dark:border-gray-600">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                <LockClosedIcon className="h-8 w-8 text-primary-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {lang === 'ar' ? 'دخول المدير' : 'Admin Access'}
              </h1>
              
              <p className="text-gray-500">
                {lang === 'ar'
                  ? 'أدخل كلمة مرور المدير للوصول إلى لوحة التحكم'
                  : 'Enter admin password to access the control panel'
                }
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                placeholder={lang === 'ar' ? 'كلمة مرور المدير' : 'Admin password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit(adminPassword)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                autoFocus
              />
              
              <Button
                onClick={() => handlePasswordSubmit(adminPassword)}
                className="w-full"
                disabled={!adminPassword}
              >
                {lang === 'ar' ? 'دخول' : 'Login'}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => router.push(`/${lang}`)}
                className="w-full"
              >
                {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowPasswordRecovery(true)}
                className="w-full text-primary-600 hover:text-primary-700"
              >
                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-info-50 dark:bg-info-950 border border-info-200 dark:border-info-800 rounded-lg">
              <div className="flex items-start space-x-2 rtl:space-x-reverse">
                <ExclamationTriangleIcon className="h-5 w-5 text-info-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-info-700 dark:text-info-300">
                  <p className="font-medium mb-1">
                    {lang === 'ar' ? 'ملاحظة أمنية:' : 'Security Notice:'}
                  </p>
                  <p className="text-xs">
                    {lang === 'ar'
                      ? 'هذه منطقة محمية. يتم تسجيل جميع محاولات الدخول.'
                      : 'This is a protected area. All access attempts are logged.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated and not a logged-in admin
  if (!isAuthenticated && !isAdmin) {
    return <AdminLogin lang={lang} onLogin={handlePasswordSubmit} />;
  }

  // Show admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-900 dark:to-secondary-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900">
                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {t('admin.title')}
                </h1>
                <p className="text-gray-500">
                  {lang === 'ar' ? 'إدارة نظام اختبارات الألوان' : 'Color Testing System Management'}
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={handleLogout}>
              {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* Admin Dashboard */}
        <AdminDashboardWrapper lang={lang} />
      </div>
    </div>
  );
}
