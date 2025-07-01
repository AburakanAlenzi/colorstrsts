'use client';

import Link from 'next/link';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { BeakerIcon, HeartIcon } from '@heroicons/react/24/outline';

interface FooterProps {
  lang: Language;
}

export function Footer({ lang }: FooterProps) {
  const t = getTranslationsSync(lang);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <BeakerIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-foreground">
                {lang === 'ar' ? 'اختبارات الألوان' : 'Color Testing'}
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t('home.description')}
            </p>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <span className="text-sm text-muted-foreground">
                {t('footer.version')}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {t('navigation.home')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${lang}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/tests`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('navigation.tests')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/results`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('navigation.results')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {lang === 'ar' ? 'الدعم' : 'Support'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${lang}/help`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'ar' ? 'المساعدة' : 'Help'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/safety`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'ar' ? 'إرشادات السلامة' : 'Safety Guidelines'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/contact`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              {lang === 'ar' ? 'جميع الحقوق محفوظة © 2025' : 'All rights reserved © 2025'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {lang === 'ar' ? 'تم تطويره من قبل' : 'Developed by'}
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6 rtl:md:space-x-reverse">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <a
                  href="https://orcid.org/0009-0009-7108-1147"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                >
                  {t('footer.developer1')}
                </a>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('footer.developer2')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
