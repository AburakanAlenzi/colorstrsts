'use client';

import { Language } from '@/types';
import { ChemicalTest } from '@/lib/data-service';
import { getTranslationsSync } from '@/lib/translations';
import {
  BeakerIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface TestCardProps {
  test: ChemicalTest;
  lang: Language;
  onClick: (testId: string) => void;
  disabled?: boolean;
}

export function TestCard({ test, lang, onClick, disabled = false }: TestCardProps) {
  const t = getTranslationsSync(lang);

  const getSafetyLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return ShieldCheckIcon;
      case 'medium': return ShieldCheckIcon;
      case 'high': return ShieldExclamationIcon;
      case 'extreme': return ExclamationTriangleIcon;
      case 'undefined':
      case 'unknown':
      case null:
      case undefined:
        return QuestionMarkCircleIcon;
      default: return ShieldCheckIcon;
    }
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
      case 'extreme': return 'text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'undefined':
      case 'unknown':
      case null:
      case undefined:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
      case 'advanced': return 'text-purple-600 bg-purple-50 dark:bg-purple-950';
      case 'specialized': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950';
      case 'undefined':
      case 'unknown':
      case null:
      case undefined:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  const testName = lang === 'ar' ? test.method_name_ar : test.method_name;
  const testDescription = lang === 'ar' ? test.description_ar : test.description;

  // Handle undefined/null values with fallbacks
  const categoryKey = test.category || 'undefined';
  const safetyLevelKey = test.safety_level || 'undefined';

  const categoryLabel = t(`tests.categories.${categoryKey}`);
  const safetyLabel = t(`tests.safety_levels.${safetyLevelKey}`);

  const SafetyIcon = getSafetyLevelIcon(safetyLevelKey);

  return (
    <div
      className={`group relative bg-background rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:scale-[1.02] hover:border-primary-200 dark:hover:border-primary-800'
      }`}
      onClick={() => !disabled && onClick(test.id)}
    >
      {/* Header with color accent */}
      <div 
        className="h-2 w-full"
        style={{ backgroundColor: test.color_primary }}
      />

      <div className="p-6">
        {/* Test Icon and Category */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${test.color_primary}20` }}
            >
              <BeakerIcon 
                className="h-6 w-6"
                style={{ color: test.color_primary }}
              />
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(categoryKey)}`}>
                {categoryLabel}
              </span>
            </div>
          </div>

          {/* Safety Level Indicator */}
          <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getSafetyLevelColor(safetyLevelKey)}`}>
            <SafetyIcon className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
            {safetyLabel}
          </div>
        </div>

        {/* Test Name */}
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
          {testName}
        </h3>

        {/* Test Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {testDescription}
        </p>

        {/* Preparation Time */}
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <ClockIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
          <span>
            {test.preparation_time} {t('tests.minutes')} - {t('tests.preparation_time')}
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {lang === 'ar' ? 'انقر للبدء' : 'Click to start'}
          </div>
          
          <div className="flex items-center text-primary-600 group-hover:text-primary-700 transition-colors">
            <span className="text-sm font-medium mr-2 rtl:ml-2 rtl:mr-0">
              {t('tests.select_test')}
            </span>
            <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Click Ripple Effect */}
      <div className="absolute inset-0 bg-primary-500/10 scale-0 group-active:scale-100 transition-transform duration-150 rounded-xl pointer-events-none" />
    </div>
  );
}
