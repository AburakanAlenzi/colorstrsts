'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { EmergencyAccess } from './EmergencyAccess';

interface AdminLoginProps {
  lang: Language;
  onLogin: (password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function AdminLogin({ lang, onLogin, isLoading = false, error }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const t = getTranslationsSync(lang);

  useEffect(() => {
    // Check for existing lockout
    const lockoutTimestamp = localStorage.getItem('ct_lockout_time');
    const loginAttempts = localStorage.getItem('ct_login_attempts');
    
    if (lockoutTimestamp) {
      const lockoutEnd = parseInt(lockoutTimestamp);
      const now = Date.now();
      
      if (now < lockoutEnd) {
        setIsLocked(true);
        setLockoutTime(Math.ceil((lockoutEnd - now) / 60000)); // Minutes remaining
        
        const timer = setInterval(() => {
          const remaining = Math.ceil((lockoutEnd - Date.now()) / 60000);
          if (remaining <= 0) {
            setIsLocked(false);
            setLockoutTime(0);
            localStorage.removeItem('ct_lockout_time');
            localStorage.removeItem('ct_login_attempts');
            clearInterval(timer);
          } else {
            setLockoutTime(remaining);
          }
        }, 1000);
        
        return () => clearInterval(timer);
      } else {
        // Lockout expired
        localStorage.removeItem('ct_lockout_time');
        localStorage.removeItem('ct_login_attempts');
      }
    }
    
    if (loginAttempts) {
      setAttempts(parseInt(loginAttempts));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked || isLoading || !password.trim()) return;
    
    try {
      await onLogin(password);
      // Clear attempts on successful login
      localStorage.removeItem('ct_login_attempts');
      localStorage.removeItem('ct_lockout_time');
      setAttempts(0);
    } catch (error) {
      // Handle failed login
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('ct_login_attempts', newAttempts.toString());
      
      const maxAttempts = parseInt(process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || '5');
      
      if (newAttempts >= maxAttempts) {
        const lockoutDuration = parseInt(process.env.NEXT_PUBLIC_LOCKOUT_DURATION || '900000'); // 15 minutes
        const lockoutEnd = Date.now() + lockoutDuration;
        localStorage.setItem('ct_lockout_time', lockoutEnd.toString());
        setIsLocked(true);
        setLockoutTime(Math.ceil(lockoutDuration / 60000));
      }
      
      setPassword('');
    }
  };

  const maxAttempts = parseInt(process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || '5');
  const remainingAttempts = Math.max(0, maxAttempts - attempts);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {lang === 'ar' ? 'دخول المدير' : 'Admin Login'}
          </h1>
          <p className="text-gray-500">
            {lang === 'ar'
              ? 'أدخل كلمة المرور للوصول إلى لوحة التحكم'
              : 'Enter your password to access the admin panel'
            }
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 dark:bg-gray-800 dark:border-gray-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked || isLoading}
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                  className="w-full px-3 py-2 pr-10 rtl:pl-10 rtl:pr-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked || isLoading}
                  className="absolute inset-y-0 right-0 rtl:left-0 rtl:right-auto flex items-center pr-3 rtl:pl-3 rtl:pr-0 text-gray-500 hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-2 rtl:space-x-reverse p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* Lockout Warning */}
            {isLocked && (
              <div className="flex items-start space-x-2 rtl:space-x-reverse p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <ClockIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium mb-1">
                    {lang === 'ar' ? 'الحساب مقفل مؤقتاً' : 'Account Temporarily Locked'}
                  </p>
                  <p>
                    {lang === 'ar' 
                      ? `يرجى المحاولة مرة أخرى خلال ${lockoutTime} دقيقة`
                      : `Please try again in ${lockoutTime} minute${lockoutTime !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Attempts Warning */}
            {!isLocked && attempts > 0 && remainingAttempts > 0 && (
              <div className="flex items-start space-x-2 rtl:space-x-reverse p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {lang === 'ar' 
                    ? `محاولات متبقية: ${remainingAttempts}`
                    : `Remaining attempts: ${remainingAttempts}`
                  }
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLocked || isLoading || !password.trim()}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <LockClosedIcon className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'دخول' : 'Login'}</span>
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2 rtl:space-x-reverse">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">
                  {lang === 'ar' ? 'ملاحظة أمنية:' : 'Security Notice:'}
                </p>
                <ul className="text-xs space-y-1">
                  <li>
                    {lang === 'ar' 
                      ? `• الحد الأقصى للمحاولات: ${maxAttempts}`
                      : `• Maximum attempts: ${maxAttempts}`
                    }
                  </li>
                  <li>
                    {lang === 'ar' 
                      ? '• مدة القفل: 15 دقيقة'
                      : '• Lockout duration: 15 minutes'
                    }
                  </li>
                  <li>
                    {lang === 'ar' 
                      ? '• يتم تسجيل جميع محاولات الدخول'
                      : '• All login attempts are logged'
                    }
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            {lang === 'ar'
              ? 'تطبيق اختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية - الإصدار 2.0'
              : 'Color Testing for Drug and Psychoactive Substance Detection - Version 2.0'
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            © 2025 {lang === 'ar' ? 'محمد نفاع الرويلي & يوسف مسير العنزي' : 'Mohammed Nafa Al-Ruwaili & Youssef Musayyir Al-Anzi'}
          </p>
        </div>
      </div>
    </div>
  );
}
