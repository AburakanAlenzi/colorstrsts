'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GlobalImageAnalyzer } from '@/components/ui/global-image-analyzer';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  Cog6ToothIcon,
  PowerIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { TestTubeIcon } from '@/components/ui/icons/TestTubeIcon';

interface HeaderProps {
  lang: Language;
}

export function Header({ lang }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminKeySequence, setAdminKeySequence] = useState('');
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const t = getTranslationsSync(lang);

  // Secure admin access detection (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Only enable in development mode with specific key combination
      if (event.ctrlKey && event.shiftKey && event.altKey && event.key === 'A') {
        router.push(`/${lang}/admin#secure-admin-access`);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lang, router]);

  // Secure logo interaction (development only)
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimer, setLogoClickTimer] = useState<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    // Only enable special access in development mode
    if (process.env.NODE_ENV !== 'development') return;

    setLogoClickCount(prev => prev + 1);

    if (logoClickTimer) {
      clearTimeout(logoClickTimer);
    }

    const timer = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);

    setLogoClickTimer(timer);

    // Require 5 clicks instead of 3 for better security
    if (logoClickCount >= 4) {
      router.push(`/${lang}/admin#secure-admin-access`);
      setLogoClickCount(0);
    }
  };

  const navigation = [
    { name: t('navigation.home'), href: `/${lang}` },
    { name: t('navigation.tests'), href: `/${lang}/tests` },
    { name: t('navigation.results'), href: `/${lang}/results` },
    { name: t('navigation.contact'), href: `/${lang}/contact` },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    try {
      await logout();
      router.push(`/${lang}`);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href={`/${lang}`}
              className="flex items-center space-x-2 rtl:space-x-reverse hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                // Handle both logo click and navigation
                handleLogoClick();
                console.log('Logo clicked, navigating to home:', `/${lang}`);
                router.push(`/${lang}`);
              }}
            >
              <TestTubeIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-foreground">
                {lang === 'ar' ? 'اختبارات الألوان' : 'Color Testing'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary-600 cursor-pointer ${
                  isActive(item.href)
                    ? 'text-primary-600'
                    : 'text-muted-foreground'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Desktop navigation clicked:', item.href, 'Current path:', pathname);
                  router.push(item.href);
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Image Color Analysis Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImageAnalyzer(true)}
              className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-primary-950"
            >
              <PhotoIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t('navigation.image_analysis_short')}
              </span>
            </Button>

            <LanguageSwitcher currentLang={lang} />
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {/* عرض اسم المستخدم */}
                <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full">
                  <div className="w-6 h-6 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                    <UserIcon className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {user.displayName || user.email?.split('@')[0] || t('navigation.user')}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/${lang}/profile`}>
                    <span className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {t('navigation.profile')}
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/${lang}/dashboard`}>
                    <span className="flex items-center">
                      <Cog6ToothIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <PowerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('navigation.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/${lang}/auth/login`}>
                    {t('navigation.login')}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                >
                  <Link href={`/${lang}/auth/register`}>
                    {t('navigation.register')}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-300 dark:border-gray-600">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors cursor-pointer ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-950'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Mobile navigation clicked:', item.href, 'Current path:', pathname);
                    setIsMenuOpen(false);
                    router.push(item.href);
                  }}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Image Analysis Button */}
              <button
                onClick={() => {
                  setShowImageAnalyzer(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 text-base font-medium rounded-md transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
              >
                <span className="flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-3 rtl:ml-3 rtl:mr-0" />
                  {t('navigation.image_analysis')}
                </span>
              </button>
              
              {/* قسم المستخدم */}
              <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                {user ? (
                  <>
                    {/* عرض اسم المستخدم في الموبايل */}
                    <div className="px-3 py-2 mb-2">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-lg">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            {user.displayName || user.email?.split('@')[0] || t('navigation.user')}
                          </p>
                          <p className="text-xs text-primary-500 dark:text-primary-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/${lang}/profile`}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserIcon className="h-5 w-5 mr-3 rtl:ml-3 rtl:mr-0" />
                      {t('navigation.profile')}
                    </Link>

                    <Link
                      href={`/${lang}/dashboard`}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="h-5 w-5 mr-3 rtl:ml-3 rtl:mr-0" />
                      {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                    </Link>

                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <PowerIcon className="h-5 w-5 mr-3 rtl:ml-3 rtl:mr-0" />
                      {t('navigation.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${lang}/auth/login`}
                      className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('navigation.login')}
                    </Link>
                    <Link
                      href={`/${lang}/auth/register`}
                      className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('navigation.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Image Color Analyzer Modal */}
      <GlobalImageAnalyzer
        isOpen={showImageAnalyzer}
        onClose={() => setShowImageAnalyzer(false)}
        onColorSelected={(color) => {
          console.log('Color selected from header:', color);
          // You can add additional logic here if needed
          // For example, save to localStorage or show a notification
          alert(`${lang === 'ar' ? 'تم اختيار اللون:' : 'Color selected:'} ${color}`);
        }}
        lang={lang}
      />
    </header>
  );
}
