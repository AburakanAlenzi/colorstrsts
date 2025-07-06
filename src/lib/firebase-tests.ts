import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Types for Chemical Tests
export interface ChemicalTest {
  id?: string;
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
  reference?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  created_by?: string;
  updated_by?: string;
}

export interface TestChange {
  id?: string;
  test_id: string;
  operation: 'create' | 'update' | 'delete';
  admin_id: string;
  admin_email: string;
  timestamp: Timestamp;
  details: any;
  old_data?: any;
  new_data?: any;
}

export interface TestsFilter {
  search?: string;
  test_type?: string;
  possible_substance?: string;
}

export interface TestsPagination {
  page: number;
  limit: number;
  lastDoc?: DocumentSnapshot;
}

// Collection references
const TESTS_COLLECTION = 'chemical_tests';
const CHANGES_COLLECTION = 'test_changes';

// Helper function to generate test ID
export function generateTestId(methodName: string, testNumber: string): string {
  const cleanMethodName = methodName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  const cleanTestNumber = testNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return `${cleanMethodName}-${cleanTestNumber}`;
}

// Log test changes
async function logTestChange(change: Omit<TestChange, 'id' | 'timestamp'>): Promise<void> {
  try {
    const changesRef = collection(db, CHANGES_COLLECTION);
    await addDoc(changesRef, {
      ...change,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error logging test change:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

// Get all tests with pagination and filtering
export async function getTests(
  pagination: TestsPagination,
  filters: TestsFilter = {}
): Promise<{ tests: ChemicalTest[], hasMore: boolean, lastDoc?: DocumentSnapshot }> {
  try {
    const testsRef = collection(db, TESTS_COLLECTION);
    let q = query(testsRef, orderBy('created_at', 'desc'));

    // Apply filters
    if (filters.test_type) {
      q = query(q, where('test_type', '==', filters.test_type));
    }

    // Apply pagination
    if (pagination.lastDoc) {
      q = query(q, startAfter(pagination.lastDoc));
    }
    
    q = query(q, limit(pagination.limit + 1)); // Get one extra to check if there are more

    const snapshot = await getDocs(q);
    const tests: ChemicalTest[] = [];
    let hasMore = false;
    let lastDoc: DocumentSnapshot | undefined;

    snapshot.docs.forEach((doc, index) => {
      if (index < pagination.limit) {
        const data = doc.data();
        tests.push({
          id: doc.id,
          ...data,
          created_at: data.created_at || Timestamp.now(),
          updated_at: data.updated_at || Timestamp.now()
        } as ChemicalTest);
        lastDoc = doc;
      } else {
        hasMore = true;
      }
    });

    // Apply client-side search filter (for simplicity)
    let filteredTests = tests;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredTests = tests.filter(test => 
        test.method_name.toLowerCase().includes(searchTerm) ||
        test.method_name_ar.includes(searchTerm) ||
        test.possible_substance.toLowerCase().includes(searchTerm) ||
        test.possible_substance_ar.includes(searchTerm) ||
        test.color_result.toLowerCase().includes(searchTerm) ||
        test.color_result_ar.includes(searchTerm)
      );
    }

    if (filters.possible_substance) {
      filteredTests = filteredTests.filter(test => 
        test.possible_substance.toLowerCase().includes(filters.possible_substance!.toLowerCase()) ||
        test.possible_substance_ar.includes(filters.possible_substance!)
      );
    }

    return { tests: filteredTests, hasMore, lastDoc };
  } catch (error) {
    console.error('Error getting tests:', error);
    throw new Error('Failed to fetch tests');
  }
}

// Get single test by ID
export async function getTestById(id: string): Promise<ChemicalTest | null> {
  try {
    const testRef = doc(db, TESTS_COLLECTION, id);
    const snapshot = await getDoc(testRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        created_at: data.created_at || Timestamp.now(),
        updated_at: data.updated_at || Timestamp.now()
      } as ChemicalTest;
    }

    return null;
  } catch (error) {
    console.error('Error getting test:', error);
    throw new Error('Failed to fetch test');
  }
}

// Create new test
export async function createTest(
  testData: Omit<ChemicalTest, 'id' | 'created_at' | 'updated_at'>,
  adminId: string,
  adminEmail: string
): Promise<string> {
  try {
    const testsRef = collection(db, TESTS_COLLECTION);

    // Generate ID if not provided
    const testId = generateTestId(testData.method_name, testData.test_number);

    // Check if test with this ID already exists
    const existingTest = await getTestById(testId);
    if (existingTest) {
      throw new Error('Test with this name and number already exists');
    }

    const now = Timestamp.now();
    const newTest: Omit<ChemicalTest, 'id'> = {
      ...testData,
      created_at: now,
      updated_at: now,
      created_by: adminId,
      updated_by: adminId
    };

    // Use custom ID
    const testRef = doc(db, TESTS_COLLECTION, testId);
    await updateDoc(testRef, newTest);

    // Log the change
    await logTestChange({
      test_id: testId,
      operation: 'create',
      admin_id: adminId,
      admin_email: adminEmail,
      details: `Created test: ${testData.method_name}`,
      new_data: newTest
    });

    return testId;
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
}

// Update existing test
export async function updateTest(
  id: string,
  testData: Partial<Omit<ChemicalTest, 'id' | 'created_at' | 'created_by'>>,
  adminId: string,
  adminEmail: string
): Promise<void> {
  try {
    const testRef = doc(db, TESTS_COLLECTION, id);

    // Get old data for logging
    const oldTest = await getTestById(id);
    if (!oldTest) {
      throw new Error('Test not found');
    }

    const updatedData = {
      ...testData,
      updated_at: Timestamp.now(),
      updated_by: adminId
    };

    await updateDoc(testRef, updatedData);

    // Log the change
    await logTestChange({
      test_id: id,
      operation: 'update',
      admin_id: adminId,
      admin_email: adminEmail,
      details: `Updated test: ${oldTest.method_name}`,
      old_data: oldTest,
      new_data: { ...oldTest, ...updatedData }
    });
  } catch (error) {
    console.error('Error updating test:', error);
    throw error;
  }
}

// Delete test
export async function deleteTest(
  id: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  try {
    const testRef = doc(db, TESTS_COLLECTION, id);

    // Get test data for logging
    const testData = await getTestById(id);
    if (!testData) {
      throw new Error('Test not found');
    }

    await deleteDoc(testRef);

    // Log the change
    await logTestChange({
      test_id: id,
      operation: 'delete',
      admin_id: adminId,
      admin_email: adminEmail,
      details: `Deleted test: ${testData.method_name}`,
      old_data: testData
    });
  } catch (error) {
    console.error('Error deleting test:', error);
    throw error;
  }
}

// Get test statistics
export async function getTestsStatistics(): Promise<{
  total: number;
  byType: Record<string, number>;
  recentTests: ChemicalTest[];
}> {
  try {
    const testsRef = collection(db, TESTS_COLLECTION);
    const snapshot = await getDocs(testsRef);

    const tests: ChemicalTest[] = [];
    const byType: Record<string, number> = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data() as ChemicalTest;
      tests.push({ id: doc.id, ...data });

      byType[data.test_type] = (byType[data.test_type] || 0) + 1;
    });

    // Get recent tests (last 5)
    const recentQuery = query(testsRef, orderBy('created_at', 'desc'), limit(5));
    const recentSnapshot = await getDocs(recentQuery);
    const recentTests: ChemicalTest[] = recentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChemicalTest));

    return {
      total: tests.length,
      byType,
      recentTests
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw new Error('Failed to fetch statistics');
  }
}

