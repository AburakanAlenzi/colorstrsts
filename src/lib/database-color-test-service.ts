// خدمة تحميل البيانات من DatabaseColorTest.json
// Database Color Test Service

interface DatabaseColorTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  color_result: string;
  color_result_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
  prepare: string;
  prepare_ar: string;
  test_type: string;
  test_number: string;
  reference: string;
}

interface GroupedTest {
  method_name: string;
  method_name_ar: string;
  test_type: string;
  test_number: string;
  reference: string;
  prepare: string;
  prepare_ar: string;
  results: {
    color_result: string;
    color_result_ar: string;
    possible_substance: string;
    possible_substance_ar: string;
  }[];
  total_results: number;
}

class DatabaseColorTestService {
  private static instance: DatabaseColorTestService;
  private tests: DatabaseColorTest[] = [];
  private groupedTests: GroupedTest[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseColorTestService {
    if (!DatabaseColorTestService.instance) {
      DatabaseColorTestService.instance = new DatabaseColorTestService();
    }
    return DatabaseColorTestService.instance;
  }

  /**
   * تهيئة الخدمة وتحميل البيانات
   * Initialize service and load data
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadTests();
      this.groupTests();
      this.isInitialized = true;
      console.log('✅ Database Color Test Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Database Color Test Service:', error);
    }
  }

  /**
   * تحميل الاختبارات من DatabaseColorTest.json
   * Load tests from DatabaseColorTest.json
   */
  private async loadTests(): Promise<void> {
    try {
      // Try to load from localStorage first
      const savedTests = localStorage.getItem('database_color_tests');
      if (savedTests) {
        this.tests = JSON.parse(savedTests);
        console.log('📦 Loaded database color tests from localStorage');
        return;
      }

      // Try to load from multiple paths
      const paths = [
        '/data/DatabaseColorTest.json',
        './data/DatabaseColorTest.json',
        '/src/data/DatabaseColorTest.json'
      ];

      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const data = await response.json();
            this.tests = data;
            localStorage.setItem('database_color_tests', JSON.stringify(data));
            console.log(`📦 Loaded database color tests from ${path}`);
            return;
          }
        } catch (e) {
          console.warn(`⚠️ Could not load from ${path}`);
        }
      }

