/**
 * Local Data Service using JSON file and localStorage
 * خدمة البيانات المحلية باستخدام ملف JSON و localStorage
 */

import localDatabase from '@/data/Databsecolorstest.json';

// Types based on the JSON structure
export interface ColorResult {
  color_result: string;
  color_result_ar: string;
  color_hex: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: string;
}

export interface Instruction {
  step_number: number;
  instruction: string;
  instruction_ar: string;
  safety_warning: string;
  safety_warning_ar: string;
  icon: string;
}

export interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  description: string;
  description_ar: string;
  category: string;
  safety_level: string;
  preparation_time: number;
  icon: string;
  color_primary: string;
  created_at: string;
  prepare: string;
  prepare_ar: string;
  test_type: string;
  test_number: string;
  reference: string;
  instructions?: Instruction[];
  color_results?: ColorResult[];
  // Additional fields for compatibility
  color_result?: string;
  color_result_ar?: string;
  possible_substance?: string;
  possible_substance_ar?: string;
  reagents?: string[];
  expected_time?: string;
}

export interface LocalDatabase {
  chemical_tests: ChemicalTest[];
}

// Storage keys
const STORAGE_KEYS = {
  CHEMICAL_TESTS: 'chemical_tests_local',
  LAST_UPDATED: 'chemical_tests_last_updated',
  USER_PREFERENCES: 'user_preferences',
  TEST_RESULTS: 'test_results',
  SUBSCRIPTION_SETTINGS: 'subscription_settings_local'
} as const;

/**
 * Initialize local storage with data from JSON file
 * تهيئة التخزين المحلي بالبيانات من ملف JSON
 */
export function initializeLocalStorage(): void {
  try {
    console.log('🔄 Initializing local storage with JSON data...');
    
    // Check if data already exists
    const existingData = localStorage.getItem(STORAGE_KEYS.CHEMICAL_TESTS);
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
    
    // If no data exists or data is old, load from JSON
    if (!existingData || !lastUpdated) {
      console.log('📥 Loading fresh data from JSON file...');
      
      // Process and enhance the data
      const processedTests = localDatabase.chemical_tests.map(test => ({
        ...test,
        // Add compatibility fields
        color_result: test.color_results?.[0]?.color_result || 'Variable',
        color_result_ar: test.color_results?.[0]?.color_result_ar || 'متغير',
        possible_substance: test.color_results?.[0]?.possible_substance || 'Various substances',
        possible_substance_ar: test.color_results?.[0]?.possible_substance_ar || 'مواد متنوعة',
        reagents: extractReagents(test.prepare),
        expected_time: `${test.preparation_time || 5} minutes`
      }));
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.CHEMICAL_TESTS, JSON.stringify(processedTests));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
      
      console.log(`✅ Loaded ${processedTests.length} tests to localStorage`);
    } else {
      console.log('✅ Local storage already initialized');
    }
    
    // Initialize default subscription settings
    initializeSubscriptionSettings();
    
  } catch (error) {
    console.error('❌ Error initializing local storage:', error);
  }
}

/**
 * Extract reagents from preparation text
 * استخراج الكواشف من نص التحضير
 */
function extractReagents(prepareText: string): string[] {
  const reagents: string[] = [];
  
  // Common reagent patterns
  const reagentPatterns = [
    /reagent\s+\w+/gi,
    /acid/gi,
    /sulfuric/gi,
    /nitric/gi,
    /hydrochloric/gi,
    /formaldehyde/gi,
    /sodium/gi,
    /potassium/gi
  ];
  
  reagentPatterns.forEach(pattern => {
    const matches = prepareText.match(pattern);
    if (matches) {
      reagents.push(...matches);
    }
  });
  
  // Remove duplicates and return
  return [...new Set(reagents)].slice(0, 3); // Limit to 3 reagents
}

/**
 * Initialize default subscription settings
 * تهيئة إعدادات الاشتراك الافتراضية
 */
function initializeSubscriptionSettings(): void {
  const existingSettings = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_SETTINGS);
  
  if (!existingSettings) {
    const defaultSettings = {
      freeTestsEnabled: true,
      freeTestsCount: 5,
      premiumRequired: false,
      globalFreeAccess: true, // Enable free access by default
      specificPremiumTests: []
    };
    
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_SETTINGS, JSON.stringify(defaultSettings));
    console.log('✅ Default subscription settings initialized');
  }
}

/**
 * Get all chemical tests from localStorage
 * الحصول على جميع الاختبارات الكيميائية من localStorage
 */