// Bulk import tests
export async function importTests(
  tests: Omit<ChemicalTest, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>[],
  adminId: string,
  adminEmail: string
): Promise<{ success: number; errors: string[] }> {
  const batch = writeBatch(db);
  const errors: string[] = [];
  let success = 0;

  try {
    const now = Timestamp.now();

    for (const testData of tests) {
      try {
        const testId = generateTestId(testData.method_name, testData.test_number);

        // Check if test already exists
        const existingTest = await getTestById(testId);
        if (existingTest) {
          errors.push(`Test "${testData.method_name}" already exists`);
          continue;
        }

        const testRef = doc(db, TESTS_COLLECTION, testId);
        batch.set(testRef, {
          ...testData,
          created_at: now,
          updated_at: now,
          created_by: adminId,
          updated_by: adminId
        });

        success++;
      } catch (error) {
        errors.push(`Error processing test "${testData.method_name}": ${error}`);
      }
    }

    if (success > 0) {
      await batch.commit();

      // Log the bulk import
      await logTestChange({
        test_id: 'bulk-import',
        operation: 'create',
        admin_id: adminId,
        admin_email: adminEmail,
        details: `Bulk imported ${success} tests`,
        new_data: { count: success, errors: errors.length }
      });
    }

    return { success, errors };
  } catch (error) {
    console.error('Error importing tests:', error);
    throw new Error('Failed to import tests');
  }
}

// Export all tests
export async function exportTests(): Promise<ChemicalTest[]> {
  try {
    const testsRef = collection(db, TESTS_COLLECTION);
    const snapshot = await getDocs(query(testsRef, orderBy('method_name')));

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChemicalTest));
  } catch (error) {
    console.error('Error exporting tests:', error);
    throw new Error('Failed to export tests');
  }
}

// Get test changes log
export async function getTestChanges(limit: number = 50): Promise<TestChange[]> {
  try {
    const changesRef = collection(db, CHANGES_COLLECTION);
    const q = query(changesRef, orderBy('timestamp', 'desc'), limit(limit));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestChange));
  } catch (error) {
    console.error('Error getting test changes:', error);
    throw new Error('Failed to fetch test changes');
  }
}

// Get unique test types
export async function getTestTypes(): Promise<string[]> {
  try {
    const testsRef = collection(db, TESTS_COLLECTION);
    const snapshot = await getDocs(testsRef);

    const types = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.test_type) {
        types.add(data.test_type);
      }
    });

    return Array.from(types).sort();
  } catch (error) {
    console.error('Error getting test types:', error);
    return [];
  }
}

// Get unique substances
export async function getSubstances(): Promise<string[]> {
  try {
    const testsRef = collection(db, TESTS_COLLECTION);
    const snapshot = await getDocs(testsRef);

    const substances = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.possible_substance) {
        substances.add(data.possible_substance);
      }
    });

    return Array.from(substances).sort();
  } catch (error) {
    console.error('Error getting substances:', error);
    return [];
  }
}
