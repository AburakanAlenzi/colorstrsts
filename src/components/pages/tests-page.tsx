'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { getChemicalTests, ChemicalTest } from '@/lib/firebase-realtime';
import { Button } from '@/components/ui/button';
import { TestCard } from '@/components/ui/test-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TestAccessGuard } from '@/components/subscription/TestAccessGuard';
import { AuthProvider } from '@/components/auth/AuthProvider';
import {
  BeakerIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LockClosedIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface TestsPageProps {
  lang: Language;
}

function TestsPageContent({ lang }: TestsPageProps) {
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSafetyLevel, setSelectedSafetyLevel] = useState<string>('all');

  const router = useRouter();
  const t = getTranslationsSync(lang);
  const isRTL = lang === 'ar';

  useEffect(() => {
    // Load tests from Firebase Realtime Database
    const loadTests = async () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const chemicalTests = await getChemicalTests();
        console.log('🔥 Loaded chemical tests from Firebase Realtime Database');
        setTests(chemicalTests);
        setFilteredTests(chemicalTests);
      } catch (error) {
        console.error('Error loading tests from Firebase:', error);
        // Fallback to empty array
        setTests([]);
        setFilteredTests([]);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    // Filter tests based on search and filters
    let filtered = tests;

    // Search filter
    if (searchQuery) {
      filtered = DataService.searchTests(searchQuery, lang);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    // Safety level filter
    if (selectedSafetyLevel !== 'all') {
      filtered = filtered.filter(test => test.safety_level === selectedSafetyLevel);
    }

    setFilteredTests(filtered);
  }, [tests, searchQuery, selectedCategory, selectedSafetyLevel, lang]);

  const categories = [
    { value: 'all', label: lang === 'ar' ? 'جميع الفئات' : 'All Categories' },
    { value: 'basic', label: t('tests.categories.basic') },
    { value: 'advanced', label: t('tests.categories.advanced') },
    { value: 'specialized', label: t('tests.categories.specialized') },
  ];

  const safetyLevels = [
    { value: 'all', label: lang === 'ar' ? 'جميع المستويات' : 'All Levels' },
    { value: 'low', label: t('tests.safety_levels.low') },
    { value: 'medium', label: t('tests.safety_levels.medium') },
    { value: 'high', label: t('tests.safety_levels.high') },
    { value: 'extreme', label: t('tests.safety_levels.extreme') },
  ];

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
      case 'extreme': return 'text-red-600 bg-red-50 dark:bg-red-950';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6">
            <BeakerIcon className="h-8 w-8 text-primary-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('tests.title')}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('tests.subtitle')}
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-primary-600">{tests.length}</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'اختبار متاح' : 'Available Tests'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-secondary-600">46</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'نتيجة لونية' : 'Color Results'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-success-600">2</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'لغة مدعومة' : 'Languages'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-warning-600">100%</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'دقة علمية' : 'Accuracy'}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={lang === 'ar' ? 'البحث في الاختبارات...' : 'Search tests...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <FunnelIcon className="h-5 w-5 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ExclamationTriangleIcon className="h-5 w-5 text-muted-foreground" />
              <select
                value={selectedSafetyLevel}
                onChange={(e) => setSelectedSafetyLevel(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                {safetyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <BeakerIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {lang === 'ar' ? 'لا توجد اختبارات' : 'No tests found'}
            </h3>
            <p className="text-muted-foreground">
              {lang === 'ar' 
                ? 'جرب تغيير معايير البحث أو الفلترة'
                : 'Try changing your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTests.map((test, index) => {
              const isFreeTest = index < 5;

              return (
                <div key={test.id} className="relative">
                  <TestAccessGuard
                    testIndex={index}
                    testId={test.id}
                    testName={lang === 'ar' ? test.method_name_ar : test.method_name}
                    onAccessGranted={() => {
                      console.log('Test access granted, navigating to:', `/${lang}/tests/${test.id}`);
                      router.push(`/${lang}/tests/${test.id}`);
                    }}
                  >
                    <div className="relative">
                      {/* Free/Premium Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        {isFreeTest ? (
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <StarIcon className="w-3 h-3 mr-1" />
                            {lang === 'ar' ? 'مجاني' : 'Free'}
                          </div>
                        ) : (
                          <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <LockClosedIcon className="w-3 h-3 mr-1" />
                            {lang === 'ar' ? 'مميز' : 'Premium'}
                          </div>
                        )}
                      </div>

                      <TestCard
                        test={test}
                        lang={lang}
                        onClick={(testId) => {
                          // This will be handled by TestAccessGuard
                          console.log('Test card clicked:', testId);
                        }}
                      />
                    </div>
                  </TestAccessGuard>
                </div>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
}

export function TestsPage({ lang }: TestsPageProps) {
  return (
    <AuthProvider>
      <TestsPageContent lang={lang} />
    </AuthProvider>
  );
}
