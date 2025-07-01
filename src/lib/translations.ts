import { Language, Locale } from '@/types';
import { translate } from '@/lib/i18n';

// Import translation files
import arTranslations from '@/locales/ar.json';
import enTranslations from '@/locales/en.json';

const translations: Record<Language, Locale> = {
  ar: arTranslations,
  en: enTranslations,
};

// Get translations for a specific language
export async function getTranslations(language: Language) {
  const locale = translations[language];
  const fallbackLocale = translations.en; // English as fallback
  
  return (key: string, params?: Record<string, string | number>) => {
    let translatedText = translate(key, locale, fallbackLocale);
    
    // Handle parameter substitution
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translatedText = translatedText.replace(
          new RegExp(`{{${paramKey}}}`, 'g'),
          String(paramValue)
        );
      });
    }
    
    return translatedText;
  };
}

// Get translations synchronously (for client components)
export function getTranslationsSync(language: Language) {
  const locale = translations[language];
  const fallbackLocale = translations.en;
  
  return (key: string, params?: Record<string, string | number>) => {
    let translatedText = translate(key, locale, fallbackLocale);
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translatedText = translatedText.replace(
          new RegExp(`{{${paramKey}}}`, 'g'),
          String(paramValue)
        );
      });
    }
    
    return translatedText;
  };
}

// Get all translations for a language (useful for client-side)
export function getAllTranslations(language: Language): Locale {
  return translations[language] || translations.en;
}

// Check if a translation key exists
export function hasTranslation(language: Language, key: string): boolean {
  const locale = translations[language];
  const keys = key.split('.');
  let value: any = locale;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return false;
    }
  }
  
  return typeof value === 'string';
}

// Get nested translation object
export function getTranslationObject(language: Language, key: string): Locale | null {
  const locale = translations[language];
  const keys = key.split('.');
  let value: any = locale;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return null;
    }
  }
  
  return typeof value === 'object' ? value : null;
}

// Get all test names with translations
export function getTestNames(language: Language) {
  const testNames = getTranslationObject(language, 'tests.test_names');
  return testNames || {};
}

// Get all test descriptions with translations
export function getTestDescriptions(language: Language) {
  const testDescriptions = getTranslationObject(language, 'tests.test_descriptions');
  return testDescriptions || {};
}

// Get all color names with translations
export function getColorNames(language: Language) {
  const colorNames = getTranslationObject(language, 'colors');
  return colorNames || {};
}

// Get all substance names with translations
export function getSubstanceNames(language: Language) {
  const substanceNames = getTranslationObject(language, 'substances');
  return substanceNames || {};
}

// Helper function to get localized test name by key
export function getLocalizedTestName(testKey: string, language: Language): string {
  const testNames = getTestNames(language);
  return testNames[testKey] || testKey;
}

// Helper function to get localized color name by key
export function getLocalizedColorName(colorKey: string, language: Language): string {
  const colorNames = getColorNames(language);
  return colorNames[colorKey] || colorKey;
}

// Helper function to get localized substance name by key
export function getLocalizedSubstanceName(substanceKey: string, language: Language): string {
  const substanceNames = getSubstanceNames(language);
  return substanceNames[substanceKey] || substanceKey;
}

// Export translation keys for type safety
export const TRANSLATION_KEYS = {
  COMMON: {
    LOADING: 'common.loading',
    ERROR: 'common.error',
    SUCCESS: 'common.success',
    CANCEL: 'common.cancel',
    CONFIRM: 'common.confirm',
    SAVE: 'common.save',
    EDIT: 'common.edit',
    DELETE: 'common.delete',
    ADD: 'common.add',
    SEARCH: 'common.search',
    NEXT: 'common.next',
    PREVIOUS: 'common.previous',
    CLOSE: 'common.close',
    BACK: 'common.back',
    HOME: 'common.home',
  },
  NAVIGATION: {
    HOME: 'navigation.home',
    TESTS: 'navigation.tests',
    RESULTS: 'navigation.results',
    ADMIN: 'navigation.admin',
    PROFILE: 'navigation.profile',
    SETTINGS: 'navigation.settings',
    LOGOUT: 'navigation.logout',
    LOGIN: 'navigation.login',
    REGISTER: 'navigation.register',
  },
  HOME: {
    TITLE: 'home.title',
    SUBTITLE: 'home.subtitle',
    DESCRIPTION: 'home.description',
    GET_STARTED: 'home.get_started',
  },
  TESTS: {
    TITLE: 'tests.title',
    SUBTITLE: 'tests.subtitle',
    SELECT_TEST: 'tests.select_test',
    PREPARATION_TIME: 'tests.preparation_time',
    MINUTES: 'tests.minutes',
  },
  TEST_PROCESS: {
    STEP1: 'test_process.step_titles.step1',
    STEP2: 'test_process.step_titles.step2',
    STEP3: 'test_process.step_titles.step3',
    STEP4: 'test_process.step_titles.step4',
  },
  ADMIN: {
    TITLE: 'admin.title',
    DASHBOARD: 'admin.dashboard',
  },
  AUTH: {
    LOGIN_TITLE: 'auth.login.title',
    REGISTER_TITLE: 'auth.register.title',
    EMAIL: 'auth.login.email',
    PASSWORD: 'auth.login.password',
  },
  NOTIFICATIONS: {
    TEST_COMPLETED: 'notifications.test_completed',
    RESULT_SAVED: 'notifications.result_saved',
    LOGIN_SUCCESS: 'notifications.login_success',
    ERROR_OCCURRED: 'notifications.error_occurred',
  },
} as const;
