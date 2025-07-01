// خدمة استخراج بيانات الاختبارات من النتائج اللونية
// Test Data Extractor Service from Color Results

interface ColorResult {
  id: string;
  test_id: string;
  color_result: string;
  color_result_ar: string;
  color_hex: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: string;
}

interface ExtractedTest {
  test_id: string;
  test_name: string;
  test_name_ar: string;
  color_results: {
    color_result: string;
    color_result_ar: string;
    color_hex: string;
    possible_substance: string;
    possible_substance_ar: string;
    confidence_level: string;
  }[];
  category: string;
  total_results: number;
  high_confidence_results: number;
}

class TestDataExtractor {
  private static instance: TestDataExtractor;
  private colorResults: ColorResult[] = [];
  private extractedTests: ExtractedTest[] = [];

  private constructor() {}

  public static getInstance(): TestDataExtractor {
    if (!TestDataExtractor.instance) {
      TestDataExtractor.instance = new TestDataExtractor();
    }
    return TestDataExtractor.instance;
  }

  /**
   * تحميل النتائج اللونية
   * Load color results
   */
  async loadColorResults(): Promise<void> {
    try {
      // Try to load from multiple paths
      const paths = [
        '/data/color-results.json',
        '/src/data/color-results.json'
      ];

      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            this.colorResults = await response.json();
            console.log(`✅ Loaded ${this.colorResults.length} color results from ${path}`);
            return;
          }
        } catch (e) {
          console.warn(`⚠️ Could not load from ${path}`);
        }
      }

      throw new Error('Could not load color results from any path');
    } catch (error) {
      console.error('Error loading color results:', error);
      this.colorResults = [];
    }
  }

  /**
   * استخراج الاختبارات من النتائج اللونية
   * Extract tests from color results
   */
  extractTests(): ExtractedTest[] {
    if (this.colorResults.length === 0) {
      return [];
    }

    // Group results by test_id
    const testGroups = this.colorResults.reduce((groups, result) => {
      if (!groups[result.test_id]) {
        groups[result.test_id] = [];
      }
      groups[result.test_id].push(result);
      return groups;
    }, {} as Record<string, ColorResult[]>);

    // Convert groups to ExtractedTest objects
    this.extractedTests = Object.entries(testGroups).map(([testId, results]) => {
      const testName = this.generateTestName(testId);
      const testNameAr = this.generateTestNameAr(testId);
      const category = this.determineCategory(testId, results);

      return {
        test_id: testId,
        test_name: testName,
        test_name_ar: testNameAr,
        color_results: results.map(result => ({
          color_result: result.color_result,
          color_result_ar: result.color_result_ar,
          color_hex: result.color_hex,
          possible_substance: result.possible_substance,
          possible_substance_ar: result.possible_substance_ar,
          confidence_level: result.confidence_level
        })),
        category,
        total_results: results.length,
        high_confidence_results: results.filter(r => 
          r.confidence_level === 'very_high' || r.confidence_level === 'high'
        ).length
      };
    });

    return this.extractedTests;
  }

  /**
   * إنشاء اسم الاختبار من test_id
   * Generate test name from test_id
   */
  private generateTestName(testId: string): string {
    const nameMap: Record<string, string> = {
      'marquis-test': 'Marquis Test',
      'mecke-test': 'Mecke Test',
      'ferric-sulfate-test': 'Ferric Sulfate Test',
      'nitric-acid-test': 'Nitric Acid Test',
      'fast-blue-b-test': 'Fast Blue B Test',
      'duquenois-levine-test': 'Duquenois-Levine Test',
      'cobalt-thiocyanate-test': 'Cobalt Thiocyanate Test',
      'scott-test': 'Scott Test',
      'wagner-test': 'Wagner Test',
      'simon-test': 'Simon Test',
      'ehrlich-test': 'Ehrlich Test',
      'liebermann-test': 'Liebermann Test',
      'potassium-dichromate-test': 'Potassium Dichromate Test'
    };

    return nameMap[testId] || this.formatTestId(testId);
  }

  /**
   * إنشاء اسم الاختبار بالعربية من test_id
   * Generate Arabic test name from test_id
   */
  private generateTestNameAr(testId: string): string {
    const nameMapAr: Record<string, string> = {
      'marquis-test': 'اختبار ماركيز',
      'mecke-test': 'اختبار ميك',
      'ferric-sulfate-test': 'اختبار كبريتات الحديد',
      'nitric-acid-test': 'اختبار حمض النيتريك',
      'fast-blue-b-test': 'اختبار الأزرق السريع ب',
      'duquenois-levine-test': 'اختبار دوكينويس-ليفين',
      'cobalt-thiocyanate-test': 'اختبار ثيوسيانات الكوبالت',
      'scott-test': 'اختبار سكوت',
      'wagner-test': 'اختبار واجنر',
      'simon-test': 'اختبار سايمون',
      'ehrlich-test': 'اختبار إيرليش',
      'liebermann-test': 'اختبار ليبرمان',
      'potassium-dichromate-test': 'اختبار ثنائي كرومات البوتاسيوم'
    };

    return nameMapAr[testId] || this.formatTestIdAr(testId);
  }

  /**
   * تحديد فئة الاختبار
   * Determine test category
   */
  private determineCategory(testId: string, results: ColorResult[]): string {
    // Basic tests - commonly used
    const basicTests = [
      'marquis-test', 
      'mecke-test', 
      'ferric-sulfate-test', 
      'nitric-acid-test'
    ];

    // Advanced tests - specialized
    const advancedTests = [
      'fast-blue-b-test', 
      'duquenois-levine-test', 
      'cobalt-thiocyanate-test', 
      'scott-test'
    ];

    // Specialized tests - specific substances
    const specializedTests = [
      'wagner-test', 
      'simon-test', 
      'ehrlich-test', 
      'liebermann-test', 
      'potassium-dichromate-test'
    ];

    if (basicTests.includes(testId)) {
      return 'basic';
    } else if (advancedTests.includes(testId)) {
      return 'advanced';
    } else if (specializedTests.includes(testId)) {
      return 'specialized';
    }

    // Determine by number of results and confidence
    const highConfidenceCount = results.filter(r => 
      r.confidence_level === 'very_high' || r.confidence_level === 'high'
    ).length;

    if (results.length >= 4 && highConfidenceCount >= 2) {
      return 'basic';
    } else if (results.length >= 3) {
      return 'advanced';
    } else {
      return 'specialized';
    }
  }

  /**
   * تنسيق test_id إلى اسم قابل للقراءة
   * Format test_id to readable name
   */
  private formatTestId(testId: string): string {
    return testId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * تنسيق test_id إلى اسم عربي
   * Format test_id to Arabic name
   */
  private formatTestIdAr(testId: string): string {
    return `اختبار ${testId.replace(/-/g, ' ')}`;
  }

  /**
   * الحصول على جميع الاختبارات المستخرجة
   * Get all extracted tests
   */
  async getExtractedTests(): Promise<ExtractedTest[]> {
    if (this.colorResults.length === 0) {
      await this.loadColorResults();
    }
    
    if (this.extractedTests.length === 0) {
      this.extractTests();
    }

    return this.extractedTests;
  }

  /**
   * الحصول على اختبار محدد
   * Get specific test
   */
  async getTestById(testId: string): Promise<ExtractedTest | null> {
    const tests = await this.getExtractedTests();
    return tests.find(test => test.test_id === testId) || null;
  }

  /**
   * البحث في الاختبارات
   * Search tests
   */
  async searchTests(query: string): Promise<ExtractedTest[]> {
    const tests = await this.getExtractedTests();
    const lowerQuery = query.toLowerCase();

    return tests.filter(test => 
      test.test_name.toLowerCase().includes(lowerQuery) ||
      test.test_name_ar.includes(query) ||
      test.test_id.includes(lowerQuery) ||
      test.color_results.some(result => 
        result.possible_substance.toLowerCase().includes(lowerQuery) ||
        result.possible_substance_ar.includes(query)
      )
    );
  }

  /**
   * تصفية الاختبارات حسب الفئة
   * Filter tests by category
   */
  async getTestsByCategory(category: string): Promise<ExtractedTest[]> {
    const tests = await this.getExtractedTests();
    return tests.filter(test => test.category === category);
  }

  /**
   * الحصول على إحصائيات الاختبارات
   * Get tests statistics
   */
  async getTestsStatistics(): Promise<{
    total: number;
    basic: number;
    advanced: number;
    specialized: number;
    totalResults: number;
    highConfidenceResults: number;
  }> {
    const tests = await this.getExtractedTests();

    return {
      total: tests.length,
      basic: tests.filter(t => t.category === 'basic').length,
      advanced: tests.filter(t => t.category === 'advanced').length,
      specialized: tests.filter(t => t.category === 'specialized').length,
      totalResults: tests.reduce((sum, test) => sum + test.total_results, 0),
      highConfidenceResults: tests.reduce((sum, test) => sum + test.high_confidence_results, 0)
    };
  }

  /**
   * إعادة تحميل البيانات
   * Reload data
   */
  async reloadData(): Promise<void> {
    this.colorResults = [];
    this.extractedTests = [];
    await this.loadColorResults();
    this.extractTests();
  }
}

export const testDataExtractor = TestDataExtractor.getInstance();
export type { ExtractedTest, ColorResult };