      // If all paths fail, use fallback data
      this.tests = this.getFallbackTests();
      localStorage.setItem('database_color_tests', JSON.stringify(this.tests));
      console.log('📦 Using fallback database color tests data');

    } catch (error) {
      console.error('Error loading database color tests:', error);
      this.tests = this.getFallbackTests();
    }
  }

  /**
   * تجميع الاختبارات حسب method_name
   * Group tests by method_name
   */
  private groupTests(): void {
    const groups = this.tests.reduce((acc, test) => {
      if (!acc[test.method_name]) {
        acc[test.method_name] = {
          method_name: test.method_name,
          method_name_ar: test.method_name_ar,
          test_type: test.test_type,
          test_number: test.test_number,
          reference: test.reference,
          prepare: test.prepare,
          prepare_ar: test.prepare_ar,
          results: [],
          total_results: 0
        };
      }

      acc[test.method_name].results.push({
        color_result: test.color_result,
        color_result_ar: test.color_result_ar,
        possible_substance: test.possible_substance,
        possible_substance_ar: test.possible_substance_ar
      });

      acc[test.method_name].total_results++;
      return acc;
    }, {} as Record<string, GroupedTest>);

    this.groupedTests = Object.values(groups);
  }

  /**
   * الحصول على جميع الاختبارات المجمعة
   * Get all grouped tests
   */
  async getGroupedTests(): Promise<GroupedTest[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return [...this.groupedTests];
  }

  /**
   * الحصول على اختبار محدد
   * Get specific test by method name
   */
  async getTestByMethodName(methodName: string): Promise<GroupedTest | null> {
    const tests = await this.getGroupedTests();
    return tests.find(test => test.method_name === methodName) || null;
  }

  /**
   * البحث في الاختبارات
   * Search tests
   */
  async searchTests(query: string): Promise<GroupedTest[]> {
    const tests = await this.getGroupedTests();
    const lowerQuery = query.toLowerCase();

    return tests.filter(test => 
      test.method_name.toLowerCase().includes(lowerQuery) ||
      test.method_name_ar.includes(query) ||
      test.results.some(result => 
        result.possible_substance.toLowerCase().includes(lowerQuery) ||
        result.possible_substance_ar.includes(query) ||
        result.color_result.toLowerCase().includes(lowerQuery) ||
        result.color_result_ar.includes(query)
      )
    );
  }

  /**
   * الحصول على إحصائيات الاختبارات
   * Get tests statistics
   */
  async getTestsStatistics(): Promise<{
    total_tests: number;
    total_results: number;
    unique_substances: number;
    unique_colors: number;
  }> {
    const tests = await this.getGroupedTests();
    
    const allSubstances = new Set<string>();
    const allColors = new Set<string>();
    let totalResults = 0;

    tests.forEach(test => {
      totalResults += test.total_results;
      test.results.forEach(result => {
        allSubstances.add(result.possible_substance);
        allColors.add(result.color_result);
      });
    });

    return {
      total_tests: tests.length,
      total_results: totalResults,
      unique_substances: allSubstances.size,
      unique_colors: allColors.size
    };
  }

  /**
   * بيانات احتياطية
   * Fallback data
   */
  private getFallbackTests(): DatabaseColorTest[] {
    return [
      {
        id: "marquis-test",
        method_name: "Marquis Test",
        method_name_ar: "اختبار ماركيز",
        color_result: "Purple to violet",
        color_result_ar: "بنفسجي إلى بنفسجي داكن",
        possible_substance: "Opium, Morphine, Heroin",
        possible_substance_ar: "الأفيون، المورفين، الهيروين",
        prepare: "1. Wear protective equipment.\n2. Place sample on spot plate.\n3. Add reagent.\n4. Observe color change.\n5. Dispose safely.",
        prepare_ar: "1. ارتدِ معدات الحماية.\n2. ضع العينة على الطبق.\n3. أضف الكاشف.\n4. راقب تغيير اللون.\n5. تخلص بأمان.",
        test_type: "F/L",
        test_number: "Test 1",
        reference: "Auterhoff, H., Braun, D.. Arch.Pharm.(Weinheim), 306 (1973) 866."
      }
    ];
  }

  /**
   * إعادة تحميل البيانات
   * Reload data
   */
  async reloadData(): Promise<void> {
    // Clear localStorage
    localStorage.removeItem('database_color_tests');
    
    // Reset state
    this.isInitialized = false;
    this.tests = [];
    this.groupedTests = [];
    
    // Reload
    await this.initialize();
  }

  /**
   * إضافة اختبار جديد
   * Add new test
   */
  async addTest(test: DatabaseColorTest): Promise<void> {
    this.tests.push(test);
    this.groupTests();
    localStorage.setItem('database_color_tests', JSON.stringify(this.tests));
  }

  /**
   * تحديث اختبار
   * Update test
   */
  async updateTest(test: DatabaseColorTest): Promise<void> {
    const index = this.tests.findIndex(t => t.id === test.id);
    if (index !== -1) {
      this.tests[index] = test;
      this.groupTests();
      localStorage.setItem('database_color_tests', JSON.stringify(this.tests));
    }
  }

  /**
   * حذف اختبار
   * Delete test
   */
  async deleteTest(testId: string): Promise<void> {
    this.tests = this.tests.filter(t => t.id !== testId);
    this.groupTests();
    localStorage.setItem('database_color_tests', JSON.stringify(this.tests));
  }
}

export const databaseColorTestService = DatabaseColorTestService.getInstance();
export type { DatabaseColorTest, GroupedTest };
