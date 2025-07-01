import { Language, Locale, I18nConfig } from '@/types';

// Internationalization configuration
export const i18nConfig: I18nConfig = {
  defaultLanguage: 'ar',
  supportedLanguages: ['ar', 'en'],
  fallbackLanguage: 'en',
};

// Language detection from browser
export const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return i18nConfig.defaultLanguage;
  }
  
  const browserLang = navigator.language.split('-')[0] as Language;
  return i18nConfig.supportedLanguages.includes(browserLang) 
    ? browserLang 
    : i18nConfig.defaultLanguage;
};

// Get text direction based on language
export const getTextDirection = (language: Language): 'rtl' | 'ltr' => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

// Get font family based on language
export const getFontFamily = (language: Language): string => {
  return language === 'ar' 
    ? 'font-arabic' 
    : 'font-english';
};

// Translation helper function
export const translate = (
  key: string, 
  locale: Locale, 
  fallbackLocale?: Locale
): string => {
  const keys = key.split('.');
  let value: any = locale;
  
  // Navigate through nested keys
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Try fallback locale if available
      if (fallbackLocale) {
        let fallbackValue: any = fallbackLocale;
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            fallbackValue = null;
            break;
          }
        }
        if (fallbackValue && typeof fallbackValue === 'string') {
          return fallbackValue;
        }
      }
      
      // Return key if translation not found
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
};

// Format numbers based on language
export const formatNumber = (
  number: number, 
  language: Language,
  options?: Intl.NumberFormatOptions
): string => {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale, options).format(number);
};

// Format dates based on language
export const formatDate = (
  date: Date | string, 
  language: Language,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
};

// Format time based on language
export const formatTime = (
  date: Date | string, 
  language: Language,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
};

// Get localized test name
export const getLocalizedTestName = (
  testNameEn: string,
  testNameAr: string,
  language: Language
): string => {
  return language === 'ar' ? testNameAr : testNameEn;
};

// Get localized color description
export const getLocalizedColorDescription = (
  colorEn: string,
  colorAr: string,
  language: Language
): string => {
  return language === 'ar' ? colorAr : colorEn;
};

// Get localized substance name
export const getLocalizedSubstanceName = (
  substanceEn: string,
  substanceAr: string,
  language: Language
): string => {
  return language === 'ar' ? substanceAr : substanceEn;
};

// Pluralization helper for Arabic
export const pluralize = (
  count: number,
  singular: string,
  plural: string,
  language: Language
): string => {
  if (language === 'ar') {
    // Arabic pluralization rules (simplified)
    if (count === 0) return `لا ${plural}`;
    if (count === 1) return singular;
    if (count === 2) return `${singular}ان`; // dual form
    if (count >= 3 && count <= 10) return `${count} ${plural}`;
    return `${count} ${singular}`;
  } else {
    // English pluralization
    return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
  }
};

// Currency formatting
export const formatCurrency = (
  amount: number,
  language: Language,
  currency: string = 'SAR'
): string => {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Percentage formatting
export const formatPercentage = (
  value: number,
  language: Language,
  decimals: number = 1
): string => {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

// Relative time formatting
export const formatRelativeTime = (
  date: Date | string,
  language: Language
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
};

// Validate language parameter
export const isValidLanguage = (lang: string): lang is Language => {
  return i18nConfig.supportedLanguages.includes(lang as Language);
};

// Get opposite language
export const getOppositeLanguage = (language: Language): Language => {
  return language === 'ar' ? 'en' : 'ar';
};

// Generate language-specific URLs
export const generateLocalizedUrl = (
  path: string,
  language: Language,
  baseUrl?: string
): string => {
  const base = baseUrl || '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${language}/${cleanPath}`;
};

// Extract language from URL
export const extractLanguageFromUrl = (url: string): Language | null => {
  const match = url.match(/\/([a-z]{2})\//);
  if (match && isValidLanguage(match[1])) {
    return match[1] as Language;
  }
  return null;
};