export function getChemicalTestsLocal(): ChemicalTest[] {
  try {
    // Ensure localStorage is initialized
    if (typeof window === 'undefined') {
      return localDatabase.chemical_tests as ChemicalTest[];
    }
    
    initializeLocalStorage();
    
    const data = localStorage.getItem(STORAGE_KEYS.CHEMICAL_TESTS);
    if (data) {
      const tests = JSON.parse(data) as ChemicalTest[];
      console.log(`📊 Loaded ${tests.length} tests from localStorage`);
      return tests;
    }
    
    // Fallback to JSON data
    console.log('📥 Fallback to JSON data');
    return localDatabase.chemical_tests as ChemicalTest[];
    
  } catch (error) {
    console.error('❌ Error loading tests from localStorage:', error);
    return localDatabase.chemical_tests as ChemicalTest[];
  }
}

/**
 * Get a specific test by ID
 * الحصول على اختبار محدد بالمعرف
 */
export function getTestById(testId: string): ChemicalTest | null {
  try {
    const tests = getChemicalTestsLocal();
    const test = tests.find(t => t.id === testId);
    
    if (test) {
      console.log(`🔍 Found test: ${test.method_name} (${testId})`);
      return test;
    }
    
    console.warn(`⚠️ Test not found: ${testId}`);
    return null;
    
  } catch (error) {
    console.error('❌ Error getting test by ID:', error);
    return null;
  }
}

/**
 * Get subscription settings from localStorage
 * الحصول على إعدادات الاشتراك من localStorage
 */
export function getSubscriptionSettingsLocal() {
  try {
    if (typeof window === 'undefined') {
      return {
        freeTestsEnabled: true,
        freeTestsCount: 5,
        premiumRequired: false,
        globalFreeAccess: true,
        specificPremiumTests: []
      };
    }
    
    initializeLocalStorage();
    
    const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
    
    return {
      freeTestsEnabled: true,
      freeTestsCount: 5,
      premiumRequired: false,
      globalFreeAccess: true,
      specificPremiumTests: []
    };
    
  } catch (error) {
    console.error('❌ Error loading subscription settings:', error);
    return {
      freeTestsEnabled: true,
      freeTestsCount: 5,
      premiumRequired: false,
      globalFreeAccess: true,
      specificPremiumTests: []
    };
  }
}

/**
 * Save subscription settings to localStorage
 * حفظ إعدادات الاشتراك في localStorage
 */
export function saveSubscriptionSettingsLocal(settings: any): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_SETTINGS, JSON.stringify(settings));
    console.log('✅ Subscription settings saved to localStorage');
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', { detail: settings }));
    
  } catch (error) {
    console.error('❌ Error saving subscription settings:', error);
  }
}

/**
 * Get all test IDs for static generation
 * الحصول على جميع معرفات الاختبارات للإنشاء الثابت
 */
export function getAllTestIds(): string[] {
  try {
    return localDatabase.chemical_tests.map(test => test.id);
  } catch (error) {
    console.error('❌ Error getting test IDs:', error);
    return [];
  }
}

/**
 * Search tests by query
 * البحث في الاختبارات بالاستعلام
 */
export function searchTests(query: string, lang: 'ar' | 'en' = 'en'): ChemicalTest[] {
  try {
    const tests = getChemicalTestsLocal();
    const searchTerm = query.toLowerCase();
    
    return tests.filter(test => {
      const name = lang === 'ar' ? test.method_name_ar : test.method_name;
      const description = lang === 'ar' ? test.description_ar : test.description;
      const substance = lang === 'ar' ? test.possible_substance_ar : test.possible_substance;
      
      return (
        name?.toLowerCase().includes(searchTerm) ||
        description?.toLowerCase().includes(searchTerm) ||
        substance?.toLowerCase().includes(searchTerm) ||
        test.category?.toLowerCase().includes(searchTerm)
      );
    });
    
  } catch (error) {
    console.error('❌ Error searching tests:', error);
    return [];
  }
}

/**
 * Get tests by category
 * الحصول على الاختبارات حسب الفئة
 */
export function getTestsByCategory(category: string): ChemicalTest[] {
  try {
    const tests = getChemicalTestsLocal();
    return tests.filter(test => test.category === category);
  } catch (error) {
    console.error('❌ Error getting tests by category:', error);
    return [];
  }
}

/**
 * Clear all local storage data
 * مسح جميع بيانات التخزين المحلي
 */
export function clearLocalStorage(): void {
  try {
    if (typeof window === 'undefined') return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🗑️ Local storage cleared');
  } catch (error) {
    console.error('❌ Error clearing local storage:', error);
  }
}

/**
 * Force refresh data from JSON
 * إجبار تحديث البيانات من JSON
 */
export function refreshLocalData(): void {
  try {
    if (typeof window === 'undefined') return;
    
    // Clear existing data
    localStorage.removeItem(STORAGE_KEYS.CHEMICAL_TESTS);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
    
    // Reinitialize
    initializeLocalStorage();
    
    console.log('🔄 Local data refreshed from JSON');
  } catch (error) {
    console.error('❌ Error refreshing local data:', error);
  }
}
