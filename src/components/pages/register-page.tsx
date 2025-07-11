'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { 
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface RegisterPageProps {
  lang: Language;
}

export function RegisterPage({ lang }: RegisterPageProps) {
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
      // Validate form
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

      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(lang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully');
      router.push(`/${lang}/auth/login`);
    } catch (error) {
      toast.error(lang === 'ar' ? 'خطأ في إنشاء الحساب' : 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-900 dark:to-secondary-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
            <UserPlusIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {lang === 'ar' ? 'أدخل بياناتك لإنشاء حساب جديد' : 'Enter your details to create a new account'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              />
            </div>

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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                  required
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
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {loading 
                ? (lang === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...') 
                : (lang === 'ar' ? 'إنشاء حساب' : 'Create Account')
              }
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <Link
                href={`/${lang}/auth/login`}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link
              href={`/${lang}`}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {lang === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Back to home'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
