'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import GoogleSignInButtonRedirect from '@/components/auth/GoogleSignInButtonRedirect';
import { FirebaseDebug } from '@/components/debug/FirebaseDebug';
import { AuthTest } from '@/components/debug/AuthTest';
import { GoogleSignInTest } from '@/components/debug/GoogleSignInTest';
import { GoogleSignInDiagnostic } from '@/components/debug/GoogleSignInDiagnostic';
import { EmailTest } from '@/components/debug/EmailTest';
import {
  UserIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AuthPageProps {
  lang: Language;
}

export function AuthPage({ lang }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const t = getTranslationsSync(lang);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        if (!formData.email || !formData.password) {
          toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
          return;
        }

        await signIn(formData.email, formData.password);
        toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
        router.push(`/${lang}`);
      } else {
        // Registration logic
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
          return;
        }

        if (formData.password.length < 6) {
          toast.error(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
          return;
        }

        await signUp(formData.email, formData.password, formData.name);
        toast.success(lang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully');
        router.push(`/${lang}`);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error?.message || (isLogin ? 'Login error' : 'Registration error');
      toast.error(lang === 'ar' ?
        (isLogin ? 'خطأ في تسجيل الدخول' : 'خطأ في إنشاء الحساب') :
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
      router.push(`/${lang}`);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(lang === 'ar' ? 'خطأ في تسجيل الدخول بـ Google' : 'Google sign in error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-900 dark:to-secondary-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
            {isLogin ? (
              <UserIcon className="h-8 w-8 text-primary-600" />
            ) : (
              <UserPlusIcon className="h-8 w-8 text-primary-600" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isLogin
              ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')
              : (lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account')
            }
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isLogin
              ? (lang === 'ar' ? 'أدخل بياناتك للوصول إلى حسابك' : 'Enter your credentials to access your account')
              : (lang === 'ar' ? 'أدخل بياناتك لإنشاء حساب جديد' : 'Enter your details to create a new account')
            }
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              isLogin
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              !isLogin
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name field for registration */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password field for registration */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {loading
                ? (isLogin
                    ? (lang === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...')
                    : (lang === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...')
                  )
                : (isLogin
                    ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                    : (lang === 'ar' ? 'إنشاء حساب' : 'Create Account')
                  )
              }
            </Button>
          </div>

          {/* Google Sign In */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                {lang === 'ar' ? 'أو' : 'Or'}
              </span>
            </div>
          </div>

          {/* Google Sign-In with Popup */}
          <GoogleSignInButton
            onSuccess={() => {
              toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
              router.push(`/${lang}`);
            }}
            onError={(error) => {
              toast.error(error);
              console.error('Google sign in error:', error);
            }}
            disabled={loading}
            className="w-full border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 px-4 py-2 mb-2"
          >
            {lang === 'ar' ? 'تسجيل الدخول بـ Google (نافذة منبثقة)' : 'Continue with Google (Popup)'}
          </GoogleSignInButton>

          {/* Google Sign-In with Redirect (Fallback) */}
          <GoogleSignInButtonRedirect
            onError={(error) => {
              toast.error(error);
              console.error('Google sign in redirect error:', error);
            }}
            disabled={loading}
            className="w-full border border-gray-300 rounded-md shadow-sm bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 px-4 py-2"
          >
            {lang === 'ar' ? 'تسجيل الدخول بـ Google (إعادة توجيه)' : 'Continue with Google (Redirect)'}
          </GoogleSignInButtonRedirect>
        </form>
      </div>

      {/* Debug Components (Development Only) */}
      <FirebaseDebug />
      <AuthTest />
      <GoogleSignInTest />
      <GoogleSignInDiagnostic />
      <EmailTest />
    </div>
  );
}
