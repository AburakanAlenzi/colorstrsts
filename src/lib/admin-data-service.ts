// خدمة البيانات المحسنة لصفحة الأدمن
// Enhanced Data Service for Admin Page

interface ChemicalTest {
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
  prepare?: string;
  prepare_ar?: string;
  test_type?: string;
  test_number?: string;
  reference?: string;
}

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

class AdminDataService {
  private static instance: AdminDataService;
  private chemicalTests: ChemicalTest[] = [];
  private colorResults: ColorResult[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AdminDataService {
    if (!AdminDataService.instance) {
      AdminDataService.instance = new AdminDataService();
    }
    return AdminDataService.instance;
  }

  /**
   * تهيئة الخدمة وتحميل البيانات
   * Initialize service and load data
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Promise.all([
        this.loadChemicalTests(),
        this.loadColorResults()
      ]);
      this.isInitialized = true;
      console.log('✅ Admin Data Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Admin Data Service:', error);
    }
  }

  /**
   * تحميل الاختبارات الكيميائية
   * Load chemical tests
   */
  private async loadChemicalTests(): Promise<void> {
    try {
      // Try to load from localStorage first
      const savedTests = localStorage.getItem('chemical_tests_admin');
      if (savedTests) {
        this.chemicalTests = JSON.parse(savedTests);
        console.log('📦 Loaded chemical tests from localStorage');
        return;
      }

      // Try to load from multiple paths
      const paths = [
        '/data/chemical-tests.json',
        '/src/data/chemical-tests.json'
      ];

      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const data = await response.json();
            this.chemicalTests = data;
            localStorage.setItem('chemical_tests_admin', JSON.stringify(data));
            console.log(`📦 Loaded chemical tests from ${path}`);
            return;
          }
        } catch (e) {
          console.warn(`⚠️ Could not load from ${path}`);
        }
      }

