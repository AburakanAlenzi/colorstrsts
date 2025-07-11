import { database } from './firebase';
import { ref, push, set, get, update, remove, child, query, orderByChild } from 'firebase/database';

export interface TestResult {
  id?: string;
  color_result: string;
  color_result_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
  hex_color?: string;
  rgb_color?: string;
  confidence_level?: number;
}

export interface ChemicalTest {
  id?: string;
  method_name: string;
  method_name_ar: string;
  test_type: string;
  test_number: string;
  prepare: string;
  prepare_ar: string;
  reference?: string;
  results: TestResult[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface TestStatistics {
  total_tests: number;
  total_results: number;
  unique_substances: number;
  unique_colors: number;
  tests_by_type: Record<string, number>;
}

class FirebaseTestsService {
  private testsRef = ref(database, 'chemical_tests');

  // إضافة اختبار جديد
  async addTest(test: Omit<ChemicalTest, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const newTestRef = push(this.testsRef);
      const testData: ChemicalTest = {
        ...test,
        id: newTestRef.key!,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await set(newTestRef, testData);
      return newTestRef.key!;
    } catch (error) {
      console.error('Error adding test:', error);
      throw new Error('Failed to add test');
    }
  }

  // تحديث اختبار موجود
  async updateTest(testId: string, updates: Partial<ChemicalTest>): Promise<void> {
    try {
      const testRef = ref(database, `chemical_tests/${testId}`);
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await update(testRef, updateData);
    } catch (error) {
      console.error('Error updating test:', error);
      throw new Error('Failed to update test');
    }
  }

  // حذف اختبار
  async deleteTest(testId: string): Promise<void> {
    try {
      const testRef = ref(database, `chemical_tests/${testId}`);
      await remove(testRef);
    } catch (error) {
      console.error('Error deleting test:', error);
      throw new Error('Failed to delete test');
    }
  }

  // جلب جميع الاختبارات
  async getAllTests(): Promise<ChemicalTest[]> {
    try {
      const snapshot = await get(this.testsRef);
      if (snapshot.exists()) {
        const testsData = snapshot.val();
        return Object.values(testsData) as ChemicalTest[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching tests:', error);
      throw new Error('Failed to fetch tests');
    }
  }

  // جلب اختبار واحد
  async getTest(testId: string): Promise<ChemicalTest | null> {
    try {
      const testRef = ref(database, `chemical_tests/${testId}`);
      const snapshot = await get(testRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as ChemicalTest;
      }
      return null;
    } catch (error) {
      console.error('Error fetching test:', error);
      throw new Error('Failed to fetch test');
    }
  }

  // البحث في الاختبارات
  async searchTests(searchQuery: string): Promise<ChemicalTest[]> {
    try {
      const tests = await this.getAllTests();
      const query = searchQuery.toLowerCase();
      
      return tests.filter(test => 
        test.method_name.toLowerCase().includes(query) ||
        test.method_name_ar.includes(query) ||
        test.test_type.toLowerCase().includes(query) ||
        test.results.some(result => 
          result.possible_substance.toLowerCase().includes(query) ||
          result.possible_substance_ar.includes(query) ||
          result.color_result.toLowerCase().includes(query) ||
          result.color_result_ar.includes(query)
        )
      );
    } catch (error) {
      console.error('Error searching tests:', error);
      throw new Error('Failed to search tests');
    }
  }

  // جلب الاختبارات حسب النوع
  async getTestsByType(testType: string): Promise<ChemicalTest[]> {
    try {
      const tests = await this.getAllTests();
      return tests.filter(test => test.test_type === testType);
    } catch (error) {
      console.error('Error fetching tests by type:', error);
      throw new Error('Failed to fetch tests by type');
    }
  }

  // إضافة نتيجة جديدة لاختبار موجود
  async addResultToTest(testId: string, result: TestResult): Promise<void> {
    try {
      const test = await this.getTest(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      const updatedResults = [...test.results, result];
      await this.updateTest(testId, { results: updatedResults });
    } catch (error) {
      console.error('Error adding result to test:', error);
      throw new Error('Failed to add result to test');
    }
  }

  // تحديث نتيجة في اختبار
  async updateTestResult(testId: string, resultIndex: number, updatedResult: TestResult): Promise<void> {
    try {
      const test = await this.getTest(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      if (resultIndex < 0 || resultIndex >= test.results.length) {
        throw new Error('Result index out of bounds');
      }

      const updatedResults = [...test.results];
      updatedResults[resultIndex] = updatedResult;
      
      await this.updateTest(testId, { results: updatedResults });
    } catch (error) {
      console.error('Error updating test result:', error);
      throw new Error('Failed to update test result');
    }
  }

  // حذف نتيجة من اختبار
  async deleteTestResult(testId: string, resultIndex: number): Promise<void> {
    try {
      const test = await this.getTest(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      if (resultIndex < 0 || resultIndex >= test.results.length) {
        throw new Error('Result index out of bounds');
      }

      const updatedResults = test.results.filter((_, index) => index !== resultIndex);
      await this.updateTest(testId, { results: updatedResults });
    } catch (error) {
      console.error('Error deleting test result:', error);
      throw new Error('Failed to delete test result');
    }
  }

  // جلب إحصائيات الاختبارات
  async getTestsStatistics(): Promise<TestStatistics> {
    try {
      const tests = await this.getAllTests();
      
      const totalTests = tests.length;
      const totalResults = tests.reduce((sum, test) => sum + test.results.length, 0);
      
      const uniqueSubstances = new Set();
      const uniqueColors = new Set();
      const testsByType: Record<string, number> = {};
      
      tests.forEach(test => {
        // Count test types
        testsByType[test.test_type] = (testsByType[test.test_type] || 0) + 1;
        
        // Count unique substances and colors
        test.results.forEach(result => {
          uniqueSubstances.add(result.possible_substance.toLowerCase());
          uniqueColors.add(result.color_result.toLowerCase());
        });
      });

      return {
        total_tests: totalTests,
        total_results: totalResults,
        unique_substances: uniqueSubstances.size,
        unique_colors: uniqueColors.size,
        tests_by_type: testsByType
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw new Error('Failed to get statistics');
    }
  }

  // نسخ البيانات من JSON إلى Firebase (للمرة الأولى فقط)
  async importFromJSON(jsonData: any[]): Promise<void> {
    try {
      const batch = jsonData.map(async (testData) => {
        const test: Omit<ChemicalTest, 'id' | 'created_at' | 'updated_at'> = {
          method_name: testData.method_name || '',
          method_name_ar: testData.method_name_ar || '',
          test_type: testData.test_type || '',
          test_number: testData.test_number || '',
          prepare: testData.prepare || '',
          prepare_ar: testData.prepare_ar || '',
          reference: testData.reference || '',
          results: testData.results || [],
          created_by: 'system_import'
        };
        
        return this.addTest(test);
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('Error importing from JSON:', error);
      throw new Error('Failed to import from JSON');
    }
  }
}

export const firebaseTestsService = new FirebaseTestsService();