      // If all paths fail, use fallback data
      this.chemicalTests = this.getFallbackChemicalTests();
      localStorage.setItem('chemical_tests_admin', JSON.stringify(this.chemicalTests));
      console.log('📦 Using fallback chemical tests data');

    } catch (error) {
      console.error('Error loading chemical tests:', error);
      this.chemicalTests = this.getFallbackChemicalTests();
    }
  }

  /**
   * تحميل النتائج اللونية
   * Load color results
   */
  private async loadColorResults(): Promise<void> {
    try {
      // Try to load from localStorage first
      const savedResults = localStorage.getItem('color_results_admin');
      if (savedResults) {
        this.colorResults = JSON.parse(savedResults);
        console.log('🎨 Loaded color results from localStorage');
        return;
      }

      // Try to load from multiple paths
      const paths = [
        '/data/color-results.json',
        '/src/data/color-results.json'
      ];

      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const data = await response.json();
            this.colorResults = data;
            localStorage.setItem('color_results_admin', JSON.stringify(data));
            console.log(`🎨 Loaded color results from ${path}`);
            return;
          }
        } catch (e) {
          console.warn(`⚠️ Could not load from ${path}`);
        }
      }

      // If all paths fail, use fallback data
      this.colorResults = this.getFallbackColorResults();
      localStorage.setItem('color_results_admin', JSON.stringify(this.colorResults));
      console.log('🎨 Using fallback color results data');

    } catch (error) {
      console.error('Error loading color results:', error);
      this.colorResults = this.getFallbackColorResults();
    }
  }

  /**
   * الحصول على جميع الاختبارات الكيميائية
   * Get all chemical tests
   */
  async getChemicalTests(): Promise<ChemicalTest[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return [...this.chemicalTests];
  }

  /**
   * الحصول على جميع النتائج اللونية
   * Get all color results
   */
  async getColorResults(): Promise<ColorResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return [...this.colorResults];
  }

  /**
   * الحصول على النتائج اللونية لاختبار معين
   * Get color results for specific test
   */
  async getColorResultsByTestId(testId: string): Promise<ColorResult[]> {
    const allResults = await this.getColorResults();
    return allResults.filter(result => result.test_id === testId);
  }

  /**
   * إضافة اختبار كيميائي جديد
   * Add new chemical test
   */
  async addChemicalTest(test: ChemicalTest): Promise<void> {
    this.chemicalTests.push(test);
    localStorage.setItem('chemical_tests_admin', JSON.stringify(this.chemicalTests));
  }

  /**
   * تحديث اختبار كيميائي
   * Update chemical test
   */
  async updateChemicalTest(test: ChemicalTest): Promise<void> {
    const index = this.chemicalTests.findIndex(t => t.id === test.id);
    if (index !== -1) {
      this.chemicalTests[index] = test;
      localStorage.setItem('chemical_tests_admin', JSON.stringify(this.chemicalTests));
    }
  }

  /**
   * حذف اختبار كيميائي
   * Delete chemical test
   */
  async deleteChemicalTest(testId: string): Promise<void> {
    this.chemicalTests = this.chemicalTests.filter(t => t.id !== testId);
    localStorage.setItem('chemical_tests_admin', JSON.stringify(this.chemicalTests));
  }

  /**
   * إضافة نتيجة لونية جديدة
   * Add new color result
   */
  async addColorResult(result: ColorResult): Promise<void> {
    this.colorResults.push(result);
    localStorage.setItem('color_results_admin', JSON.stringify(this.colorResults));
  }

  /**
   * تحديث نتيجة لونية
   * Update color result
   */
  async updateColorResult(result: ColorResult): Promise<void> {
    const index = this.colorResults.findIndex(r => r.id === result.id);
    if (index !== -1) {
      this.colorResults[index] = result;
      localStorage.setItem('color_results_admin', JSON.stringify(this.colorResults));
    }
  }

  /**
   * حذف نتيجة لونية
   * Delete color result
   */
  async deleteColorResult(resultId: string): Promise<void> {
    this.colorResults = this.colorResults.filter(r => r.id !== resultId);
    localStorage.setItem('color_results_admin', JSON.stringify(this.colorResults));
  }

  /**
   * بيانات احتياطية للاختبارات الكيميائية
   * Fallback data for chemical tests
   */
  private getFallbackChemicalTests(): ChemicalTest[] {
    return [
      {
        id: "marquis-test",
        method_name: "Marquis Test",
        method_name_ar: "اختبار ماركيز",
        description: "For detecting opiates and amphetamines",
        description_ar: "للكشف عن الأفيونات والأمفيتامينات",
        category: "basic",
        safety_level: "high",
        preparation_time: 5,
        icon: "BeakerIcon",
        color_primary: "#8B5CF6",
        created_at: "2025-01-01T00:00:00Z",
        prepare: "1. Place a small amount of the suspected material on a spot plate.\n2. Add one drop of reagent IA (prepared by mixing 8-10 drops of 37% formaldehyde with 10 ml glacial acetic acid).\n3. Add 2–3 drops of reagent 1B (concentrated sulfuric acid).\n4. Observe the color change.",
        prepare_ar: "1. ضع كمية صغيرة من المادة المشتبه بها على طبق نقطي.\n2. أضف قطرة واحدة من الكاشف IA (محضر بخلط 8-10 قطرات من الفورمالديهايد 37% مع 10 مل من حمض الخليك الجليدي).\n3. أضف 2-3 قطرات من الكاشف 1B (حمض الكبريتيك المركز).\n4. راقب تغيير اللون.",
        test_type: "F/L",
        test_number: "Test 1",
        reference: "Auterhoff, H., Braun, D.. Arch.Pharm.(Weinheim), 306 (1973) 866."
      }
    ];
  }

  /**
   * بيانات احتياطية للنتائج اللونية
   * Fallback data for color results
   */
  private getFallbackColorResults(): ColorResult[] {
    return [
      {
        id: "marquis-purple-violet",
        test_id: "marquis-test",
        color_result: "Purple to violet",
        color_result_ar: "بنفسجي إلى بنفسجي داكن",
        color_hex: "#8B5CF6",
        possible_substance: "Opium, Morphine, Heroin",
        possible_substance_ar: "الأفيون، المورفين، الهيروين",
        confidence_level: "high"
      }
    ];
  }

  /**
   * إعادة تحميل البيانات من المصدر
   * Reload data from source
   */
  async reloadData(): Promise<void> {
    // Clear localStorage
    localStorage.removeItem('chemical_tests_admin');
    localStorage.removeItem('color_results_admin');
    
    // Reset state
    this.isInitialized = false;
    this.chemicalTests = [];
    this.colorResults = [];
    
    // Reload
    await this.initialize();
  }
}

export const adminDataService = AdminDataService.getInstance();
